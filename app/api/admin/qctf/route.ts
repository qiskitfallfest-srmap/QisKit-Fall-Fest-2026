import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { invalidateCache } from '@/lib/redis';
import { getQctfConfig, isValidRun, saveQctfConfig, type QctfConfig } from '@/lib/qctf/server';
import { QCTF_BLOCKS, QCTF_STATES, type QctfBlock, type QctfState } from '@/data/qctf/tracks';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireAdmin() {
  const session = await getServerSession();
  if (!session || !session.isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const config = await getQctfConfig();
    const [challengesRes, teamsRes, membersRes, solvesRes, submissionsRes, eligibleRes, attemptsRes] = await Promise.all([
      supabaseAdmin
        .from('qctf_challenges')
        .select('id, title, track_id, block, points, is_enabled, sort_order')
        .order('sort_order'),
      supabaseAdmin.from('qctf_teams').select('id, name, hackathon_team_id, created_at').eq('run', config.run),
      supabaseAdmin.from('qctf_team_members').select('team_id, email, full_name').eq('run', config.run),
      supabaseAdmin.from('qctf_solves').select('team_id, challenge_id, points').eq('run', config.run),
      supabaseAdmin
        .from('qctf_submissions')
        .select('created_at, email, team_id, challenge_id, submitted_flag, is_correct')
        .eq('run', config.run)
        .order('created_at', { ascending: false })
        .limit(60),
      supabaseAdmin.from('qctf_eligible_emails').select('email, note, added_at').order('added_at', { ascending: false }),
      supabaseAdmin.from('qctf_submissions').select('challenge_id').eq('run', config.run),
    ]);

    const firstError = [challengesRes, teamsRes, membersRes, solvesRes, submissionsRes, eligibleRes, attemptsRes].find(
      (res) => res.error
    )?.error;
    if (firstError) {
      // Most likely the migration has not been applied yet
      return NextResponse.json({ error: `Database error: ${firstError.message}` }, { status: 500 });
    }

    const teamName = new Map((teamsRes.data ?? []).map((t) => [t.id, t.name as string]));
    const solveCount = new Map<string, number>();
    const attemptCount = new Map<string, number>();
    const teamTotals = new Map<string, { points: number; solved: number }>();
    for (const solve of solvesRes.data ?? []) {
      solveCount.set(solve.challenge_id, (solveCount.get(solve.challenge_id) ?? 0) + 1);
      const total = teamTotals.get(solve.team_id) ?? { points: 0, solved: 0 };
      total.points += solve.points;
      total.solved += 1;
      teamTotals.set(solve.team_id, total);
    }
    for (const attempt of attemptsRes.data ?? []) {
      attemptCount.set(attempt.challenge_id, (attemptCount.get(attempt.challenge_id) ?? 0) + 1);
    }

    const teams = (teamsRes.data ?? [])
      .map((team) => ({
        id: team.id,
        name: team.name,
        fromHackathon: Boolean(team.hackathon_team_id),
        members: (membersRes.data ?? [])
          .filter((m) => m.team_id === team.id)
          .map((m) => ({ email: m.email, fullName: m.full_name })),
        points: teamTotals.get(team.id)?.points ?? 0,
        solvedCount: teamTotals.get(team.id)?.solved ?? 0,
      }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

    return NextResponse.json({
      config,
      stats: {
        teams: teams.length,
        players: membersRes.data?.length ?? 0,
        solves: solvesRes.data?.length ?? 0,
        submissions: attemptsRes.data?.length ?? 0,
        eligible: eligibleRes.data?.length ?? 0,
      },
      challenges: (challengesRes.data ?? []).map((c) => ({
        id: c.id,
        title: c.title,
        trackId: c.track_id,
        block: c.block,
        points: c.points,
        isEnabled: c.is_enabled,
        solveCount: solveCount.get(c.id) ?? 0,
        attemptCount: attemptCount.get(c.id) ?? 0,
      })),
      teams,
      eligible: (eligibleRes.data ?? []).map((e) => ({ email: e.email, note: e.note, addedAt: e.added_at })),
      recentSubmissions: (submissionsRes.data ?? []).map((s) => ({
        createdAt: s.created_at,
        email: s.email,
        teamName: teamName.get(s.team_id) ?? 'Team',
        challengeId: s.challenge_id,
        flag: s.submitted_flag,
        correct: s.is_correct,
      })),
    });
  } catch (err) {
    console.error('[API /api/admin/qctf] GET error:', err);
    return NextResponse.json({ error: 'Failed to load QCTF data.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action;

  try {
    const config = await getQctfConfig();

    if (action === 'setState') {
      const state = body.state as QctfState;
      if (!QCTF_STATES.some((s) => s.id === state)) {
        return NextResponse.json({ error: 'Unknown state.' }, { status: 400 });
      }
      // The public scoreboard stops at the moment the round is first frozen
      const frozenAt =
        state === 'frozen' || state === 'closed' ? config.frozenAt ?? (state === 'frozen' ? new Date().toISOString() : null) : null;
      const next: QctfConfig = { ...config, state, frozenAt };
      await saveQctfConfig(next);
      return NextResponse.json({ success: true, config: next });
    }

    if (action === 'setRun') {
      const run = String(body.run ?? '').trim().toLowerCase();
      if (!isValidRun(run)) {
        return NextResponse.json(
          { error: 'Run labels are 2 to 40 lowercase letters, digits and hyphens, e.g. rehearsal-2 or live.' },
          { status: 400 }
        );
      }
      const next: QctfConfig = { ...config, run, frozenAt: null };
      await saveQctfConfig(next);
      return NextResponse.json({ success: true, config: next });
    }

    if (action === 'setBlocks') {
      const requested: unknown[] = Array.isArray(body.releasedBlocks) ? body.releasedBlocks : [];
      const releasedBlocks = QCTF_BLOCKS.map((b) => b.id).filter((id) => requested.includes(id)) as QctfBlock[];
      const next: QctfConfig = { ...config, releasedBlocks };
      await saveQctfConfig(next);
      return NextResponse.json({ success: true, config: next });
    }

    if (action === 'addEligible') {
      const emails = Array.from(
        new Set(
          String(body.emails ?? '')
            .split(/[\s,;]+/)
            .map((e) => e.trim().toLowerCase())
            .filter((e) => EMAIL_PATTERN.test(e))
        )
      );
      if (emails.length === 0) return NextResponse.json({ error: 'No valid email addresses found.' }, { status: 400 });
      const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 120) : null;
      const { error } = await supabaseAdmin
        .from('qctf_eligible_emails')
        .upsert(emails.map((email) => ({ email, note, added_by: session.email })), { onConflict: 'email' });
      if (error) throw new Error(error.message);
      return NextResponse.json({ success: true, added: emails.length });
    }

    if (action === 'removeEligible') {
      const email = String(body.email ?? '').trim().toLowerCase();
      await supabaseAdmin.from('qctf_eligible_emails').delete().eq('email', email);
      return NextResponse.json({ success: true });
    }

    if (action === 'setChallengeEnabled') {
      const { error } = await supabaseAdmin
        .from('qctf_challenges')
        .update({ is_enabled: Boolean(body.enabled), updated_at: new Date().toISOString() })
        .eq('id', String(body.id ?? ''));
      if (error) throw new Error(error.message);
      await invalidateCache([`qctf:scoreboard:${config.run}:live`, `qctf:scoreboard:${config.run}:public`]);
      return NextResponse.json({ success: true });
    }

    if (action === 'removeMember') {
      const email = String(body.email ?? '').trim().toLowerCase();
      await supabaseAdmin.from('qctf_team_members').delete().eq('run', config.run).eq('email', email);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (err) {
    console.error('[API /api/admin/qctf] POST error:', err);
    return NextResponse.json({ error: 'Failed to update QCTF.' }, { status: 500 });
  }
}
