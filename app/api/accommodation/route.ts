import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getParticipantUniversitiesMap } from '@/lib/participant-universities';
import { currentInstitutions } from '@/lib/accommodation-server';
import { trackForLeadEmail } from '@/lib/phase2-waiting-room';
import { resolveEligiblePeople } from '@/lib/shortlist-server';
import { contactStatus, requireConfirmedContact } from '@/lib/contact-server';
import {
  ACCOMMODATION_CONFIG_KEY,
  ACCOMMODATION_DATES,
  ACCOMMODATION_TABLE,
  ARRIVAL_MODE_LABEL,
  OTHER_ARRIVAL_POINT,
  type AccommodationPerson,
  type AccommodationRequest,
} from '@/lib/accommodation';

export const dynamic = 'force-dynamic';

interface Candidate {
  email: string;
  name: string;
  isLead: boolean;
  institution: string | null;
}

/**
 * Who this user may submit accommodation for: themselves if external, plus the
 * external accepted members of the team they lead. Asked of Phase 2 shortlisted
 * teams and of external General Pass holders (lib/shortlist-server.ts);
 * SRM AP participants and everyone else see no form.
 */
async function resolveContext(email: string, fullName: string) {
  const [universities, team] = await Promise.all([getParticipantUniversitiesMap(), resolveEligiblePeople(email, fullName)]);
  const institutions = await currentInstitutions(team.people.map((p) => p.email), universities);
  const candidates: Candidate[] = team.people
    .map((p) => ({ ...p, institution: institutions.get(p.email) || null }))
    .filter((p) => trackForLeadEmail(p.email, p.institution) === 'external');

  return { isLead: team.isLead, teamId: team.teamId, teamName: team.teamName, candidates };
}

function isMissingTable(error: any) {
  return error && (error.code === '42P01' || error.code === 'PGRST205');
}

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const [ctx, contact] = await Promise.all([
      resolveContext(email, session.fullName || email.split('@')[0]),
      contactStatus(email),
    ]);
    const base = {
      success: true,
      isLead: ctx.isLead,
      teamName: ctx.teamName,
      contactConfirmed: !contact.tracked || (contact.confirmed && Boolean(contact.emergencyPhone)),
    };

    if (ctx.candidates.length === 0) {
      return NextResponse.json({ ...base, eligible: false, closed: false, note: null, people: [] });
    }

    const [rowsRes, configRes] = await Promise.all([
      supabaseAdmin.from(ACCOMMODATION_TABLE).select('*').in('email', ctx.candidates.map((c) => c.email)),
      supabaseAdmin.from('platform_config').select('value').eq('key', ACCOMMODATION_CONFIG_KEY).limit(1),
    ]);

    // Until the migration runs the card stays hidden instead of erroring
    if (isMissingTable(rowsRes.error)) {
      return NextResponse.json({ ...base, eligible: false, closed: true, note: null, people: [] });
    }
    if (rowsRes.error) throw rowsRes.error;

    const byEmail = new Map((rowsRes.data || []).map((r: any) => [String(r.email).toLowerCase(), r as AccommodationRequest]));
    const config = configRes.data?.[0]?.value || {};
    const people: AccommodationPerson[] = ctx.candidates.map((c) => ({
      email: c.email,
      name: byEmail.get(c.email)?.full_name || c.name,
      isYou: c.email === email,
      isLead: c.isLead,
      request: byEmail.get(c.email) || null,
    }));

    return NextResponse.json(
      { ...base, eligible: true, closed: Boolean(config.closed), note: config.note || null, people },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('[Accommodation GET Error]:', err);
    return NextResponse.json({ error: 'Could not load accommodation details.' }, { status: 500 });
  }
}

/**
 * POST { email, needsAccommodation, gender?, checkIn?, checkOut?, phone?, notes? }
 * Creates or updates the row for `email` (self, or an external member of the lead's team).
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  // No OTP: the submitter must have confirmed their own number and an emergency contact first
  const contactBlock = await requireConfirmedContact(email);
  if (contactBlock) return NextResponse.json({ error: contactBlock, code: 'contact_required' }, { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const target = String(body?.email || email).trim().toLowerCase();
    const needs = body?.needsAccommodation !== false;
    const gender = body?.gender;
    const checkIn = body?.checkIn || null;
    const checkOut = body?.checkOut || null;
    const clean = (v: unknown, max: number) => String(v || '').trim().replace(/\s+/g, ' ').slice(0, max);
    const travellingFrom = clean(body?.travellingFrom, 80);
    const arrivalMode = String(body?.arrivalMode || '');
    // A listed point, or the place typed for "Other"
    const arrivalPoint = clean(body?.arrivalPoint === OTHER_ARRIVAL_POINT ? body?.arrivalPointOther : body?.arrivalPoint, 80);
    const arrivalTimeValue = String(body?.arrivalTime || '').slice(0, 5);

    const [ctx, configRes] = await Promise.all([
      resolveContext(email, session.fullName || email.split('@')[0]),
      supabaseAdmin.from('platform_config').select('value').eq('key', ACCOMMODATION_CONFIG_KEY).limit(1),
    ]);

    if (configRes.data?.[0]?.value?.closed) {
      return NextResponse.json(
        { error: 'Accommodation requests are closed. Write to qiskitfallfest@srmap.edu.in for changes.' },
        { status: 409 }
      );
    }

    const candidate = ctx.candidates.find((c) => c.email === target);
    if (!candidate) {
      return NextResponse.json(
        { error: 'You can only submit accommodation for yourself or external members of the team you lead.' },
        { status: 403 }
      );
    }

    if (needs) {
      if (!['male', 'female', 'other'].includes(gender)) {
        return NextResponse.json({ error: 'Select a gender so rooms can be allocated.' }, { status: 400 });
      }
      if (!ACCOMMODATION_DATES.includes(checkIn) || !ACCOMMODATION_DATES.includes(checkOut) || checkOut <= checkIn) {
        return NextResponse.json({ error: 'Choose a check-out date after the check-in date.' }, { status: 400 });
      }
      if (travellingFrom.length < 2) {
        return NextResponse.json({ error: 'Enter the city or town you are travelling from.' }, { status: 400 });
      }
      if (!(arrivalMode in ARRIVAL_MODE_LABEL)) {
        return NextResponse.json({ error: 'Choose how you will arrive.' }, { status: 400 });
      }
      if (arrivalPoint.length < 2) {
        return NextResponse.json({ error: 'Choose where you will arrive.' }, { status: 400 });
      }
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(arrivalTimeValue)) {
        return NextResponse.json({ error: 'Enter your approximate arrival time.' }, { status: 400 });
      }
    }

    const { data: existing, error: existingErr } = await supabaseAdmin
      .from(ACCOMMODATION_TABLE)
      .select('status')
      .eq('email', target)
      .limit(1);
    if (isMissingTable(existingErr)) {
      return NextResponse.json({ error: 'Accommodation requests are not open yet.' }, { status: 503 });
    }
    if (existing?.[0]?.status === 'allocated') {
      return NextResponse.json(
        { error: 'A room is already allocated. Write to qiskitfallfest@srmap.edu.in to change it.' },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    const row = {
      email: target,
      full_name: candidate.name,
      needs_accommodation: needs,
      gender: needs ? gender : ['male', 'female', 'other'].includes(gender) ? gender : null,
      check_in: needs ? checkIn : null,
      check_out: needs ? checkOut : null,
      travelling_from: needs ? travellingFrom : null,
      arrival_mode: needs ? arrivalMode : null,
      arrival_point: needs ? arrivalPoint : null,
      arrival_time: needs ? arrivalTimeValue : null,
      team_id: ctx.teamId,
      institution: candidate.institution,
      // Omitted fields keep their stored value on update
      ...(typeof body?.phone === 'string' ? { phone: body.phone.trim().slice(0, 20) || null } : {}),
      ...(typeof body?.notes === 'string' ? { notes: body.notes.trim().slice(0, 500) || null } : {}),
      submitted_by: email,
      status: needs ? 'requested' : 'cancelled',
      updated_at: nowIso,
    };

    const { data, error } = await supabaseAdmin
      .from(ACCOMMODATION_TABLE)
      .upsert(row, { onConflict: 'email' })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    console.error('[Accommodation POST Error]:', err);
    return NextResponse.json({ error: 'Could not save the accommodation request.' }, { status: 500 });
  }
}
