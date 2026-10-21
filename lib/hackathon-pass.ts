import { supabaseAdmin } from '@/lib/supabase-admin';
import { ONLINE_SUBMISSIONS_CLOSE_ISO } from '@/lib/constants';
import {
  PHASE2_OFFERS_TABLE,
  WAITLIST_EVAL_STATUSES,
  getOfferForTeam,
  getPaymentLinkOpenedAt,
  getTeamPaymentProgress,
  getWaitingRoomConfig,
  isOfferOverdue,
  sweepExpiredOffers,
  getTrackResolver,
  type Phase2Track,
  type TeamPaymentProgress,
} from '@/lib/phase2-waiting-room';

// Legacy admin switch: releases every team's jury decision at once. Results are now
// normally released team by team from the Phase 2 admin view (result_released_at).
export const RESULTS_CONFIG_KEY = 'hackathon_phase1_results';
export const PHASE1_DEADLINE_ISO = ONLINE_SUBMISSIONS_CLOSE_ISO;
export const RESULTS_EXPECTED_LABEL = '18 October 2026';

// Holds the Easebuzz link for the ₹499 Flagship Pass. Payment deadlines are per team
// (hackathon_phase2_offers.pay_by); opened_at only marks when the link was published.
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

/**
 * Payment window for one team: open from acceptance until its own pay_by, using the
 * shared Easebuzz link. 'not_open' while the admin has not published the link yet.
 */
export async function getTeamFlagshipPaymentWindow(phase2: Phase2TeamStatus): Promise<FlagshipPaymentWindow> {
  const global = await getFlagshipPaymentWindow();
  const base = {
    expectedLabel: global.expectedLabel,
    windowHours: phase2.paymentWindowHours,
    openedAt: global.openedAt,
    deadlineIso: phase2.payBy,
    gatewayUrl: global.gatewayUrl,
  };
  // If the team is confirmed AND every member has already submitted their pass, payment is closed.
  // Otherwise (e.g. a newly added member needs to pay), keep the window open until payBy.
  if (phase2.stage === 'confirmed' && (!phase2.payment || (phase2.payment.allOthersPaid && phase2.payment.leadPaid))) {
    return { ...base, status: 'closed' };
  }
  if ((phase2.stage !== 'accepted' && phase2.stage !== 'confirmed') || !phase2.payBy) return { ...base, status: 'not_open' };
  if (Date.now() >= Date.parse(phase2.payBy)) return { ...base, status: 'closed' };
  return { ...base, status: global.gatewayUrl ? 'open' : 'not_open' };
}

export type HackathonOutcome = 'pending' | 'shortlisted' | 'not_shortlisted';

/** Where the team stands in the rolling Phase 2 process, as shown to its members. */
export type Phase2Stage =
  | 'under_review'
  | 'no_submission'
  | 'waitlisted'
  | 'invited'
  | 'accepted'
  | 'confirmed'
  | 'declined'
  | 'expired'
  | 'revoked'
  | 'not_selected';

export interface Phase2TeamStatus {
  stage: Phase2Stage;
  track: Phase2Track;
  invitedAt: string | null;
  respondBy: string | null;
  payBy: string | null;
  paymentWindowHours: number;
  autoPromoted: boolean;
  closeReason: string | null;
  declineReason: string | null;
  /** Jury score and note, only once the team's result is released */
  score: number | null;
  maxScore: number | null;
  feedback: string | null;
  waitlistPosition: number | null;
  waitlistSize: number | null;
  /** True when the team was waitlisted and the waiting room closed without a desk for it */
  waitingRoomClosed: boolean;
  /** False until the Easebuzz link is set; accepted teams' payment clocks start then */
  paymentLinkPublished: boolean;
  paymentLinkExpectedLabel: string;
  payment: TeamPaymentProgress | null;
}

export interface HackathonPassContext {
  teamId: string;
  teamName: string;
  isLead: boolean;
  submittedAt: string | null;
  resultsPublished: boolean;
  outcome: HackathonOutcome;
  /** Display-only: the team is in the Phase 2 waiting room. Pass eligibility still follows `outcome`. */
  isWaitlisted: boolean;
  phase2: Phase2TeamStatus;
}

// Pass eligibility per stage: only teams that accepted their invitation pay the Flagship Pass;
// teams still waiting (review, waitlist, unanswered invitation) cannot buy a General Pass yet.
const STAGE_OUTCOME: Record<Phase2Stage, HackathonOutcome> = {
  under_review: 'pending',
  waitlisted: 'pending',
  invited: 'pending',
  accepted: 'shortlisted',
  confirmed: 'shortlisted',
  no_submission: 'not_shortlisted',
  declined: 'not_shortlisted',
  expired: 'not_shortlisted',
  revoked: 'not_shortlisted',
  not_selected: 'not_shortlisted',
};

async function getWaitlistPosition(teamId: string, track: Phase2Track) {
  const [evalRes, offerRes] = await Promise.all([
    supabaseAdmin
      .from('submission_evaluations')
      .select('target_id, score')
      .eq('category', 'hackathon')
      .in('status', WAITLIST_EVAL_STATUSES),
    supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('team_id'),
  ]);
  const offered = new Set((offerRes.data || []).map((o: any) => String(o.team_id)));
  const pool = (evalRes.data || []).filter((e: any) => !offered.has(String(e.target_id)));
  if (!pool.length) return { position: null, size: null };

  const { data: teams } = await supabaseAdmin
    .from('hackathon_teams')
    .select('id, lead_email, submitted_at')
    .in('id', pool.map((e: any) => e.target_id));
  const teamById = new Map((teams || []).map((t: any) => [String(t.id), t]));
  const trackOf = await getTrackResolver();

  // Same ordering as promoteNextFromWaitlist
  const ranked = pool
    .map((e: any) => ({ ...e, team: teamById.get(String(e.target_id)) }))
    .filter((e: any) => e.team && trackOf(e.team.lead_email) === track)
    .sort(
      (a: any, b: any) =>
        (Number(b.score) || 0) - (Number(a.score) || 0) ||
        String(a.team.submitted_at || '').localeCompare(String(b.team.submitted_at || ''))
    );
  const index = ranked.findIndex((e: any) => String(e.target_id) === teamId);
  return { position: index >= 0 ? index + 1 : null, size: ranked.length };
}

/**
 * Resolves the user's hackathon team, Phase 1 submission state and the team's
 * Phase 2 standing (released result, invitation, payment). Returns null for non-participants.
 */
export async function getHackathonPassContext(email: string): Promise<HackathonPassContext | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // limit(1) rather than maybeSingle(): duplicate rows must not silently drop the match
  const [leadRes, memberRes] = await Promise.all([
    supabaseAdmin
      .from('hackathon_teams')
      .select('id, name, lead_email, submitted_at, github_repo_url')
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
      .select('id, name, lead_email, submitted_at, github_repo_url')
      .eq('id', memberRes.data[0].team_id)
      .limit(1);
    team = data?.[0] || null;
  }

  if (!team) return null;
  const teamId = String(team.id);

  const [configRes, evalRes, initialOffer, waitingRoom, linkOpenedAt] = await Promise.all([
    supabaseAdmin.from('platform_config').select('value').eq('key', RESULTS_CONFIG_KEY).limit(1),
    supabaseAdmin
      .from('submission_evaluations')
      .select('status, score, max_score, participant_feedback, result_released_at')
      .eq('category', 'hackathon')
      .eq('target_id', teamId)
      .limit(1),
    getOfferForTeam(teamId),
    getWaitingRoomConfig(),
    getPaymentLinkOpenedAt(),
  ]);

  // Deadlines are enforced lazily: an overdue offer is expired (and its desk re-offered) on read
  let offer = initialOffer;
  const paymentClockPending = offer?.status === 'accepted' && !offer.pay_by && Boolean(linkOpenedAt);
  if (offer && (isOfferOverdue(offer) || paymentClockPending)) {
    await sweepExpiredOffers();
    offer = await getOfferForTeam(teamId);
  }

  const legacyPublished = Boolean(configRes.data?.[0]?.value?.published);
  const evaluation = evalRes.data?.[0];
  const released = Boolean(offer) || Boolean(evaluation?.result_released_at) || legacyPublished;

  const hasSubmitted = Boolean(team.submitted_at || team.github_repo_url);
  const deadlinePassed = Date.now() > new Date(PHASE1_DEADLINE_ISO).getTime();
  const track = offer?.track || (await getTrackResolver())(team.lead_email);
  const isWaitlistEval = WAITLIST_EVAL_STATUSES.includes(evaluation?.status || '');

  let stage: Phase2Stage;
  if (offer) stage = offer.status;
  else if (!hasSubmitted && deadlinePassed) stage = 'no_submission';
  else if (!released || !evaluation) stage = 'under_review';
  else if (evaluation.status === 'rejected') stage = 'not_selected';
  else if (isWaitlistEval) stage = waitingRoom.closedAt ? 'not_selected' : 'waitlisted';
  // Shortlisted by the jury but not yet invited from the admin console
  else stage = 'under_review';

  const waitlist = stage === 'waitlisted' ? await getWaitlistPosition(teamId, track) : null;
  const payment =
    stage === 'invited' || stage === 'accepted' || stage === 'confirmed'
      ? await getTeamPaymentProgress(teamId, team.lead_email)
      : null;
  const showJuryNote = released && stage !== 'under_review';

  return {
    teamId,
    teamName: team.name,
    isLead,
    // Admin console treats a linked repo as a submission, so accept either signal
    submittedAt: team.submitted_at || (team.github_repo_url ? 'submitted' : null),
    resultsPublished: stage !== 'under_review',
    outcome: STAGE_OUTCOME[stage],
    isWaitlisted: stage === 'waitlisted',
    phase2: {
      stage,
      track,
      invitedAt: offer?.invited_at || null,
      respondBy: offer?.respond_by || null,
      payBy: offer?.pay_by || null,
      paymentWindowHours: offer?.payment_window_hours || waitingRoom.paymentHours,
      autoPromoted: offer?.source === 'auto_promotion',
      closeReason: offer?.close_reason || null,
      declineReason: offer?.decline_reason || null,
      score: showJuryNote && evaluation?.score != null ? Number(evaluation.score) : null,
      maxScore: showJuryNote && evaluation?.max_score != null ? Number(evaluation.max_score) : null,
      feedback: showJuryNote ? evaluation?.participant_feedback || null : null,
      waitlistPosition: waitlist?.position ?? null,
      waitlistSize: waitlist?.size ?? null,
      waitingRoomClosed: isWaitlistEval && !offer && Boolean(waitingRoom.closedAt),
      payment,
      paymentLinkPublished: Boolean(linkOpenedAt),
      paymentLinkExpectedLabel: FLAGSHIP_PAYMENT_EXPECTED_LABEL,
    },
  };
}
