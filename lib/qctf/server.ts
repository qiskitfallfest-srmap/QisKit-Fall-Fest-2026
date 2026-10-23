import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cacheAside, invalidateCache } from '@/lib/redis';
import type { AuthSession } from '@/lib/auth';
import {
  QCTF_BLOCKS,
  QCTF_MAX_TEAM_SIZE,
  QCTF_STATES,
  type QctfBlock,
  type QctfChallengeDetail,
  type QctfChallengeSummary,
  type QctfMe,
  type QctfScoreboard,
  type QctfState,
  type QctfSubmitResult,
  type QctfTeamView,
} from '@/data/qctf/tracks';
import { QCTF_PUBLIC_STATES, QCTF_SUBMIT_STATES, isQctfStaff } from './access';

// ---------------------------------------------------------------------------
// Arena configuration (platform_config.qctf)
// ---------------------------------------------------------------------------

export const QCTF_CONFIG_KEY = 'qctf';
const CONFIG_CACHE_KEY = 'qctf:config';

export interface QctfConfig {
  state: QctfState;
  run: string;
  releasedBlocks: QctfBlock[];
  frozenAt: string | null;
}

const DEFAULT_CONFIG: QctfConfig = {
  state: 'hidden',
  run: 'rehearsal-1',
  releasedBlocks: ['practice'],
  frozenAt: null,
};

const RUN_PATTERN = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function isValidRun(run: string): boolean {
  return RUN_PATTERN.test(run);
}

function parseConfig(value: unknown): QctfConfig {
  if (!value || typeof value !== 'object') return DEFAULT_CONFIG;
  const v = value as Record<string, unknown>;
  const state = QCTF_STATES.some((s) => s.id === v.state) ? (v.state as QctfState) : DEFAULT_CONFIG.state;
  const run = typeof v.run === 'string' && isValidRun(v.run) ? v.run : DEFAULT_CONFIG.run;
  const releasedBlocks = Array.isArray(v.releasedBlocks)
    ? (v.releasedBlocks.filter((b) => QCTF_BLOCKS.some((block) => block.id === b)) as QctfBlock[])
    : DEFAULT_CONFIG.releasedBlocks;
  const frozenAt = typeof v.frozenAt === 'string' ? v.frozenAt : null;
  return { state, run, releasedBlocks, frozenAt };
}

/** Cached for 10 seconds; every write through saveQctfConfig clears it. */
export async function getQctfConfig(): Promise<QctfConfig> {
  return cacheAside(CONFIG_CACHE_KEY, 10, async () => {
    const { data } = await supabaseAdmin
      .from('platform_config')
      .select('value')
      .eq('key', QCTF_CONFIG_KEY)
      .maybeSingle();
    return parseConfig(data?.value);
  });
}

export async function saveQctfConfig(config: QctfConfig): Promise<void> {
  const { error } = await supabaseAdmin
    .from('platform_config')
    .upsert({ key: QCTF_CONFIG_KEY, value: config, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw new Error(error.message);
  await invalidateCache([CONFIG_CACHE_KEY, ...scoreboardCacheKeys(config.run)]);
}

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

export async function isQctfEligible(email: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('qctf_eligible_emails')
    .select('email')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();
  return Boolean(data);
}

export interface QctfAccess {
  isStaff: boolean;
  canEnter: boolean;
  canSubmit: boolean;
}

export async function resolveQctfAccess(session: AuthSession, config: QctfConfig): Promise<QctfAccess> {
  const isStaff = isQctfStaff(session);
  let canEnter: boolean;
  if (session.isAdmin) canEnter = true;
  else if (isStaff) canEnter = config.state !== 'hidden';
  else canEnter = QCTF_PUBLIC_STATES.includes(config.state) && (await isQctfEligible(session.email));

  // Admins can test flags while the arena is still hidden
  const submitOpen = QCTF_SUBMIT_STATES.includes(config.state) || (session.isAdmin && config.state === 'hidden');
  return { isStaff, canEnter, canSubmit: canEnter && submitOpen };
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

interface TeamRow {
  id: string;
  name: string;
  join_code: string;
  hackathon_team_id: string | null;
}

const JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateJoinCode(): string {
  const bytes = randomBytes(6);
  return Array.from(bytes, (b) => JOIN_CODE_ALPHABET[b % JOIN_CODE_ALPHABET.length]).join('');
}

async function findTeamRowForMember(run: string, email: string): Promise<TeamRow | null> {
  const { data } = await supabaseAdmin
    .from('qctf_team_members')
    .select('qctf_teams(id, name, join_code, hackathon_team_id)')
    .eq('run', run)
    .eq('email', email)
    .maybeSingle();
  const team = (data as { qctf_teams?: TeamRow | TeamRow[] } | null)?.qctf_teams;
  return (Array.isArray(team) ? team[0] : team) ?? null;
}

async function buildTeamView(run: string, row: TeamRow): Promise<QctfTeamView> {
  const [{ data: members }, { data: solves }] = await Promise.all([
    supabaseAdmin.from('qctf_team_members').select('email, full_name').eq('team_id', row.id).order('joined_at'),
    supabaseAdmin.from('qctf_solves').select('points').eq('run', run).eq('team_id', row.id),
  ]);
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    fromHackathon: Boolean(row.hackathon_team_id),
    members: (members ?? []).map((m) => ({ email: m.email, fullName: m.full_name })),
    points: (solves ?? []).reduce((sum, s) => sum + (s.points || 0), 0),
    solvedCount: (solves ?? []).length,
  };
}

/** Case-insensitive exact match: ilike with its wildcards escaped (emails often contain '_'). */
function ilikeExact(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/** The caller's hackathon team (as leader or accepted member), if any. */
async function findHackathonTeam(email: string): Promise<{ id: string; name: string } | null> {
  const { data: member } = await supabaseAdmin
    .from('team_members')
    .select('team_id, hackathon_teams(id, name)')
    .ilike('email', ilikeExact(email))
    .eq('status', 'accepted')
    .maybeSingle();
  const joined = (member as { hackathon_teams?: { id: string; name: string } | { id: string; name: string }[] } | null)
    ?.hackathon_teams;
  const fromMembership = Array.isArray(joined) ? joined[0] : joined;
  if (fromMembership) return fromMembership;

  const { data: led } = await supabaseAdmin
    .from('hackathon_teams')
    .select('id, name')
    .ilike('lead_email', ilikeExact(email))
    .maybeSingle();
  return led ?? null;
}

async function addMember(run: string, teamId: string, session: AuthSession): Promise<string | null> {
  const { count } = await supabaseAdmin
    .from('qctf_team_members')
    .select('email', { count: 'exact', head: true })
    .eq('team_id', teamId);
  if ((count ?? 0) >= QCTF_MAX_TEAM_SIZE) return `This team already has ${QCTF_MAX_TEAM_SIZE} members.`;

  const { error } = await supabaseAdmin.from('qctf_team_members').insert({
    run,
    email: session.email,
    team_id: teamId,
    full_name: session.fullName || session.email,
  });
  if (error) return error.code === '23505' ? 'You are already on a QCTF team.' : 'Could not join the team.';
  return null;
}

/**
 * Hackathon teams carry over: the first time a member of a hackathon team opens the
 * arena in a run, they join the QCTF team linked to it, which is created on demand.
 */
async function linkHackathonTeam(config: QctfConfig, session: AuthSession): Promise<TeamRow | null> {
  const hackathonTeam = await findHackathonTeam(session.email);
  if (!hackathonTeam) return null;

  const select = 'id, name, join_code, hackathon_team_id';
  let { data: team } = await supabaseAdmin
    .from('qctf_teams')
    .select(select)
    .eq('run', config.run)
    .eq('hackathon_team_id', hackathonTeam.id)
    .maybeSingle();

  const insertLinked = (name: string) =>
    supabaseAdmin
      .from('qctf_teams')
      .insert({
        run: config.run,
        name: name.slice(0, 60),
        join_code: generateJoinCode(),
        hackathon_team_id: hackathonTeam.id,
        created_by: session.email,
      })
      .select(select)
      .single();

  if (!team) {
    const created = await insertLinked(hackathonTeam.name);
    team = created.data;
    if (created.error) {
      // A teammate created it at the same moment...
      const retry = await supabaseAdmin
        .from('qctf_teams')
        .select(select)
        .eq('run', config.run)
        .eq('hackathon_team_id', hackathonTeam.id)
        .maybeSingle();
      team = retry.data;
      // ...or a walk-in team already uses the hackathon team's name
      if (!team) team = (await insertLinked(`${hackathonTeam.name.slice(0, 48)} (Hackathon)`)).data;
    }
  }
  if (!team) return null;

  const joinError = await addMember(config.run, team.id, session);
  return joinError ? null : team;
}

export async function getQctfMe(session: AuthSession, config: QctfConfig): Promise<QctfMe> {
  const access = await resolveQctfAccess(session, config);
  let team: QctfTeamView | null = null;

  if (access.canEnter) {
    let row = await findTeamRowForMember(config.run, session.email);
    if (!row && config.state !== 'closed') row = await linkHackathonTeam(config, session);
    if (row) team = await buildTeamView(config.run, row);
  }

  return {
    state: config.state,
    run: config.run,
    isStaff: access.isStaff,
    canEnter: access.canEnter,
    canSubmit: access.canSubmit,
    releasedBlocks: config.releasedBlocks,
    team,
  };
}

export async function createQctfTeam(config: QctfConfig, session: AuthSession, rawName: string): Promise<string | null> {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 60) return 'Team names are 2 to 60 characters.';
  if (await findTeamRowForMember(config.run, session.email)) return 'You are already on a QCTF team.';

  const { data: team, error } = await supabaseAdmin
    .from('qctf_teams')
    .insert({ run: config.run, name, join_code: generateJoinCode(), created_by: session.email })
    .select('id')
    .single();
  if (error) return error.code === '23505' ? 'That team name is taken. Choose another.' : 'Could not create the team.';

  const joinError = await addMember(config.run, team.id, session);
  if (joinError) {
    await supabaseAdmin.from('qctf_teams').delete().eq('id', team.id);
    return joinError;
  }
  return null;
}

export async function joinQctfTeam(config: QctfConfig, session: AuthSession, rawCode: string): Promise<string | null> {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) return 'Join codes are 6 letters and digits.';
  if (await findTeamRowForMember(config.run, session.email)) return 'You are already on a QCTF team.';

  const { data: team } = await supabaseAdmin
    .from('qctf_teams')
    .select('id')
    .eq('run', config.run)
    .eq('join_code', code)
    .maybeSingle();
  if (!team) return 'No team has that join code.';
  return addMember(config.run, team.id, session);
}

/** Leaving is allowed until the team scores, so points cannot move between teams. */
export async function leaveQctfTeam(config: QctfConfig, session: AuthSession): Promise<string | null> {
  const row = await findTeamRowForMember(config.run, session.email);
  if (!row) return 'You are not on a QCTF team.';

  const { count } = await supabaseAdmin
    .from('qctf_solves')
    .select('id', { count: 'exact', head: true })
    .eq('team_id', row.id);
  if ((count ?? 0) > 0) return 'Your team has already scored, so the roster is locked. Ask an organizer for changes.';

  await supabaseAdmin.from('qctf_team_members').delete().eq('run', config.run).eq('email', session.email);
  const { count: remaining } = await supabaseAdmin
    .from('qctf_team_members')
    .select('email', { count: 'exact', head: true })
    .eq('team_id', row.id);
  if ((remaining ?? 0) === 0) await supabaseAdmin.from('qctf_teams').delete().eq('id', row.id);
  return null;
}

// ---------------------------------------------------------------------------
// Challenges
// ---------------------------------------------------------------------------

interface ChallengeRow {
  id: string;
  track_id: QctfChallengeSummary['trackId'];
  title: string;
  summary: string;
  statement: string;
  difficulty: QctfChallengeSummary['difficulty'];
  points: number;
  tags: string[];
  block: QctfBlock;
  attachments: QctfChallengeDetail['attachments'];
  flag_hash: string;
  sort_order: number;
}

const CHALLENGE_COLUMNS =
  'id, track_id, title, summary, statement, difficulty, points, tags, block, attachments, flag_hash, sort_order';

const blockOrder = (block: QctfBlock) => QCTF_BLOCKS.findIndex((b) => b.id === block);

async function loadEnabledChallenges(): Promise<ChallengeRow[]> {
  const { data, error } = await supabaseAdmin
    .from('qctf_challenges')
    .select(CHALLENGE_COLUMNS)
    .eq('is_enabled', true);
  if (error) throw new Error(error.message);
  return ((data ?? []) as ChallengeRow[]).sort(
    (a, b) => blockOrder(a.block) - blockOrder(b.block) || a.sort_order - b.sort_order || a.id.localeCompare(b.id)
  );
}

async function loadSolveStats(run: string, teamId: string | null) {
  const { data } = await supabaseAdmin.from('qctf_solves').select('team_id, challenge_id').eq('run', run);
  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const solve of data ?? []) {
    counts.set(solve.challenge_id, (counts.get(solve.challenge_id) ?? 0) + 1);
    if (teamId && solve.team_id === teamId) mine.add(solve.challenge_id);
  }
  return { counts, mine };
}

function toSummary(row: ChallengeRow, released: boolean, solved: boolean, solveCount: number): QctfChallengeSummary {
  return {
    id: row.id,
    trackId: row.track_id,
    title: row.title,
    summary: row.summary,
    difficulty: row.difficulty,
    points: row.points,
    tags: row.tags ?? [],
    block: row.block,
    released,
    solved,
    solveCount,
  };
}

/** Released challenges for players; admins also see unreleased blocks, marked released: false. */
export async function listQctfChallenges(
  session: AuthSession,
  config: QctfConfig,
  teamId: string | null
): Promise<QctfChallengeSummary[]> {
  const [rows, stats] = await Promise.all([loadEnabledChallenges(), loadSolveStats(config.run, teamId)]);
  return rows
    .map((row) => ({ row, released: config.releasedBlocks.includes(row.block) }))
    .filter(({ released }) => released || session.isAdmin)
    .map(({ row, released }) => toSummary(row, released, stats.mine.has(row.id), stats.counts.get(row.id) ?? 0));
}

async function getVisibleChallengeRow(session: AuthSession, config: QctfConfig, id: string) {
  const { data } = await supabaseAdmin
    .from('qctf_challenges')
    .select(CHALLENGE_COLUMNS)
    .eq('id', id.trim().toUpperCase())
    .eq('is_enabled', true)
    .maybeSingle();
  const row = data as ChallengeRow | null;
  if (!row) return null;
  const released = config.releasedBlocks.includes(row.block);
  if (!released && !session.isAdmin) return null;
  return { row, released };
}

export async function getQctfChallenge(
  session: AuthSession,
  config: QctfConfig,
  id: string,
  teamId: string | null
): Promise<QctfChallengeDetail | null> {
  const visible = await getVisibleChallengeRow(session, config, id);
  if (!visible) return null;
  const stats = await loadSolveStats(config.run, teamId);
  const { row, released } = visible;
  return {
    ...toSummary(row, released, stats.mine.has(row.id), stats.counts.get(row.id) ?? 0),
    statement: row.statement,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
  };
}

// ---------------------------------------------------------------------------
// Flag submission
// ---------------------------------------------------------------------------

const SUBMISSIONS_PER_MINUTE = 10;

export function hashQctfFlag(flag: string): string {
  return createHash('sha256').update(flag.trim()).digest('hex');
}

export type QctfSubmitOutcome = { status: number; error: string } | { status: 200; result: QctfSubmitResult };

export async function submitQctfFlag(
  session: AuthSession,
  config: QctfConfig,
  team: QctfTeamView,
  challengeId: string,
  flag: string
): Promise<QctfSubmitOutcome> {
  const visible = await getVisibleChallengeRow(session, config, challengeId);
  if (!visible) return { status: 404, error: 'Challenge not found.' };
  const { row } = visible;

  const { data: existing } = await supabaseAdmin
    .from('qctf_solves')
    .select('id')
    .eq('run', config.run)
    .eq('team_id', team.id)
    .eq('challenge_id', row.id)
    .maybeSingle();
  if (existing) {
    return { status: 200, result: { correct: true, alreadySolved: true, message: 'Your team has already solved this challenge.' } };
  }

  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from('qctf_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('run', config.run)
    .eq('email', session.email)
    .gte('created_at', since);
  if ((count ?? 0) >= SUBMISSIONS_PER_MINUTE) {
    return { status: 429, error: `Too many attempts. You can submit ${SUBMISSIONS_PER_MINUTE} flags per minute.` };
  }

  const submitted = Buffer.from(hashQctfFlag(flag), 'hex');
  const correct = timingSafeEqual(submitted, Buffer.from(row.flag_hash, 'hex'));

  await supabaseAdmin.from('qctf_submissions').insert({
    run: config.run,
    team_id: team.id,
    email: session.email,
    challenge_id: row.id,
    submitted_flag: flag.trim().slice(0, 200),
    is_correct: correct,
  });

  if (!correct) {
    return { status: 200, result: { correct: false, message: 'That flag is not correct. Check the format and try again.' } };
  }

  const { error } = await supabaseAdmin.from('qctf_solves').insert({
    run: config.run,
    team_id: team.id,
    challenge_id: row.id,
    solved_by: session.email,
    points: row.points,
  });
  if (error?.code === '23505') {
    return { status: 200, result: { correct: true, alreadySolved: true, message: 'A teammate solved this challenge first.' } };
  }
  if (error) return { status: 500, error: 'The flag is correct, but the solve could not be saved. Submit it again.' };

  await invalidateCache(scoreboardCacheKeys(config.run));
  return {
    status: 200,
    result: { correct: true, pointsAwarded: row.points, message: `Correct flag. ${row.points} points to ${team.name}.` },
  };
}

// ---------------------------------------------------------------------------
// Scoreboard
// ---------------------------------------------------------------------------

function scoreboardCacheKeys(run: string): string[] {
  return [`qctf:scoreboard:${run}:live`, `qctf:scoreboard:${run}:public`];
}

/**
 * Teams ranked by points, ties broken by who reached their total first.
 * With `live: false` (public view) a frozen or closed round only counts solves up to frozenAt.
 */
export async function getQctfScoreboard(config: QctfConfig, { live }: { live: boolean }): Promise<QctfScoreboard> {
  const cutoff = !live && (config.state === 'frozen' || config.state === 'closed') ? config.frozenAt : null;
  const cacheKey = scoreboardCacheKeys(config.run)[live ? 0 : 1];

  return cacheAside(cacheKey, 10, async () => {
    let solvesQuery = supabaseAdmin
      .from('qctf_solves')
      .select('team_id, challenge_id, points, solved_at')
      .eq('run', config.run)
      .order('solved_at', { ascending: true });
    if (cutoff) solvesQuery = solvesQuery.lte('solved_at', cutoff);

    const [{ data: solves }, { data: teams }, { data: challenges }] = await Promise.all([
      solvesQuery,
      supabaseAdmin.from('qctf_teams').select('id, name').eq('run', config.run),
      supabaseAdmin.from('qctf_challenges').select('id, title'),
    ]);

    const teamName = new Map((teams ?? []).map((t) => [t.id, t.name as string]));
    const challengeTitle = new Map((challenges ?? []).map((c) => [c.id, c.title as string]));
    const totals = new Map<string, { points: number; solvedCount: number; lastSolveAt: string | null }>();
    for (const team of teams ?? []) totals.set(team.id, { points: 0, solvedCount: 0, lastSolveAt: null });
    for (const solve of solves ?? []) {
      const total = totals.get(solve.team_id);
      if (!total) continue;
      total.points += solve.points;
      total.solvedCount += 1;
      total.lastSolveAt = solve.solved_at;
    }

    const ranked = [...totals.entries()]
      .map(([teamId, total]) => ({ teamId, teamName: teamName.get(teamId) ?? 'Team', ...total }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          (a.lastSolveAt ?? '9999').localeCompare(b.lastSolveAt ?? '9999') ||
          a.teamName.localeCompare(b.teamName)
      )
      .map((entry, index) => ({ rank: index + 1, ...entry }));

    const recentSolves = [...(solves ?? [])]
      .reverse()
      .slice(0, 12)
      .map((solve) => ({
        teamName: teamName.get(solve.team_id) ?? 'Team',
        challengeTitle: challengeTitle.get(solve.challenge_id) ?? solve.challenge_id,
        points: solve.points,
        solvedAt: solve.solved_at,
      }));

    return {
      state: config.state,
      frozenAt: cutoff,
      generatedAt: new Date().toISOString(),
      entries: ranked,
      recentSolves,
    };
  });
}
