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
    const body = await request.json();
    const { email, emails, role = 'participant', fullName = '' } = body;

    // Support both single email or bulk text/array
    let emailList: Array<{ email: string; fullName: string; role: string }> = [];

    if (emails && typeof emails === 'string') {
      // Parse bulk comma or newline separated string
      const lines = emails.split(/[\n,;]+/);
      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        if (trimmed && trimmed.includes('@')) {
          emailList.push({ email: trimmed, fullName: '', role });
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

    if (emailList.length === 0) {
      return NextResponse.json(
        { error: 'No valid email addresses provided' },
        { status: 400 }
      );
    }

    // Deduplicate within the same batch by email to avoid PostgreSQL error 21000:
    // "ON CONFLICT DO UPDATE command cannot affect row a second time"
    const emailMap = new Map<string, { email: string; fullName: string; role: string }>();
    let intraBatchDuplicates = 0;

    for (const item of emailList) {
      const existing = emailMap.get(item.email);
      if (!existing) {
        emailMap.set(item.email, item);
      } else {
        intraBatchDuplicates++;
        // Merge attributes if duplicate has non-empty values
        emailMap.set(item.email, {
          email: item.email,
          fullName: item.fullName || existing.fullName,
          role: item.role || existing.role,
        });
      }
    }

    const dedupedEmailList = Array.from(emailMap.values());

    const recordsToInsert = dedupedEmailList.map((item) => ({
      email: item.email,
      full_name: item.fullName || null,
      role: item.role,
      is_active: true,
      added_by: session.email,
    }));

    const { data, error } = await supabase
      .from('allowed_emails')
      .upsert(recordsToInsert, { onConflict: 'email' })
      .select();

    if (error) throw error;

    // Cache in Upstash Redis
    if (redis) {
      for (const item of dedupedEmailList) {
        try {
          await redis.set(
            `whitelist:${item.email}`,
            { role: item.role, fullName: item.fullName },
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

    const duplicateNotice =
      intraBatchDuplicates > 0
        ? ` (${intraBatchDuplicates} intra-batch duplicate(s) reconciled)`
        : '';

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${dedupedEmailList.length} unique email(s) for access${duplicateNotice}.`,
      addedCount: dedupedEmailList.length,
      duplicateCount: intraBatchDuplicates,
      data,
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
