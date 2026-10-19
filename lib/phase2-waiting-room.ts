import { supabaseAdmin } from '@/lib/supabase-admin';
import { PHASE2_DESK_QUOTA } from '@/lib/constants';
import { getParticipantUniversitiesMap } from '@/lib/participant-universities';
import { trackForLeadEmail, type Phase2Track } from '@/lib/participant-track';

export { trackForLeadEmail, type Phase2Track };

// Rolling Phase 2 invitations. Schema: supabase/migrations/20261018150000_create_phase2_waiting_room.sql
//
// Lifecycle of one offer:
//   invited  --lead accepts-->  accepted  --lead pays last-->  confirmed
//      |                           |
//      +-- lead declines / respond_by passes / admin revokes --> declined | expired | revoked
//                                  +-- lead withdraws / pay_by passes / admin revokes --> same
// Every close of an invited/accepted offer frees a desk, and the next waitlisted team in
// the same track (highest jury score) is invited automatically unless auto-promotion is off.

export const PHASE2_OFFERS_TABLE = 'hackathon_phase2_offers';
export const WAITING_ROOM_CONFIG_KEY = 'phase2_waiting_room';

export const DEFAULT_RESPONSE_HOURS = 24;
export const DEFAULT_PAYMENT_HOURS = 24;

export type OfferStatus = 'invited' | 'accepted' | 'confirmed' | 'declined' | 'expired' | 'revoked';

export const ACTIVE_OFFER_STATUSES: OfferStatus[] = ['invited', 'accepted', 'confirmed'];
const OPEN_OFFER_STATUSES: OfferStatus[] = ['invited', 'accepted'];

// Jury statuses written by tools/sync_finalist_evaluations.py: waiting room teams are under_review
export const WAITLIST_EVAL_STATUSES = ['under_review', 'needs_discussion'];

export const DESKS_PER_TRACK: Record<Phase2Track, number> = {
  internal: PHASE2_DESK_QUOTA.internal,
  external: PHASE2_DESK_QUOTA.external,
};

export interface Phase2Offer {
  id: string;
  team_id: string;
  track: Phase2Track;
  status: OfferStatus;
  source: 'admin' | 'auto_promotion';
  replaces_offer_id: string | null;
  replaced_by_offer_id: string | null;
  invited_at: string;
  invited_by: string | null;
  respond_by: string;
  payment_window_hours: number;
  responded_at: string | null;
  responded_by: string | null;
  decline_reason: string | null;
  pay_by: string | null;
  confirmed_at: string | null;
  closed_at: string | null;
  close_reason: string | null;
}

export interface WaitingRoomConfig {
  autoPromote: boolean;
  closedAt: string | null;
  responseHours: number;
  paymentHours: number;
}

const DEFAULT_CONFIG: WaitingRoomConfig = {
  autoPromote: true,
  closedAt: null,
  responseHours: DEFAULT_RESPONSE_HOURS,
  paymentHours: DEFAULT_PAYMENT_HOURS,
};

/** Track lookup using the lead's recorded university (platform_config participant_universities). */
export async function getTrackResolver(): Promise<(leadEmail: string) => Phase2Track> {
  const universities = await getParticipantUniversitiesMap();
  return (leadEmail: string) => trackForLeadEmail(leadEmail, universities[leadEmail.trim().toLowerCase()]);
}

const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

export async function getWaitingRoomConfig(): Promise<WaitingRoomConfig> {
  const { data } = await supabaseAdmin
    .from('platform_config')
    .select('value')
    .eq('key', WAITING_ROOM_CONFIG_KEY)
    .limit(1);
  const value = data?.[0]?.value || {};
  return {
    autoPromote: value.auto_promote ?? DEFAULT_CONFIG.autoPromote,
    closedAt: value.closed_at ?? null,
    responseHours: Number(value.response_hours) || DEFAULT_CONFIG.responseHours,
    paymentHours: Number(value.payment_hours) || DEFAULT_CONFIG.paymentHours,
  };
}

export async function saveWaitingRoomConfig(patch: Partial<WaitingRoomConfig>): Promise<WaitingRoomConfig> {
  const next = { ...(await getWaitingRoomConfig()), ...patch };
  const { error } = await supabaseAdmin.from('platform_config').upsert({
    key: WAITING_ROOM_CONFIG_KEY,
    value: {
      auto_promote: next.autoPromote,
      closed_at: next.closedAt,
      response_hours: next.responseHours,
      payment_hours: next.paymentHours,
    },
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return next;
}

export async function getOfferForTeam(teamId: string): Promise<Phase2Offer | null> {
  const { data } = await supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('*').eq('team_id', teamId).limit(1);
  return (data?.[0] as Phase2Offer) || null;
}

/** Marks the team's jury result visible to the team, keeping the first release time. */
export async function releaseResult(teamId: string): Promise<void> {
  await supabaseAdmin
    .from('submission_evaluations')
    .update({ result_released_at: new Date().toISOString() })
    .eq('category', 'hackathon')
    .eq('target_id', teamId)
    .is('result_released_at', null);
}

interface CreateOfferInput {
  teamId: string;
  track: Phase2Track;
  invitedBy: string;
  source: 'admin' | 'auto_promotion';
  responseHours: number;
  paymentHours: number;
  replacesOfferId?: string | null;
}

/**
 * Inserts a fresh offer. Returns null when the team already has an offer row
 * (unique team_id), which is how concurrent promotions avoid double-inviting.
 */
async function insertOffer(input: CreateOfferInput): Promise<Phase2Offer | null> {
  const { data, error } = await supabaseAdmin
    .from(PHASE2_OFFERS_TABLE)
    .insert({
      team_id: input.teamId,
      track: input.track,
      status: 'invited',
      source: input.source,
      replaces_offer_id: input.replacesOfferId || null,
      invited_by: input.invitedBy,
      respond_by: hoursFromNow(input.responseHours),
      payment_window_hours: input.paymentHours,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') return null;
    throw error;
  }
  await releaseResult(input.teamId);
  return data as Phase2Offer;
}

/**
 * Admin invite. A team whose earlier offer was declined, expired or revoked gets
 * that row reset to a new invitation; a team with an open offer is left alone.
 */
export async function inviteTeam(input: Omit<CreateOfferInput, 'source'>): Promise<Phase2Offer> {
  const created = await insertOffer({ ...input, source: 'admin' });
  if (created) return created;

  const { data, error } = await supabaseAdmin
    .from(PHASE2_OFFERS_TABLE)
    .update({
      track: input.track,
      status: 'invited',
      source: 'admin',
      invited_at: new Date().toISOString(),
      invited_by: input.invitedBy,
      respond_by: hoursFromNow(input.responseHours),
      payment_window_hours: input.paymentHours,
      responded_at: null,
      responded_by: null,
      decline_reason: null,
      pay_by: null,
      confirmed_at: null,
      closed_at: null,
      close_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('team_id', input.teamId)
    .in('status', ['declined', 'expired', 'revoked'])
    .select('*');

  if (error) throw error;
  if (!data?.length) throw new Error('This team already has an open Phase 2 invitation.');
  await releaseResult(input.teamId);
  return data[0] as Phase2Offer;
}

/**
 * Picks the highest-scoring waitlisted team in the track that has never had an
 * offer and invites it. Returns null when the waitlist for the track is empty.
 */
export async function promoteNextFromWaitlist(
  track: Phase2Track,
  replacesOfferId: string | null,
  config?: WaitingRoomConfig
): Promise<Phase2Offer | null> {
  const cfg = config || (await getWaitingRoomConfig());
  if (!cfg.autoPromote || cfg.closedAt) return null;

  const [evalRes, offerRes] = await Promise.all([
    supabaseAdmin
      .from('submission_evaluations')
      .select('target_id, score')
      .eq('category', 'hackathon')
      .in('status', WAITLIST_EVAL_STATUSES),
    supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('team_id'),
  ]);

  const offered = new Set((offerRes.data || []).map((o: any) => String(o.team_id)));
  const candidates = (evalRes.data || []).filter((e: any) => !offered.has(String(e.target_id)));
  if (!candidates.length) return null;

  const { data: teams } = await supabaseAdmin
    .from('hackathon_teams')
    .select('id, lead_email, submitted_at')
    .in('id', candidates.map((c: any) => c.target_id));

  const teamById = new Map((teams || []).map((t: any) => [String(t.id), t]));
  const trackOf = await getTrackResolver();
  const ranked = candidates
    .map((c: any) => ({ ...c, team: teamById.get(String(c.target_id)) }))
    .filter((c: any) => c.team && trackOf(c.team.lead_email) === track)
    .sort(
      (a: any, b: any) =>
        (Number(b.score) || 0) - (Number(a.score) || 0) ||
        String(a.team.submitted_at || '').localeCompare(String(b.team.submitted_at || ''))
    );

  for (const candidate of ranked) {
    const offer = await insertOffer({
      teamId: String(candidate.target_id),
      track,
      invitedBy: 'auto-promotion',
      source: 'auto_promotion',
      responseHours: cfg.responseHours,
      paymentHours: cfg.paymentHours,
      replacesOfferId,
    });
    if (offer) {
      if (replacesOfferId) {
        await supabaseAdmin
          .from(PHASE2_OFFERS_TABLE)
          .update({ replaced_by_offer_id: offer.id })
          .eq('id', replacesOfferId);
      }
      return offer;
    }
  }
  return null;
}

/**
 * Closes an open offer. The conditional update means only one caller can close a
 * given offer, so only that caller promotes a replacement.
 */
export async function closeOffer(
  offerId: string,
  status: 'declined' | 'expired' | 'revoked',
  details: { reason: string; actor?: string; declineReason?: string | null; promote?: boolean }
): Promise<{ closed: Phase2Offer | null; promoted: Phase2Offer | null }> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from(PHASE2_OFFERS_TABLE)
    .update({
      status,
      closed_at: nowIso,
      close_reason: details.reason,
      ...(status === 'declined'
        ? { responded_at: nowIso, responded_by: details.actor || null, decline_reason: details.declineReason || null }
        : {}),
      updated_at: nowIso,
    })
    .eq('id', offerId)
    .in('status', OPEN_OFFER_STATUSES)
    .select('*');

  if (error) throw error;
  const closed = (data?.[0] as Phase2Offer) || null;
  if (!closed || details.promote === false) return { closed, promoted: null };

  const promoted = await promoteNextFromWaitlist(closed.track, closed.id);
  return { closed, promoted };
}

/**
 * Expires invitations past respond_by and accepted offers past pay_by, inviting a
 * replacement for each. Cheap when nothing is overdue; safe to call concurrently.
 */
export async function sweepExpiredOffers(): Promise<{ expired: number; promoted: number }> {
  await startPendingPaymentWindows();
  const nowIso = new Date().toISOString();
  const [lateInvites, latePayments] = await Promise.all([
    supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('id').eq('status', 'invited').lt('respond_by', nowIso),
    supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('id').eq('status', 'accepted').lt('pay_by', nowIso),
  ]);

  const overdue = [
    ...(lateInvites.data || []).map((o: any) => ({ id: o.id, reason: 'no_response' })),
    ...(latePayments.data || []).map((o: any) => ({ id: o.id, reason: 'payment_incomplete' })),
  ];

  let expired = 0;
  let promoted = 0;
  for (const item of overdue) {
    const result = await closeOffer(item.id, 'expired', { reason: item.reason });
    if (result.closed) expired += 1;
    if (result.promoted) promoted += 1;
  }
  return { expired, promoted };
}

/**
 * Payment link state from platform_config flagship_payment (set in the Hackathon admin tab).
 * Read here directly rather than through hackathon-pass to avoid a circular import.
 */
export async function getPaymentLinkOpenedAt(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('platform_config')
    .select('value')
    .eq('key', 'flagship_payment')
    .limit(1);
  const value = data?.[0]?.value || {};
  return value.gateway_url && value.opened_at ? String(value.opened_at) : null;
}

/**
 * Teams can accept before the Easebuzz link exists; their pay_by stays NULL (never expires).
 * Once the link is published, each such team gets its full payment window, counted from
 * whichever is later: its acceptance or the link going live.
 */
export async function startPendingPaymentWindows(): Promise<number> {
  const openedAt = await getPaymentLinkOpenedAt();
  if (!openedAt) return 0;

  const { data: waiting } = await supabaseAdmin
    .from(PHASE2_OFFERS_TABLE)
    .select('id, responded_at, payment_window_hours')
    .eq('status', 'accepted')
    .is('pay_by', null);

  let started = 0;
  for (const offer of waiting || []) {
    const startMs = Math.max(Date.parse(openedAt), Date.parse(offer.responded_at || '') || 0);
    const { data } = await supabaseAdmin
      .from(PHASE2_OFFERS_TABLE)
      .update({
        pay_by: new Date(startMs + offer.payment_window_hours * 3_600_000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', offer.id)
      .is('pay_by', null)
      .select('id');
    if (data?.length) started += 1;
  }
  return started;
}

export function isOfferOverdue(offer: Phase2Offer, now = Date.now()): boolean {
  if (offer.status === 'invited') return Date.parse(offer.respond_by) < now;
  if (offer.status === 'accepted') return Boolean(offer.pay_by) && Date.parse(offer.pay_by!) < now;
  return false;
}

export interface TeamPaymentMember {
  name: string;
  email: string;
  isLead: boolean;
  paid: boolean;
  verified: boolean;
}

export interface TeamPaymentProgress {
  members: TeamPaymentMember[];
  /** Accepted members other than the lead */
  othersTotal: number;
  othersPaid: number;
  allOthersPaid: boolean;
  leadPaid: boolean;
}

/** A Flagship claim counts as paid once submitted; a rejected receipt does not. */
export async function getTeamPaymentProgress(teamId: string, leadEmail: string): Promise<TeamPaymentProgress> {
  const lead = leadEmail.trim().toLowerCase();
  const { data: rows } = await supabaseAdmin
    .from('team_members')
    .select('email, full_name, role, status')
    .eq('team_id', teamId)
    .eq('status', 'accepted');

  const roster = (rows || []).map((m: any) => ({
    email: String(m.email).trim().toLowerCase(),
    name: m.full_name || String(m.email).split('@')[0],
  }));
  if (!roster.some((m) => m.email === lead)) roster.unshift({ email: lead, name: lead.split('@')[0] });

  const { data: claims } = await supabaseAdmin
    .from('festival_pass_claims')
    .select('user_email, status, pass_tier')
    .in('user_email', roster.map((m) => m.email))
    .eq('pass_tier', 'flagship_offline');

  const claimByEmail = new Map((claims || []).map((c: any) => [String(c.user_email).toLowerCase(), c]));

  const members: TeamPaymentMember[] = roster
    .map((m) => {
      const claim = claimByEmail.get(m.email);
      return {
        name: m.name,
        email: m.email,
        isLead: m.email === lead,
        paid: Boolean(claim && claim.status !== 'rejected'),
        verified: claim?.status === 'verified',
      };
    })
    .sort((a, b) => Number(a.isLead) - Number(b.isLead));

  const others = members.filter((m) => !m.isLead);
  const othersPaid = others.filter((m) => m.paid).length;
  return {
    members,
    othersTotal: others.length,
    othersPaid,
    allOthersPaid: othersPaid === others.length,
    leadPaid: members.some((m) => m.isLead && m.paid),
  };
}

/** Called after the lead's Flagship claim is saved: the lead pays last, so the team is complete. */
export async function confirmOfferIfComplete(teamId: string, leadEmail: string): Promise<boolean> {
  const progress = await getTeamPaymentProgress(teamId, leadEmail);
  if (!progress.allOthersPaid || !progress.leadPaid) return false;
  const nowIso = new Date().toISOString();
  const { data } = await supabaseAdmin
    .from(PHASE2_OFFERS_TABLE)
    .update({ status: 'confirmed', confirmed_at: nowIso, updated_at: nowIso })
    .eq('team_id', teamId)
    .eq('status', 'accepted')
    .select('id');
  return Boolean(data?.length);
}
