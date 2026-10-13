import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { redis, invalidateEmailCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';

  try {
    let query = supabase
      .from('allowed_emails')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      emails: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error listing whitelist:', error);
    return NextResponse.json({ error: 'Failed to list whitelist emails' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    let emailList: Array<{ email: string; fullName: string; role: string }> = [];
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const defaultRole = (formData.get('role') as string) || 'participant';

      if (file && typeof file === 'object' && 'text' in file) {
        const text = await (file as Blob).text();
        const { extractParticipantsFromCSV } = await import('@/lib/csv');
        const extracted = extractParticipantsFromCSV(text, defaultRole);
        emailList = extracted.participants;
      }
    } else {
      const body = await request.json();
      const { email, emails, role = 'participant', fullName = '', participants } = body;

      if (Array.isArray(participants) && participants.length > 0) {
        // Direct list of parsed participant objects from client
        for (const p of participants) {
          if (p && typeof p.email === 'string') {
            const trimmed = p.email.trim().toLowerCase();
            if (trimmed.includes('@') && trimmed.includes('.')) {
              emailList.push({
                email: trimmed,
                fullName: typeof p.fullName === 'string' ? p.fullName.trim() : '',
                role: p.role || role || 'participant',
              });
            }
          }
        }
      } else if (emails && typeof emails === 'string') {
        // Check if bulk text looks like CSV with names or simple lines
        const lines = emails.split(/[\r\n]+/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.includes(',')) {
            // Comma-separated: check if name,email or email,name
            const parts = trimmed.split(',').map((s) => s.trim());
            const emailPart = parts.find((p) => p.includes('@'));
            const namePart = parts.find((p) => !p.includes('@')) || '';
            if (emailPart) {
              emailList.push({
                email: emailPart.toLowerCase(),
                fullName: namePart,
                role,
              });
            }
          } else if (trimmed.includes('@')) {
            emailList.push({
              email: trimmed.toLowerCase(),
              fullName: '',
              role,
            });
          }
        }
      } else if (Array.isArray(emails)) {
        emailList = emails
          .filter((e) => typeof e === 'string' && e.includes('@'))
          .map((e) => ({ email: e.trim().toLowerCase(), fullName: '', role }));
      } else if (email && typeof email === 'string' && email.includes('@')) {
        emailList.push({
          email: email.trim().toLowerCase(),
          fullName: fullName.trim(),
          role,
        });
      }
    }

    if (emailList.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses found in the provided input or file' },
        { status: 400 }
      );
    }

    // 1. Deduplicate within the incoming batch by email
    const emailMap = new Map<string, { email: string; fullName: string; role: string }>();
    let intraBatchDuplicates = 0;

    for (const item of emailList) {
      const existing = emailMap.get(item.email);
      if (!existing) {
        emailMap.set(item.email, item);
      } else {
        intraBatchDuplicates++;
        emailMap.set(item.email, {
          email: item.email,
          fullName: item.fullName || existing.fullName,
          role: item.role || existing.role,
        });
      }
    }

    const dedupedEmailList = Array.from(emailMap.values());
    const allEmails = dedupedEmailList.map((i) => i.email);

    // 2. Fetch existing records to:
    //    a) Safely preserve elevated roles (NEVER demote admins)
    //    b) Preserve existing participant records without deletion
    //    c) Calculate accurate newAdded vs existingPreserved counts
    const existingRecordsMap = new Map<string, { role: string; full_name: string | null }>();
    const CHUNK_QUERY_SIZE = 500;

    for (let i = 0; i < allEmails.length; i += CHUNK_QUERY_SIZE) {
      const emailChunk = allEmails.slice(i, i + CHUNK_QUERY_SIZE);
      const { data: existingRows, error: queryErr } = await supabase
        .from('allowed_emails')
        .select('email, role, full_name')
        .in('email', emailChunk);

      if (queryErr) {
        console.warn('Warning querying existing allowed_emails:', queryErr);
      } else if (existingRows) {
        for (const row of existingRows) {
          existingRecordsMap.set(row.email.toLowerCase(), {
            role: row.role,
            full_name: row.full_name,
          });
        }
      }
    }

    let newAddedCount = 0;
    let existingPreservedCount = 0;

    const recordsToInsert = dedupedEmailList.map((item) => {
      const existing = existingRecordsMap.get(item.email);

      if (existing) {
        existingPreservedCount++;
        // PRESERVE admin role if user is already an admin
        const finalRole = existing.role === 'admin' ? 'admin' : (item.role || existing.role || 'participant');
        // Update name if new name is provided, else keep existing name
        const finalName = item.fullName || existing.full_name || null;

        return {
          email: item.email,
          full_name: finalName,
          role: finalRole,
          is_active: true,
          added_by: session.email,
        };
      } else {
        newAddedCount++;
        return {
          email: item.email,
          full_name: item.fullName || null,
          role: item.role || 'participant',
          is_active: true,
          added_by: session.email,
        };
      }
    });

    // 3. Batch upsert in chunks of 200 for maximum reliability
    const UPSERT_CHUNK_SIZE = 200;
    for (let i = 0; i < recordsToInsert.length; i += UPSERT_CHUNK_SIZE) {
      const chunk = recordsToInsert.slice(i, i + UPSERT_CHUNK_SIZE);
      const { error: upsertErr } = await supabase
        .from('allowed_emails')
        .upsert(chunk, { onConflict: 'email' });

      if (upsertErr) {
        console.error('Error upserting batch chunk:', upsertErr);
        throw upsertErr;
      }
    }

    // 4. Update Upstash Redis cache (if configured)
    if (redis) {
      for (const item of recordsToInsert) {
        try {
          await redis.set(
            `whitelist:${item.email}`,
            { role: item.role, fullName: item.full_name || '' },
            { ex: 3600 }
          );
        } catch (cacheErr) {
          console.warn('Error populating redis:', cacheErr);
        }
      }
      try {
        await redis.del('admin:config_and_stats', 'admin:stats_overview');
      } catch {}
    }

    const message = `Successfully processed ${dedupedEmailList.length} unique participant(s): ${newAddedCount} new member(s) added, ${existingPreservedCount} existing member(s) preserved. No previous members were deleted.`;

    return NextResponse.json({
      success: true,
      message,
      totalProcessed: dedupedEmailList.length,
      addedCount: newAddedCount,
      existingCount: existingPreservedCount,
      duplicateCount: intraBatchDuplicates,
    });
  } catch (error: any) {
    console.error('Error adding whitelist emails:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add emails to whitelist' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, isActive, role } = body;

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const updates: any = {};
    if (typeof isActive === 'boolean') updates.is_active = isActive;
    if (role) updates.role = role;

    const { data, error } = await supabase
      .from('allowed_emails')
      .update(updates)
      .ilike('email', email.trim().toLowerCase())
      .select()
      .single();

    if (error) throw error;

    await invalidateEmailCache(email);

    return NextResponse.json({
      success: true,
      message: 'Updated email authorization status',
      data,
    });
  } catch (error) {
    console.error('Error updating whitelist:', error);
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('allowed_emails')
      .delete()
      .ilike('email', email.trim().toLowerCase());

    if (error) throw error;

    await invalidateEmailCache(email);

    return NextResponse.json({
      success: true,
      message: `Deleted ${email} from authorized whitelist`,
    });
  } catch (error) {
    console.error('Error deleting email:', error);
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 });
  }
}
