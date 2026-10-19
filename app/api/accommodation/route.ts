import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getParticipantUniversitiesMap } from '@/lib/participant-universities';
import { trackForLeadEmail } from '@/lib/phase2-waiting-room';
import {
  ACCOMMODATION_CONFIG_KEY,
  ACCOMMODATION_DATES,
  ACCOMMODATION_TABLE,
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
 * external accepted members of the team they lead. SRM AP participants are excluded.
 */
async function resolveContext(email: string, fullName: string) {
  const [universities, regRes, leadRes] = await Promise.all([
    getParticipantUniversitiesMap(),
    supabaseAdmin.from('registrations').select('institution').ilike('email', email).limit(1),
    supabaseAdmin.from('hackathon_teams').select('id, name').ilike('lead_email', email).limit(1),
  ]);

  const selfInstitution = universities[email] || regRes.data?.[0]?.institution || null;
  const lead = leadRes.data?.[0] || null;

  let teamId: string | null = lead ? String(lead.id) : null;
  let teamName: string | null = lead?.name || null;
  const candidates: Candidate[] = [];

  if (trackForLeadEmail(email, selfInstitution) === 'external') {
    candidates.push({ email, name: fullName, isLead: Boolean(lead), institution: selfInstitution });
  }

  if (lead) {
    const { data: members } = await supabaseAdmin
      .from('team_members')
      .select('email, full_name')
      .eq('team_id', lead.id)
      .eq('status', 'accepted');
    for (const m of members || []) {
      const memberEmail = String(m.email).trim().toLowerCase();
      if (memberEmail === email) continue;
      const institution = universities[memberEmail] || null;
      if (trackForLeadEmail(memberEmail, institution) === 'external') {
        candidates.push({ email: memberEmail, name: m.full_name || memberEmail.split('@')[0], isLead: false, institution });
      }
    }
  } else {
    // Members are linked to their team so organizers can group rooms by team
    const { data: membership } = await supabaseAdmin
      .from('team_members')
      .select('team_id, hackathon_teams(name)')
      .ilike('email', email)
      .eq('status', 'accepted')
      .limit(1);
    teamId = membership?.[0]?.team_id ? String(membership[0].team_id) : null;
    teamName = (membership?.[0] as any)?.hackathon_teams?.name || null;
  }

  return { isLead: Boolean(lead), teamId, teamName, candidates };
}

function isMissingTable(error: any) {
  return error && (error.code === '42P01' || error.code === 'PGRST205');
}

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const ctx = await resolveContext(email, session.fullName || email.split('@')[0]);
    const base = { success: true, isLead: ctx.isLead, teamName: ctx.teamName };

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

  try {
    const body = await request.json().catch(() => ({}));
    const target = String(body?.email || email).trim().toLowerCase();
    const needs = body?.needsAccommodation !== false;
    const gender = body?.gender;
    const checkIn = body?.checkIn || null;
    const checkOut = body?.checkOut || null;

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
