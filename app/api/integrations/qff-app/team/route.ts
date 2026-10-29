import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isTeamFinalized } from '@/lib/finalized-teams';
import { invalidateHackathonTeamCache } from '@/lib/redis';
import { logError } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

function keyMatches(header: string | null): boolean {
  const expected = process.env.GCP_ACCESS;
  const given = /^Bearer (.+)$/.exec(header || '')?.[1];
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const clean = (v: unknown) => String(v || '').trim().toLowerCase();
const likeSafe = (s: string) => s.replace(/[\\%_]/g, (c) => '\\' + c);

async function teamOf(email: string) {
  const { data: mine } = await supabaseAdmin
    .from('team_members')
    .select('team_id, role, status')
    .ilike('email', likeSafe(email))
    .neq('status', 'declined')
    .maybeSingle();
  if (!mine) return null;
  const { data: team } = await supabaseAdmin.from('hackathon_teams').select('id, name, vertical, problem_statement_id').eq('id', mine.team_id).maybeSingle();
  if (!team) return null;
  const { data: members } = await supabaseAdmin.from('team_members').select('email, full_name, role, status').eq('team_id', team.id).neq('status', 'declined');
  return { mine, team, members: members || [] };
}

/** GET ?all=1: every team with its leader, so the app can hand out team names to all of them (including leaders who never opened the app). */
async function allTeams() {
  const { data: teams, error } = await supabaseAdmin.from('hackathon_teams').select('id, name, lead_name').limit(2000);
  if (error) throw error;
  const { data: leaders, error: e2 } = await supabaseAdmin.from('team_members').select('team_id, email, full_name').eq('role', 'leader').neq('status', 'declined').limit(5000);
  if (e2) throw e2;
  const lead = new Map((leaders || []).map((l) => [l.team_id, l]));
  return (teams || []).map((t) => ({ id: t.id, name: t.name, leadEmail: clean(lead.get(t.id)?.email), leadName: lead.get(t.id)?.full_name || t.lead_name || '' })).filter((t) => t.leadEmail.includes('@'));
}

/**
 * GET ?email=<address>
 * The hackathon team of one person, for the QFF 2026 app's My Pass page. Leader first. Declined invitations are left out, and teammates'
 * email addresses are never included (names and roles only). Read-only. Needs `Authorization: Bearer <GCP_ACCESS>`.
 */
export async function GET(request: NextRequest) {
  if (!keyMatches(request.headers.get('authorization'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });
  try {
    const params = new URL(request.url).searchParams;
    if (params.get('all') === '1') return NextResponse.json({ teams: await allTeams() }, { headers: NO_STORE });
    const email = clean(params.get('email'));
    if (!email.includes('@')) return NextResponse.json({ error: 'email is required' }, { status: 400, headers: NO_STORE });
    const found = await teamOf(email);
    if (!found) return NextResponse.json({ team: null }, { headers: NO_STORE });
    const { mine, team, members } = found;
    const fin = await isTeamFinalized(team.id);
    const order = (m: { role: string }) => (m.role === 'leader' ? 0 : 1);
    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        vertical: team.vertical,
        problemStatementId: team.problem_statement_id,
        finalized: fin.isFinalized,
        isLeader: mine.role === 'leader',
        members: members
          .slice()
          .sort((a, b) => order(a) - order(b) || String(a.full_name).localeCompare(String(b.full_name)))
          .map((m) => ({ name: m.full_name, role: m.role === 'leader' ? 'leader' : 'member', status: m.status === 'accepted' || m.role === 'leader' ? 'accepted' : 'invited', you: clean(m.email) === email })),
      },
    }, { headers: NO_STORE });
  } catch (err: any) {
    logError('qff_app_team.read_failed', { error: err?.message || String(err) });
    return NextResponse.json({ error: 'Failed to read team' }, { status: 500, headers: NO_STORE });
  }
}

/**
 * POST { email, name }: the team leader renames their team. Only the leader can; the name must be 3-40 characters and not already taken
 * (any capitalisation). Changes nothing but hackathon_teams.name. Whether renaming is switched on is decided by the app, which calls this.
 */
export async function POST(request: NextRequest) {
  if (!keyMatches(request.headers.get('authorization'))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });
  try {
    const body = await request.json().catch(() => ({}));
    const email = clean(body?.email);
    const name = String(body?.name || '').replace(/\s+/g, ' ').trim();
    if (!email.includes('@')) return NextResponse.json({ error: 'email is required' }, { status: 400, headers: NO_STORE });
    if (name.length < 3 || name.length > 40 || /[\u0000-\u001f<>]/.test(name)) {
      return NextResponse.json({ error: 'invalid_name', message: 'A team name must be 3 to 40 characters.' }, { status: 400, headers: NO_STORE });
    }
    const found = await teamOf(email);
    if (!found) return NextResponse.json({ error: 'no_team', message: 'You are not in a team.' }, { status: 404, headers: NO_STORE });
    if (found.mine.role !== 'leader') return NextResponse.json({ error: 'not_leader', message: 'Only the team lead can rename the team.' }, { status: 403, headers: NO_STORE });
    if (found.team.name === name) return NextResponse.json({ ok: true, name }, { headers: NO_STORE });

    const { data: clash } = await supabaseAdmin.from('hackathon_teams').select('id').ilike('name', likeSafe(name)).neq('id', found.team.id).limit(1);
    if (clash && clash.length) return NextResponse.json({ error: 'name_taken', message: `The team name "${name}" is already taken.` }, { status: 409, headers: NO_STORE });

    const { error } = await supabaseAdmin.from('hackathon_teams').update({ name }).eq('id', found.team.id);
    if (error) {
      if ((error as { code?: string }).code === '23505') return NextResponse.json({ error: 'name_taken', message: `The team name "${name}" is already taken.` }, { status: 409, headers: NO_STORE });
      throw error;
    }
    await invalidateHackathonTeamCache(found.members.map((m) => String(m.email || '')).filter(Boolean));
    return NextResponse.json({ ok: true, name }, { headers: NO_STORE });
  } catch (err: any) {
    logError('qff_app_team.rename_failed', { error: err?.message || String(err) });
    return NextResponse.json({ error: 'Failed to rename team' }, { status: 500, headers: NO_STORE });
  }
}
