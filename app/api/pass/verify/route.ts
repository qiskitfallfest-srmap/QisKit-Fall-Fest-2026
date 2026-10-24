import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { contactStatus } from '@/lib/contact-server';
import { normalizePhone } from '@/lib/phone';
import { isSrmApEmail } from '@/lib/participant-track';

export const dynamic = 'force-dynamic';

// Strip characters that carry meaning inside a PostgREST .or() filter string
function sanitizeFilterTerm(value: string): string {
  return value.replace(/[^a-zA-Z0-9@._+-]/g, '').slice(0, 100);
}

type StayState = 'stay' | 'declined' | 'cancelled' | 'not_answered' | 'not_applicable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token')?.trim();
    const query = searchParams.get('q')?.trim();

    if (!token && !query) {
      return NextResponse.json(
        { error: 'Missing verification token or search parameter.' },
        { status: 400 }
      );
    }

    const session = await getServerSession().catch(() => null);
    const isStaff = Boolean(session?.isAdmin);

    // Free-text lookup exposes attendee data, so it is limited to organizer accounts
    if (query && !token && !isStaff) {
      return NextResponse.json(
        { error: 'Sign in with an organizer account to search passes.' },
        { status: 403 }
      );
    }

    let passQuery = supabaseAdmin.from('festival_pass_claims').select('*');

    if (token) {
      passQuery = passQuery.eq('qr_code_token', token);
    } else if (query) {
      const term = sanitizeFilterTerm(query);
      if (!term) {
        return NextResponse.json({ valid: false, error: 'Invalid search term.' }, { status: 400 });
      }
      passQuery = passQuery.or(
        `transaction_reference.ilike.${term},user_email.ilike.%${term}%`
      );
    }

    const { data: pass, error } = await passQuery.limit(1).maybeSingle();

    if (error) {
      console.error('[Pass Verify Query Error]:', error);
      return NextResponse.json(
        { error: 'Database error searching for pass.' },
        { status: 500 }
      );
    }

    if (!pass) {
      return NextResponse.json(
        {
          valid: false,
          error: 'No festival pass found matching the scanned QR code or identifier.',
        },
        { status: 404 }
      );
    }

    const publicFields = {
      id: pass.id,
      userName: pass.user_name,
      passTier: pass.pass_tier,
      institution: pass.institution || 'SRM University AP',
      status: pass.status,
      amountInr: pass.amount_inr,
      checkedIn: Boolean(pass.checked_in),
      checkedInAt: pass.checked_in_at,
    };

    const email = String(pass.user_email || '').trim().toLowerCase();
    const [accRes, leadRes, memberRes, transportRes, contact] = await Promise.all([
      supabaseAdmin
        .from('accommodation_requests')
        .select('*')
        .ilike('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin.from('hackathon_teams').select('name').ilike('lead_email', email).limit(1).maybeSingle(),
      supabaseAdmin
        .from('team_members')
        .select('hackathon_teams(name)')
        .ilike('email', email)
        .eq('status', 'accepted')
        .limit(1)
        .maybeSingle(),
      isStaff
        ? supabaseAdmin
            .from('transport_requests')
            .select('needs_transport, boarding_point, boarding_other')
            .ilike('email', email)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      isStaff ? contactStatus(email) : Promise.resolve(null),
    ]);

    const acc = accRes.data;
    // SRM AP students live on or commute to campus; the stay question is only asked of external participants
    const stayState: StayState = isSrmApEmail(email)
      ? 'not_applicable'
      : !acc
        ? 'not_answered'
        : acc.status === 'cancelled'
          ? 'cancelled'
          : acc.needs_accommodation
            ? 'stay'
            : 'declined';

    // Shown on every scan so the Gate 3 team can see the stay without signing in.
    // Phone numbers, email and the attendee's private note stay with organizer accounts.
    const accommodation = {
      state: stayState,
      allocated: acc?.status === 'allocated',
      gender: acc?.gender ?? null,
      checkIn: acc?.check_in ?? null,
      checkOut: acc?.check_out ?? null,
      arrivalTime: acc?.arrival_time ?? null,
      allocationNotes: acc?.allocation_notes ?? null,
      hasNote: Boolean(acc?.notes?.trim()),
      ...(isStaff
        ? {
            travellingFrom: acc?.travelling_from ?? null,
            arrivalMode: acc?.arrival_mode ?? null,
            arrivalPoint: acc?.arrival_point ?? null,
            notes: acc?.notes ?? null,
          }
        : {}),
    };

    const teamName = leadRes.data?.name || (memberRes.data as any)?.hackathon_teams?.name || null;
    const hackathon = teamName ? { teamName, role: leadRes.data ? 'Team Lead' : 'Member' } : null;

    if (!isStaff) {
      return NextResponse.json({
        valid: pass.status !== 'rejected',
        isStaff: false,
        pass: { ...publicFields, accommodation, hackathon },
      });
    }

    const tr = transportRes.data;
    const transport = tr?.needs_transport
      ? { boardingPoint: tr.boarding_other || tr.boarding_point || 'Not specified' }
      : null;
    const rawPhone = contact?.phone || pass.contact_phone || acc?.phone || null;

    return NextResponse.json({
      valid: pass.status !== 'rejected',
      isStaff: true,
      pass: {
        ...publicFields,
        accommodation,
        hackathon,
        transport,
        userEmail: pass.user_email,
        transactionReference: pass.transaction_reference,
        phone: normalizePhone(rawPhone) || rawPhone,
        emergencyName: contact?.emergencyName ?? null,
        emergencyPhone: contact?.emergencyPhone ?? null,
        receiptUrl: pass.receipt_url,
        checkedInBy: pass.checked_in_by,
        createdAt: pass.created_at,
      },
    });
  } catch (err: any) {
    console.error('[Pass Verify Server Exception]:', err);
    return NextResponse.json({ error: 'Internal server error verifying pass.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession().catch(() => null);
    const body = await request.json();
    const { passId } = body;

    if (!session?.isAdmin) {
      return NextResponse.json(
        { error: 'Only organizer accounts can record check-ins.' },
        { status: 403 }
      );
    }

    if (!passId) {
      return NextResponse.json({ error: 'Missing pass ID for check-in.' }, { status: 400 });
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from('festival_pass_claims')
      .select('id, status, checked_in')
      .eq('id', passId)
      .maybeSingle();

    if (lookupError || !existing) {
      return NextResponse.json({ error: 'Pass not found.' }, { status: 404 });
    }

    if (existing.status === 'rejected') {
      return NextResponse.json(
        { error: 'This pass was rejected during receipt verification. Do not admit.' },
        { status: 409 }
      );
    }

    if (existing.checked_in) {
      return NextResponse.json({ error: 'Attendee is already checked in.' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const { data: updatedPass, error } = await supabaseAdmin
      .from('festival_pass_claims')
      .update({
        checked_in: true,
        checked_in_at: now,
        checked_in_by: session.email,
        updated_at: now,
      })
      .eq('id', passId)
      .eq('checked_in', false)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[Pass Check-In Update Error]:', error);
      return NextResponse.json({ error: 'Failed to record check-in.' }, { status: 500 });
    }
    // Two phones scanning the same pass at once: the second one finds it already checked in
    if (!updatedPass) {
      return NextResponse.json({ error: 'Attendee is already checked in.' }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendee successfully checked in.',
      pass: { checkedIn: true, checkedInAt: updatedPass.checked_in_at, checkedInBy: updatedPass.checked_in_by },
    });
  } catch (err: any) {
    console.error('[Pass Check-In Error]:', err);
    return NextResponse.json({ error: 'Failed to process check-in.' }, { status: 500 });
  }
}
