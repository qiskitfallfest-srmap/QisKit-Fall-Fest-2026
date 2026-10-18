import { supabaseAdmin } from '@/lib/supabase-admin';
import { ONLINE_SUBMISSIONS_CLOSE_ISO } from '@/lib/constants';

// Admin-controlled switch: shortlist/reject marks stay hidden from participants until published
export const RESULTS_CONFIG_KEY = 'hackathon_phase1_results';
export const PHASE1_DEADLINE_ISO = ONLINE_SUBMISSIONS_CLOSE_ISO;
export const RESULTS_EXPECTED_LABEL = '18 October 2026';

// Admin-controlled switch for the ₹499 Flagship Pass. Opening it stamps opened_at,
// which starts the fixed payment window shown as a countdown on shortlisted cards.
export const FLAGSHIP_PAYMENT_CONFIG_KEY = 'flagship_payment';
export const FLAGSHIP_PAYMENT_WINDOW_HOURS = 48;
export const FLAGSHIP_PAYMENT_EXPECTED_LABEL = '19 October 2026';

export interface FlagshipPaymentWindow {
  status: 'not_open' | 'open' | 'closed';
  openedAt: string | null;
  deadlineIso: string | null;
  gatewayUrl: string | null;
  expectedLabel: string;
  windowHours: number;
}

export async function getFlagshipPaymentWindow(): Promise<FlagshipPaymentWindow> {
  const { data } = await supabaseAdmin
    .from('platform_config')
    .select('value')
    .eq('key', FLAGSHIP_PAYMENT_CONFIG_KEY)
    .limit(1);

  const value = data?.[0]?.value || {};
  const openedAt: string | null = value.opened_at || null;
  const gatewayUrl: string | null = value.gateway_url || null;
  const openedMs = openedAt ? new Date(openedAt).getTime() : NaN;

  const base = {
    expectedLabel: FLAGSHIP_PAYMENT_EXPECTED_LABEL,
    windowHours: FLAGSHIP_PAYMENT_WINDOW_HOURS,
  };

  if (!gatewayUrl || Number.isNaN(openedMs)) {
    return { ...base, status: 'not_open', openedAt: null, deadlineIso: null, gatewayUrl: null };
  }

  const deadlineMs = openedMs + FLAGSHIP_PAYMENT_WINDOW_HOURS * 60 * 60 * 1000;
  return {
    ...base,
    status: Date.now() < deadlineMs ? 'open' : 'closed',
    openedAt,
    deadlineIso: new Date(deadlineMs).toISOString(),
    gatewayUrl,
  };
}

export type HackathonOutcome = 'pending' | 'shortlisted' | 'not_shortlisted';

export interface HackathonPassContext {
  teamId: string;
  teamName: string;
  isLead: boolean;
  submittedAt: string | null;
  resultsPublished: boolean;
  outcome: HackathonOutcome;
}

/**
 * Resolves the user's hackathon team, Phase 1 submission state and, once results
 * are published, whether the team was shortlisted. Returns null for non-participants.
 */
export async function getHackathonPassContext(email: string): Promise<HackathonPassContext | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // limit(1) rather than maybeSingle(): duplicate rows must not silently drop the match
  const [leadRes, memberRes] = await Promise.all([
    supabaseAdmin
      .from('hackathon_teams')
      .select('id, name, submitted_at, github_repo_url')
      .ilike('lead_email', normalizedEmail)
      .limit(1),
    supabaseAdmin
      .from('team_members')
      .select('team_id')
      .ilike('email', normalizedEmail)
      .eq('status', 'accepted')
      .limit(1),
  ]);

  let team = leadRes.data?.[0] || null;
  const isLead = Boolean(team);

  if (!team && memberRes.data?.[0]?.team_id) {
    const { data } = await supabaseAdmin
      .from('hackathon_teams')
      .select('id, name, submitted_at, github_repo_url')
      .eq('id', memberRes.data[0].team_id)
      .limit(1);
    team = data?.[0] || null;
  }

  if (!team) return null;

  const [configRes, evalRes] = await Promise.all([
    supabaseAdmin.from('platform_config').select('value').eq('key', RESULTS_CONFIG_KEY).limit(1),
    supabaseAdmin
      .from('submission_evaluations')
      .select('is_next_round, status')
      .eq('category', 'hackathon')
      .eq('target_id', String(team.id))
      .limit(1),
  ]);

  const resultsPublished = Boolean(configRes.data?.[0]?.value?.published);
  const evaluation = evalRes.data?.[0];
  const isShortlisted =
    Boolean(evaluation?.is_next_round) ||
    ['shortlisted', 'finalist', 'winner'].includes(evaluation?.status || '');

  const hasSubmitted = Boolean(team.submitted_at || team.github_repo_url);
  const deadlinePassed = Date.now() > new Date(PHASE1_DEADLINE_ISO).getTime();

  let outcome: HackathonOutcome;
  if (!hasSubmitted && deadlinePassed) {
    // If the submission window has closed and the team never submitted,
    // they cannot be shortlisted for Phase 2. Immediately unlock the General Pass.
    outcome = 'not_shortlisted';
  } else if (!resultsPublished) {
    outcome = 'pending';
  } else if (isShortlisted) {
    outcome = 'shortlisted';
  } else {
    outcome = 'not_shortlisted';
  }

  return {
    teamId: String(team.id),
    teamName: team.name,
    isLead,
    // Admin console treats a linked repo as a submission, so accept either signal
    submittedAt: team.submitted_at || (team.github_repo_url ? 'submitted' : null),
    resultsPublished,
    outcome,
  };
}
