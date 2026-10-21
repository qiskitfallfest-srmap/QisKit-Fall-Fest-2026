import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveEligiblePeople } from '@/lib/shortlist-server';
import { contactStatus, requireConfirmedContact } from '@/lib/contact-server';
import { getParticipantUniversitiesMap } from '@/lib/participant-universities';
import { currentInstitutions } from '@/lib/accommodation-server';
import { trackForLeadEmail } from '@/lib/participant-track';
import { getTransportConfig } from '@/lib/transport-server';
import {
  OTHER_BOARDING_POINT,
  TRANSPORT_TABLE,
  TRAVEL_DATES,
  type TransportPerson,
  type TransportRequest,
} from '@/lib/transport';

export const dynamic = 'force-dynamic';

/**
 * Everyone on a shortlisted team is asked (day scholars ride the buses too). General Pass
 * holders are asked only when they come from outside SRM AP.
 */
async function resolveContext(email: string, fullName: string) {
  const team = await resolveEligiblePeople(email, fullName);
  if (team.group !== 'general_pass') return team;
  const universities = await getParticipantUniversitiesMap();
  const institutions = await currentInstitutions([email], universities);
  return trackForLeadEmail(email, institutions.get(email)) === 'external' ? team : { ...team, group: null, people: [] };
}

function isMissingTable(error: any) {
  return error && (error.code === '42P01' || error.code === 'PGRST205');
}

/** Bus travel status for the user and, for a shortlisted team's lead, each accepted teammate. */
export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const [team, config, contact] = await Promise.all([
      resolveContext(email, session.fullName || email.split('@')[0]),
      getTransportConfig(),
      contactStatus(email),
    ]);
    const base = {
      success: true,
      contactConfirmed: !contact.tracked || (contact.confirmed && Boolean(contact.emergencyPhone)),
      isLead: team.isLead,
      teamName: team.teamName,
      closed: config.closed,
      note: config.note || null,
      boardingPoints: config.boardingPoints,
    };
    if (team.people.length === 0) return NextResponse.json({ ...base, eligible: false, people: [] });

    const rowsRes = await supabaseAdmin.from(TRANSPORT_TABLE).select('*').in('email', team.people.map((p) => p.email));
    // Until the migration runs the card stays hidden instead of erroring
    if (isMissingTable(rowsRes.error)) return NextResponse.json({ ...base, eligible: false, people: [] });
    if (rowsRes.error) throw rowsRes.error;

    const byEmail = new Map((rowsRes.data || []).map((r: any) => [String(r.email).toLowerCase(), r as TransportRequest]));
    const people: TransportPerson[] = team.people.map((p) => ({
      email: p.email,
      name: byEmail.get(p.email)?.full_name || p.name,
      isYou: p.email === email,
      isLead: p.isLead,
      request: byEmail.get(p.email) || null,
    }));

    return NextResponse.json({ ...base, eligible: true, people }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('[Transport GET Error]:', err);
    return NextResponse.json({ error: 'Could not load bus travel details.' }, { status: 500 });
  }
}

/**
 * POST { email, needsTransport, boardingPoint?, boardingOther?, travelDates?, phone?, notes? }
 * Creates or updates the row for `email` (self, or an accepted member of the lead's team).
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
    if (typeof body?.needsTransport !== 'boolean') {
      return NextResponse.json({ error: 'Choose whether the SRM bus is needed.' }, { status: 400 });
    }
    const needs: boolean = body.needsTransport;

    const [team, config] = await Promise.all([
      resolveContext(email, session.fullName || email.split('@')[0]),
      getTransportConfig(),
    ]);
    if (config.closed) {
      return NextResponse.json(
        { error: 'Bus travel responses are closed. Write to qiskitfallfest@srmap.edu.in for changes.' },
        { status: 409 }
      );
    }

    const person = team.people.find((p) => p.email === target);
    if (!person) {
      return NextResponse.json(
        { error: 'You can only answer for yourself or members of the shortlisted team you lead.' },
        { status: 403 }
      );
    }

    let boardingPoint: string | null = null;
    let boardingOther: string | null = null;
    let travelDates: string[] = [];
    if (needs) {
      boardingPoint = String(body?.boardingPoint || '').trim();
      if (boardingPoint !== OTHER_BOARDING_POINT && !config.boardingPoints.includes(boardingPoint)) {
        return NextResponse.json({ error: 'Choose a boarding point.' }, { status: 400 });
      }
      if (boardingPoint === OTHER_BOARDING_POINT) {
        boardingOther = String(body?.boardingOther || '').trim().replace(/\s+/g, ' ').slice(0, 80);
        if (boardingOther.length < 2) {
          return NextResponse.json({ error: 'Type the place you will board from.' }, { status: 400 });
        }
      }
      travelDates = Array.isArray(body?.travelDates)
        ? TRAVEL_DATES.filter((d) => body.travelDates.includes(d))
        : [];
      if (travelDates.length === 0) {
        return NextResponse.json({ error: 'Select at least one day you need the bus.' }, { status: 400 });
      }
    }

    const row = {
      email: target,
      full_name: person.name,
      needs_transport: needs,
      boarding_point: boardingPoint,
      boarding_other: boardingOther,
      travel_dates: travelDates,
      team_id: team.teamId,
      // Omitted fields keep their stored value on update
      ...(typeof body?.phone === 'string' ? { phone: body.phone.trim().slice(0, 20) || null } : {}),
      ...(typeof body?.notes === 'string' ? { notes: body.notes.trim().slice(0, 500) || null } : {}),
      submitted_by: email,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from(TRANSPORT_TABLE).upsert(row, { onConflict: 'email' }).select('*').single();
    if (isMissingTable(error)) {
      return NextResponse.json({ error: 'Bus travel responses are not open yet.' }, { status: 503 });
    }
    if (error) throw error;

    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    console.error('[Transport POST Error]:', err);
    return NextResponse.json({ error: 'Could not save the bus travel answer.' }, { status: 500 });
  }
}
