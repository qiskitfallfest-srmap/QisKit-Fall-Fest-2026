import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  MIN_MEMBER_REASON_LENGTH,
  PARTICIPANT_REQUESTS_TABLE,
  QUESTION_CATEGORIES,
  ROSTER_CHANGE_CONFIG_KEY,
  checkRosterChange,
  composeRosterMessage,
  getTeamContext,
  isMissingTable,
  parseRosterChanges,
} from '@/lib/participant-requests';

export const dynamic = 'force-dynamic';

const MAX_OPEN_QUESTIONS = 5;

/**
 * GET: the user's own requests plus roster change requests for their team (so members
 * see a change the lead asked for), and whether roster changes are accepting requests.
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const [team, configRes] = await Promise.all([
      getTeamContext(email),
      supabaseAdmin.from('platform_config').select('value').eq('key', ROSTER_CHANGE_CONFIG_KEY).limit(1),
    ]);

    let query = supabaseAdmin.from(PARTICIPANT_REQUESTS_TABLE).select('*').order('created_at', { ascending: false }).limit(50);
    query = team
      ? // Quoted so emails with reserved PostgREST characters cannot break the filter
        query.or(`requester_email.eq."${email.replace(/"/g, '')}",and(kind.eq.roster_change,team_id.eq.${team.teamId})`)
      : query.eq('requester_email', email);
    const { data, error } = await query;

    const config = configRes.data?.[0]?.value || {};
    const base = {
      success: true,
      team: team ? { id: team.teamId, name: team.teamName, isLead: team.isLead } : null,
      rosterChangesClosed: Boolean(config.closed),
      rosterChangesNote: config.note || null,
    };

    if (isMissingTable(error)) return NextResponse.json({ ...base, available: false, requests: [] });
    if (error) throw error;

    return NextResponse.json({ ...base, available: true, requests: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('[Requests GET Error]:', err);
    return NextResponse.json({ error: 'Could not load your requests.' }, { status: 500 });
  }
}

/**
 * POST { kind: 'question', category, subject?, message }
 * POST { kind: 'roster_change', changes: { add: [{ ..., reason }], drop: [{ ..., reason }], note? }, confirmed: true }
 * Any accepted member or the lead can propose a change; the organizers review it.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();
  const name = session.fullName || email.split('@')[0];

  try {
    const body = await request.json().catch(() => ({}));

    if (body?.kind === 'question') {
      const category = String(body.category || 'other');
      const subject = String(body.subject || '').trim().slice(0, 120) || null;
      const message = String(body.message || '').trim();
      if (!(category in QUESTION_CATEGORIES)) {
        return NextResponse.json({ error: 'Choose a topic for your question.' }, { status: 400 });
      }
      if (message.length < 10) {
        return NextResponse.json({ error: 'Write a little more so the team can answer properly.' }, { status: 400 });
      }
      if (message.length > 3000) {
        return NextResponse.json({ error: 'Keep the question under 3000 characters.' }, { status: 400 });
      }

      const { count, error: countErr } = await supabaseAdmin
        .from(PARTICIPANT_REQUESTS_TABLE)
        .select('id', { count: 'exact', head: true })
        .eq('requester_email', email)
        .eq('kind', 'question')
        .eq('status', 'open');
      if (isMissingTable(countErr)) {
        return NextResponse.json({ error: 'Requests are not open yet.' }, { status: 503 });
      }
      if ((count || 0) >= MAX_OPEN_QUESTIONS) {
        return NextResponse.json(
          { error: `You have ${MAX_OPEN_QUESTIONS} unanswered questions. Wait for a reply before asking more.` },
          { status: 429 }
        );
      }

      const team = await getTeamContext(email);
      const { data, error } = await supabaseAdmin
        .from(PARTICIPANT_REQUESTS_TABLE)
        .insert({
          kind: 'question',
          requester_email: email,
          requester_name: name,
          team_id: team?.teamId || null,
          team_name: team?.teamName || null,
          category,
          subject,
          message,
        })
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, request: data });
    }

    if (body?.kind === 'roster_change') {
      const team = await getTeamContext(email);
      if (!team) {
        return NextResponse.json({ error: 'You are not on a hackathon team.' }, { status: 404 });
      }

      const { data: configRows } = await supabaseAdmin
        .from('platform_config')
        .select('value')
        .eq('key', ROSTER_CHANGE_CONFIG_KEY)
        .limit(1);
      if (configRows?.[0]?.value?.closed) {
        return NextResponse.json({ error: 'Team change requests are closed.' }, { status: 409 });
      }

      const changes = parseRosterChanges(body.changes);
      const missingReason = [...changes.drop, ...changes.add].filter((c) => (c.reason || '').length < MIN_MEMBER_REASON_LENGTH);
      if (missingReason.length) {
        const errors = missingReason.map(
          (c) => `Give a reason for ${c.name || c.email} (at least ${MIN_MEMBER_REASON_LENGTH} characters).`
        );
        return NextResponse.json({ error: errors[0], errors }, { status: 400 });
      }
      if (body.confirmed !== true) {
        return NextResponse.json(
          { error: 'Confirm that everyone affected has agreed to this change.' },
          { status: 400 }
        );
      }

      const check = await checkRosterChange(team.teamId, team.leadEmail, changes);
      if (check.errors.length) {
        return NextResponse.json({ error: check.errors[0], errors: check.errors }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin
        .from(PARTICIPANT_REQUESTS_TABLE)
        .insert({
          kind: 'roster_change',
          requester_email: email,
          requester_name: name,
          team_id: team.teamId,
          team_name: team.teamName,
          message: composeRosterMessage(changes).slice(0, 3000),
          changes,
        })
        .select('*')
        .single();

      if (isMissingTable(error)) {
        return NextResponse.json({ error: 'Requests are not open yet.' }, { status: 503 });
      }
      if ((error as any)?.code === '23505') {
        return NextResponse.json(
          { error: 'Your team already has a change request under review. Withdraw it first to send a different one.' },
          { status: 409 }
        );
      }
      if (error) throw error;
      return NextResponse.json({ success: true, request: data });
    }

    return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
  } catch (err: any) {
    console.error('[Requests POST Error]:', err);
    return NextResponse.json({ error: 'Could not send your request. Please try again.' }, { status: 500 });
  }
}

/** PATCH { id, action: 'withdraw' } on the user's own open request */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = session.email.trim().toLowerCase();

  try {
    const body = await request.json().catch(() => ({}));
    if (body?.action !== 'withdraw' || !body?.id) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }
    // The requester can withdraw; the lead can also withdraw a team change a member sent
    const { data: rows } = await supabaseAdmin
      .from(PARTICIPANT_REQUESTS_TABLE)
      .select('id, kind, team_id, requester_email')
      .eq('id', body.id)
      .limit(1);
    const target = rows?.[0];
    let allowed = target?.requester_email === email;
    if (target && !allowed && target.kind === 'roster_change' && target.team_id) {
      const team = await getTeamContext(email);
      allowed = Boolean(team?.isLead && team.teamId === String(target.team_id));
    }
    if (!allowed) {
      return NextResponse.json({ error: 'This request is no longer open.' }, { status: 409 });
    }
    const { data, error } = await supabaseAdmin
      .from(PARTICIPANT_REQUESTS_TABLE)
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('id', body.id)
      .eq('status', 'open')
      .select('*');
    if (error) throw error;
    if (!data?.length) {
      return NextResponse.json({ error: 'This request is no longer open.' }, { status: 409 });
    }
    return NextResponse.json({ success: true, request: data[0] });
  } catch (err: any) {
    console.error('[Requests PATCH Error]:', err);
    return NextResponse.json({ error: 'Could not withdraw the request.' }, { status: 500 });
  }
}
