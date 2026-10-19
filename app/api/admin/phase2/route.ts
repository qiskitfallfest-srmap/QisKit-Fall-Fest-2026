import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { invalidateCache } from '@/lib/redis';
import { getFlagshipPaymentWindow, PHASE1_DEADLINE_ISO } from '@/lib/hackathon-pass';
import {
  ACTIVE_OFFER_STATUSES,
  DESKS_PER_TRACK,
  PHASE2_OFFERS_TABLE,
  WAITLIST_EVAL_STATUSES,
  closeOffer,
  getWaitingRoomConfig,
  inviteTeam,
  releaseResult,
  saveWaitingRoomConfig,
  sweepExpiredOffers,
  getTrackResolver,
  type OfferStatus,
  type Phase2Offer,
  type Phase2Track,
  type WaitingRoomConfig,
} from '@/lib/phase2-waiting-room';

export const dynamic = 'force-dynamic';

/** Admin-facing stage. "undecided" rows carry the jury's suggestion in juryStatus. */
export type AdminPhase2Stage = OfferStatus | 'undecided' | 'waitlisted' | 'not_selected' | 'no_submission';

export interface AdminPhase2Row {
  teamId: string;
  name: string;
  leadName: string;
  leadEmail: string;
  vertical: string;
  problemStatementId: string;
  track: Phase2Track;
  membersCount: number;
  submitted: boolean;
  repoUrl: string | null;
  score: number | null;
  maxScore: number;
  juryStatus: string | null;
  feedback: string;
  releasedAt: string | null;
  stage: AdminPhase2Stage;
  offer: Phase2Offer | null;
  /** Accepted roster, lead first; claim is filled only once the team has accepted */
  members: AdminPhase2Member[];
  payment: { paid: number; verified: number; pending: number; rejected: number; total: number } | null;
}

export interface AdminPhase2Claim {
  id: string;
  status: 'claimed_provisional' | 'verified' | 'rejected' | string;
  transactionReference: string;
  bankReference: string | null;
  receiptUrl: string | null;
  amountInr: number;
  adminNotes: string | null;
  submittedAt: string;
  checkedIn: boolean;
}

export interface AdminPhase2Member {
  name: string;
  email: string;
  isLead: boolean;
  claim: AdminPhase2Claim | null;
}

export interface AdminPhase2Data {
  rows: AdminPhase2Row[];
  config: WaitingRoomConfig;
  gatewayPublished: boolean;
  summary: {
    dispatched: number;
    awaitingResponse: number;
    accepted: number;
    confirmed: number;
    declined: number;
    expired: number;
    revoked: number;
    notSelectedReleased: number;
    waitlistedReleased: number;
    waitlistRemaining: Record<Phase2Track, number>;
    membersPaid: number;
    receiptsToVerify: number;
    membersToPay: number;
    desks: Record<Phase2Track, { active: number; quota: number }>;
    undecided: number;
    verticalsBreakdown: Record<string, { total: number; accepted: number; invited: number; participants: number }>;
    problemStatementsBreakdown: Record<string, { total: number; accepted: number; invited: number; participants: number; vertical: string }>;
  };
}

async function requireAdmin() {
  const session = await getServerSession();
  return session?.isAdmin ? session : null;
}

async function loadData(): Promise<AdminPhase2Data> {
  await sweepExpiredOffers();

  const [teamsRes, membersRes, evalsRes, offersRes, config, flagship] = await Promise.all([
    supabaseAdmin.from('hackathon_teams').select('id, name, lead_name, lead_email, submitted_at, github_repo_url, vertical, problem_statement_id'),
    supabaseAdmin.from('team_members').select('team_id, email, full_name').eq('status', 'accepted'),
    supabaseAdmin
      .from('submission_evaluations')
      .select('target_id, status, score, max_score, participant_feedback, result_released_at')
      .eq('category', 'hackathon'),
    supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('*'),
    getWaitingRoomConfig(),
    getFlagshipPaymentWindow(),
  ]);
  const trackOf = await getTrackResolver();
  if (teamsRes.error) throw teamsRes.error;
  if (offersRes.error) throw offersRes.error;

  // team id -> (email -> name)
  const membersByTeam = new Map<string, Map<string, string>>();
  (membersRes.data || []).forEach((m: any) => {
    const key = String(m.team_id);
    if (!membersByTeam.has(key)) membersByTeam.set(key, new Map());
    const email = String(m.email).trim().toLowerCase();
    membersByTeam.get(key)!.set(email, m.full_name || email.split('@')[0]);
  });
  const evalByTeam = new Map((evalsRes.data || []).map((e: any) => [String(e.target_id), e]));
  const offerByTeam = new Map((offersRes.data || []).map((o: any) => [String(o.team_id), o as Phase2Offer]));

  // Flagship receipts for members of teams that accepted
  const payingTeams = (offersRes.data || []).filter((o: any) => ['accepted', 'confirmed'].includes(o.status));
  const payingEmails = payingTeams.flatMap((o: any) => {
    const team = (teamsRes.data || []).find((t: any) => String(t.id) === String(o.team_id));
    const set = new Set(membersByTeam.get(String(o.team_id))?.keys() || []);
    if (team) set.add(String(team.lead_email).trim().toLowerCase());
    return [...set];
  });
  const claimByEmail = new Map<string, AdminPhase2Claim>();
  if (payingEmails.length) {
    const { data: claims } = await supabaseAdmin
      .from('festival_pass_claims')
      .select('id, user_email, status, transaction_reference, bank_reference, receipt_url, amount_inr, admin_notes, created_at, checked_in')
      .eq('pass_tier', 'flagship_offline')
      .in('user_email', payingEmails);
    (claims || []).forEach((c: any) =>
      claimByEmail.set(String(c.user_email).toLowerCase(), {
        id: c.id,
        status: c.status,
        transactionReference: c.transaction_reference,
        bankReference: c.bank_reference || null,
        receiptUrl: c.receipt_url || null,
        amountInr: Number(c.amount_inr),
        adminNotes: c.admin_notes || null,
        submittedAt: c.created_at,
        checkedIn: Boolean(c.checked_in),
      })
    );
  }

  const deadlinePassed = Date.now() > Date.parse(PHASE1_DEADLINE_ISO);

  const rows: AdminPhase2Row[] = (teamsRes.data || []).map((t: any) => {
    const teamId = String(t.id);
    const evaluation = evalByTeam.get(teamId);
    const offer = offerByTeam.get(teamId) || null;
    const leadEmail = String(t.lead_email).trim().toLowerCase();
    const roster = new Map(membersByTeam.get(teamId) || []);
    roster.set(leadEmail, roster.get(leadEmail) || t.lead_name || leadEmail.split('@')[0]);
    const paying = Boolean(offer && ['accepted', 'confirmed'].includes(offer.status));
    const members: AdminPhase2Member[] = [...roster.entries()]
      .map(([email, name]) => ({
        name,
        email,
        isLead: email === leadEmail,
        claim: paying ? claimByEmail.get(email) || null : null,
      }))
      .sort((a, b) => Number(b.isLead) - Number(a.isLead) || a.name.localeCompare(b.name));
    const submitted = Boolean(t.submitted_at || t.github_repo_url);
    const released = Boolean(evaluation?.result_released_at);

    let stage: AdminPhase2Stage;
    if (offer) stage = offer.status;
    else if (!submitted && deadlinePassed) stage = 'no_submission';
    else if (released && evaluation?.status === 'rejected') stage = 'not_selected';
    else if (released && WAITLIST_EVAL_STATUSES.includes(evaluation?.status)) {
      stage = config.closedAt ? 'not_selected' : 'waitlisted';
    } else stage = 'undecided';

    let payment: AdminPhase2Row['payment'] = null;
    if (paying) {
      const statuses = members.map((m) => m.claim?.status);
      payment = {
        total: members.length,
        paid: statuses.filter((st) => st && st !== 'rejected').length,
        verified: statuses.filter((st) => st === 'verified').length,
        pending: statuses.filter((st) => st === 'claimed_provisional').length,
        rejected: statuses.filter((st) => st === 'rejected').length,
      };
    }

    return {
      teamId,
      name: t.name,
      leadName: t.lead_name,
      leadEmail: t.lead_email,
      vertical: t.vertical || 'Unspecified',
      problemStatementId: t.problem_statement_id || 'Unspecified',
      track: offer?.track || trackOf(t.lead_email),
      membersCount: members.length,
      submitted,
      repoUrl: t.github_repo_url || null,
      score: evaluation?.score != null ? Number(evaluation.score) : null,
      maxScore: evaluation?.max_score != null ? Number(evaluation.max_score) : 100,
      juryStatus: evaluation?.status || null,
      feedback: evaluation?.participant_feedback || '',
      releasedAt: evaluation?.result_released_at || null,
      stage,
      offer,
      members,
      payment,
    };
  });

  rows.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name));

  const count = (stage: AdminPhase2Stage) => rows.filter((r) => r.stage === stage).length;
  const desks = { internal: { active: 0, quota: DESKS_PER_TRACK.internal }, external: { active: 0, quota: DESKS_PER_TRACK.external } };
  const waitlistRemaining = { internal: 0, external: 0 };
  const verticalsBreakdown: Record<string, { total: number; accepted: number; invited: number; participants: number }> = {};
  const problemStatementsBreakdown: Record<string, { total: number; accepted: number; invited: number; participants: number; vertical: string }> = {};

  rows.forEach((r) => {
    if (r.offer && ACTIVE_OFFER_STATUSES.includes(r.offer.status)) {
      desks[r.track].active += 1;

      const v = r.vertical || 'Unspecified';
      const ps = r.problemStatementId || 'Unspecified';
      const isAccepted = ['accepted', 'confirmed'].includes(r.stage);
      const isInvited = r.stage === 'invited';

      if (!verticalsBreakdown[v]) {
        verticalsBreakdown[v] = { total: 0, accepted: 0, invited: 0, participants: 0 };
      }
      verticalsBreakdown[v].total += 1;
      verticalsBreakdown[v].participants += r.membersCount;
      if (isAccepted) verticalsBreakdown[v].accepted += 1;
      if (isInvited) verticalsBreakdown[v].invited += 1;

      if (!problemStatementsBreakdown[ps]) {
        problemStatementsBreakdown[ps] = { total: 0, accepted: 0, invited: 0, participants: 0, vertical: v };
      }
      problemStatementsBreakdown[ps].total += 1;
      problemStatementsBreakdown[ps].participants += r.membersCount;
      if (isAccepted) problemStatementsBreakdown[ps].accepted += 1;
      if (isInvited) problemStatementsBreakdown[ps].invited += 1;
    }
    if (!r.offer && WAITLIST_EVAL_STATUSES.includes(r.juryStatus || '') && !config.closedAt) waitlistRemaining[r.track] += 1;
  });

  return {
    rows,
    config,
    gatewayPublished: Boolean(flagship.gatewayUrl),
    summary: {
      dispatched: rows.filter((r) => r.offer).length,
      awaitingResponse: count('invited'),
      accepted: count('accepted') + count('confirmed'),
      confirmed: count('confirmed'),
      declined: count('declined'),
      expired: count('expired'),
      revoked: count('revoked'),
      notSelectedReleased: count('not_selected'),
      waitlistedReleased: count('waitlisted'),
      waitlistRemaining,
      membersPaid: rows.reduce((n, r) => n + (r.payment?.paid || 0), 0),
      receiptsToVerify: rows.reduce((n, r) => n + (r.payment?.pending || 0), 0),
      membersToPay: rows.reduce((n, r) => n + (r.payment?.total || 0), 0),
      desks,
      undecided: count('undecided'),
      verticalsBreakdown,
      problemStatementsBreakdown,
    },
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  try {
    return NextResponse.json({ success: true, data: await loadData() });
  } catch (err: any) {
    console.error('[Admin Phase 2 GET Error]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load Phase 2 data.' }, { status: 500 });
  }
}

const clampHours = (value: unknown, fallback: number) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 && n <= 240 ? n : fallback;
};

async function setJuryDecision(teamIds: string[], status: 'rejected' | 'under_review', adminEmail: string, adminName: string) {
  const nowIso = new Date().toISOString();
  const { error } = await supabaseAdmin.from('submission_evaluations').upsert(
    teamIds.map((teamId) => ({
      category: 'hackathon',
      target_id: teamId,
      status,
      is_next_round: false,
      last_evaluated_by_email: adminEmail,
      last_evaluated_by_name: adminName,
      updated_at: nowIso,
    })),
    { onConflict: 'category,target_id' }
  );
  if (error) throw error;
  await Promise.all(teamIds.map((id) => releaseResult(id)));
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action: string = body?.action;
    const teamIds: string[] = Array.isArray(body?.teamIds) ? body.teamIds.map(String) : body?.teamId ? [String(body.teamId)] : [];
    const config = await getWaitingRoomConfig();
    const results: { teamId: string; ok: boolean; message?: string }[] = [];

    switch (action) {
      case 'save': {
        // Score and the note shown to the team. Does not release anything.
        const teamId = teamIds[0];
        if (!teamId) return NextResponse.json({ error: 'teamId is required.' }, { status: 400 });
        const score = body.score === '' || body.score == null ? null : Number(body.score);
        if (score != null && (!Number.isFinite(score) || score < 0 || score > 100)) {
          return NextResponse.json({ error: 'Score must be between 0 and 100.' }, { status: 400 });
        }
        const { error } = await supabaseAdmin.from('submission_evaluations').upsert(
          {
            category: 'hackathon',
            target_id: teamId,
            score,
            participant_feedback: String(body.feedback || '').trim().slice(0, 2000) || null,
            last_evaluated_by_email: session.email,
            last_evaluated_by_name: session.fullName,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'category,target_id' }
        );
        if (error) throw error;
        break;
      }

      case 'invite': {
        const { data: teams } = await supabaseAdmin.from('hackathon_teams').select('id, lead_email').in('id', teamIds);
        const responseHours = clampHours(body.responseHours, config.responseHours);
        const paymentHours = clampHours(body.paymentHours, config.paymentHours);
        const trackOf = await getTrackResolver();
        for (const team of teams || []) {
          try {
            await inviteTeam({
              teamId: String(team.id),
              track: trackOf(team.lead_email),
              invitedBy: session.email,
              responseHours,
              paymentHours,
            });
            results.push({ teamId: String(team.id), ok: true });
          } catch (err: any) {
            results.push({ teamId: String(team.id), ok: false, message: err?.message });
          }
        }
        break;
      }

      case 'waitlist':
      case 'reject': {
        // A team holding an open invitation must be revoked first
        const { data: openOffers } = await supabaseAdmin
          .from(PHASE2_OFFERS_TABLE)
          .select('team_id')
          .in('team_id', teamIds)
          .in('status', ACTIVE_OFFER_STATUSES);
        const blocked = new Set((openOffers || []).map((o: any) => String(o.team_id)));
        const allowed = teamIds.filter((id) => !blocked.has(id));
        if (allowed.length) {
          await setJuryDecision(allowed, action === 'reject' ? 'rejected' : 'under_review', session.email, session.fullName);
        }
        teamIds.forEach((id) =>
          results.push(blocked.has(id) ? { teamId: id, ok: false, message: 'Has an active invitation; revoke it first.' } : { teamId: id, ok: true })
        );
        break;
      }

      case 'extend': {
        const hours = clampHours(body.hours, 12);
        const { data: offers } = await supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('*').in('team_id', teamIds);
        for (const offer of (offers || []) as Phase2Offer[]) {
          const field = offer.status === 'invited' ? 'respond_by' : offer.status === 'accepted' ? 'pay_by' : null;
          if (!field) {
            results.push({ teamId: offer.team_id, ok: false, message: 'Only open invitations can be extended.' });
            continue;
          }
          if (field === 'pay_by' && !offer.pay_by) {
            results.push({ teamId: offer.team_id, ok: false, message: 'Payment window has not started yet (no payment link).' });
            continue;
          }
          // Extend from whichever is later: the current deadline or now
          const base = Math.max(Date.parse((offer as any)[field] || ''), Date.now()) || Date.now();
          await supabaseAdmin
            .from(PHASE2_OFFERS_TABLE)
            .update({ [field]: new Date(base + hours * 3_600_000).toISOString(), updated_at: new Date().toISOString() })
            .eq('id', offer.id)
            .eq('status', offer.status);
          results.push({ teamId: offer.team_id, ok: true });
        }
        break;
      }

      case 'revoke': {
        const { data: offers } = await supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('id, team_id').in('team_id', teamIds);
        for (const offer of offers || []) {
          const { closed, promoted } = await closeOffer(offer.id, 'revoked', {
            reason: 'revoked_by_admin',
            promote: body.promote !== false,
          });
          results.push({
            teamId: String(offer.team_id),
            ok: Boolean(closed),
            message: closed ? (promoted ? 'Next waitlisted team invited.' : undefined) : 'Offer was not open.',
          });
        }
        break;
      }

      case 'settings': {
        await saveWaitingRoomConfig({
          autoPromote: typeof body.autoPromote === 'boolean' ? body.autoPromote : config.autoPromote,
          responseHours: clampHours(body.responseHours, config.responseHours),
          paymentHours: clampHours(body.paymentHours, config.paymentHours),
        });
        break;
      }

      case 'close_waiting_room':
        await saveWaitingRoomConfig({ closedAt: new Date().toISOString() });
        break;

      case 'reopen_waiting_room':
        await saveWaitingRoomConfig({ closedAt: null });
        break;

      case 'sweep':
        break;

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    await invalidateCache('admin:hackathon_details');
    return NextResponse.json({ success: true, results, data: await loadData() });
  } catch (err: any) {
    console.error('[Admin Phase 2 POST Error]:', err);
    return NextResponse.json({ error: err?.message || 'Action failed.' }, { status: 500 });
  }
}
