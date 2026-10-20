import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { invalidateCache } from '@/lib/redis';
import { getResultsReveal, setResultsRevealAt } from '@/lib/competition-reveal';
import {
  COMPETITION_TYPES,
  OUTCOME_BY_STATUS,
  isAwardRank,
  type AwardRank,
  type CompetitionOutcome,
  type CompetitionType,
} from '@/lib/competition-results';

export const dynamic = 'force-dynamic';

/** Admin-facing stage: undecided = no releasable jury decision yet. */
export type AdminCompetitionResultStage = 'undecided' | 'ready' | 'released';

export interface AdminCompetitionResultRow {
  id: string;
  type: CompetitionType;
  email: string;
  name: string;
  title: string | null;
  url: string;
  submittedAt: string;
  juryStatus: string;
  outcome: CompetitionOutcome | null;
  score: number | null;
  maxScore: number;
  /** Placement among the winners; null when not placed or before the award_rank migration */
  awardRank: AwardRank | null;
  feedback: string;
  releasedAt: string | null;
  notesCount: number;
  stage: AdminCompetitionResultStage;
}

export interface AdminCompetitionResultsData {
  rows: AdminCompetitionResultRow[];
  /** Released results are visible to participants from this time (Valedictory Ceremony) */
  revealAt: string;
  revealed: boolean;
  summary: Record<
    CompetitionType,
    { total: number; undecided: number; ready: number; released: number; winners: number; finalists: number }
  >;
}

/** Statuses an admin can set from the results view. */
const SETTABLE_STATUSES = ['winner', 'finalist', 'shortlisted', 'rejected', 'under_review'];

async function requireAdmin() {
  const session = await getServerSession();
  return session?.isAdmin ? session : null;
}

async function loadData(): Promise<AdminCompetitionResultsData> {
  const [subsRes, evalsRes, ranksRes] = await Promise.all([
    supabaseAdmin
      .from('competition_submissions')
      .select('id, email, competition_type, submission_url, submission_title, submitted_at'),
    supabaseAdmin
      .from('submission_evaluations')
      .select('target_id, status, score, max_score, participant_feedback, result_released_at, comments')
      .in('category', COMPETITION_TYPES),
    // Separate query so the view keeps working before the award_rank migration
    supabaseAdmin
      .from('submission_evaluations')
      .select('target_id, award_rank')
      .in('category', COMPETITION_TYPES)
      .not('award_rank', 'is', null),
  ]);
  if (subsRes.error) throw subsRes.error;
  if (evalsRes.error) throw evalsRes.error;
  const rankById = new Map((ranksRes.data || []).map((ev: any) => [String(ev.target_id), Number(ev.award_rank)]));

  const subs = subsRes.data || [];
  const evalById = new Map((evalsRes.data || []).map((ev: any) => [String(ev.target_id), ev]));

  const emails = Array.from(new Set(subs.map((s) => String(s.email).toLowerCase())));
  const nameMap = new Map<string, string>();
  if (emails.length) {
    const [allowedRes, regRes] = await Promise.all([
      supabaseAdmin.from('allowed_emails').select('email, full_name').in('email', emails),
      supabaseAdmin.from('registrations').select('email, name').in('email', emails),
    ]);
    (regRes.data || []).forEach((r: any) => r.email && r.name && nameMap.set(r.email.toLowerCase(), r.name));
    (allowedRes.data || []).forEach((u: any) => u.email && u.full_name && nameMap.set(u.email.toLowerCase(), u.full_name));
  }

  const rows: AdminCompetitionResultRow[] = subs
    .filter((s) => COMPETITION_TYPES.includes(s.competition_type as CompetitionType))
    .map((s): AdminCompetitionResultRow => {
      const ev = evalById.get(String(s.id));
      const juryStatus = ev?.status || 'pending';
      const outcome = OUTCOME_BY_STATUS[juryStatus] || null;
      const releasedAt = ev?.result_released_at || null;
      const email = String(s.email).toLowerCase();
      return {
        id: String(s.id),
        type: s.competition_type as CompetitionType,
        email,
        name: nameMap.get(email) || email.split('@')[0],
        title: s.submission_title || null,
        url: s.submission_url || '',
        submittedAt: s.submitted_at,
        juryStatus,
        outcome,
        score: ev?.score != null ? Number(ev.score) : null,
        maxScore: ev?.max_score != null ? Number(ev.max_score) : 100,
        awardRank: juryStatus === 'winner' && isAwardRank(rankById.get(String(s.id))) ? (rankById.get(String(s.id)) as AwardRank) : null,
        feedback: ev?.participant_feedback || '',
        releasedAt,
        notesCount: Array.isArray(ev?.comments) ? ev.comments.length : 0,
        stage: releasedAt && outcome ? 'released' : outcome ? 'ready' : 'undecided',
      };
    })
    // Ranked by jury score within each competition; unscored entries last
    .sort(
      (a, b) =>
        COMPETITION_TYPES.indexOf(a.type) - COMPETITION_TYPES.indexOf(b.type) ||
        (b.score ?? -1) - (a.score ?? -1) ||
        a.submittedAt.localeCompare(b.submittedAt)
    );

  const summary = Object.fromEntries(
    COMPETITION_TYPES.map((t) => {
      const ofType = rows.filter((r) => r.type === t);
      return [
        t,
        {
          total: ofType.length,
          undecided: ofType.filter((r) => r.stage === 'undecided').length,
          ready: ofType.filter((r) => r.stage === 'ready').length,
          released: ofType.filter((r) => r.stage === 'released').length,
          winners: ofType.filter((r) => r.outcome === 'winner').length,
          finalists: ofType.filter((r) => r.outcome === 'finalist').length,
        },
      ];
    })
  ) as AdminCompetitionResultsData['summary'];

  return { rows, summary, ...(await getResultsReveal()) };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  try {
    return NextResponse.json({ success: true, data: await loadData() });
  } catch (err: any) {
    console.error('[Admin Competition Results GET Error]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load competition results.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action: string = body?.action;

    // Reveal time is global, not per entry
    if (action === 'set_reveal' || action === 'reveal_now') {
      const iso = action === 'reveal_now' ? new Date().toISOString() : String(body?.revealAt || '');
      if (Number.isNaN(Date.parse(iso))) return NextResponse.json({ error: 'Invalid date and time.' }, { status: 400 });
      await setResultsRevealAt(iso, session.email);
      return NextResponse.json({ success: true, results: [], data: await loadData() });
    }

    const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String) : body?.id ? [String(body.id)] : [];
    if (!ids.length) return NextResponse.json({ error: 'id or ids is required.' }, { status: 400 });

    // category is the submission's competition type; never trust the client for it
    const { data: subs, error: subsErr } = await supabaseAdmin
      .from('competition_submissions')
      .select('id, competition_type')
      .in('id', ids);
    if (subsErr) throw subsErr;
    const typeById = new Map((subs || []).map((s) => [String(s.id), String(s.competition_type)]));
    const results: { id: string; ok: boolean; message?: string }[] = [];
    const nowIso = new Date().toISOString();

    switch (action) {
      case 'save': {
        // Decision, score and the note shown to the participant. Does not release anything.
        const id = ids[0];
        const category = typeById.get(id);
        if (!category) return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
        const update: Record<string, unknown> = {
          category,
          target_id: id,
          last_evaluated_by_email: session.email,
          last_evaluated_by_name: session.fullName,
          updated_at: nowIso,
        };
        if (body.status !== undefined) {
          if (!SETTABLE_STATUSES.includes(body.status)) {
            return NextResponse.json({ error: 'Invalid decision.' }, { status: 400 });
          }
          update.status = body.status;
          update.is_next_round = ['winner', 'finalist', 'shortlisted'].includes(body.status);
          // Only winners hold a placement
          if (body.status !== 'winner' && body.awardRank !== undefined) update.award_rank = null;
          // Without a decision there is nothing to show; a later decision needs a fresh release
          if (body.status === 'under_review') update.result_released_at = null;
        }
        if (body.score !== undefined) {
          const score = body.score === '' || body.score == null ? null : Number(body.score);
          if (score != null && (!Number.isFinite(score) || score < 0 || score > 100)) {
            return NextResponse.json({ error: 'Score must be between 0 and 100.' }, { status: 400 });
          }
          update.score = score;
        }
        if (body.awardRank !== undefined && body.status === 'winner') {
          const rank = body.awardRank === '' || body.awardRank == null ? null : Number(body.awardRank);
          if (rank != null && !isAwardRank(rank)) {
            return NextResponse.json({ error: 'Placement must be 1st, 2nd or 3rd.' }, { status: 400 });
          }
          update.award_rank = rank;
        }
        if (body.feedback !== undefined) {
          update.participant_feedback = String(body.feedback || '').trim().slice(0, 2000) || null;
        }
        const { error } = await supabaseAdmin
          .from('submission_evaluations')
          .upsert(update, { onConflict: 'category,target_id' });
        if (error?.code === '23505') {
          return NextResponse.json(
            { error: 'Another entry in this competition already holds that placement. Clear it there first.' },
            { status: 409 }
          );
        }
        if (error) throw error;
        results.push({ id, ok: true });
        break;
      }

      case 'release': {
        const { data: evals, error } = await supabaseAdmin
          .from('submission_evaluations')
          .select('target_id, status, result_released_at')
          .in('category', COMPETITION_TYPES)
          .in('target_id', ids);
        if (error) throw error;
        const evalById = new Map((evals || []).map((ev: any) => [String(ev.target_id), ev]));
        const releasable = ids.filter((id) => OUTCOME_BY_STATUS[evalById.get(id)?.status || '']);
        if (releasable.length) {
          // Keeps the first release time for entries that were already released
          const { error: relErr } = await supabaseAdmin
            .from('submission_evaluations')
            .update({ result_released_at: nowIso })
            .in('category', COMPETITION_TYPES)
            .in('target_id', releasable)
            .is('result_released_at', null);
          if (relErr) throw relErr;
        }
        ids.forEach((id) =>
          results.push(
            releasable.includes(id)
              ? { id, ok: true }
              : { id, ok: false, message: 'No decision yet (set winner, finalist, shortlisted or not selected).' }
          )
        );
        break;
      }

      case 'withdraw': {
        const { error } = await supabaseAdmin
          .from('submission_evaluations')
          .update({ result_released_at: null })
          .in('category', COMPETITION_TYPES)
          .in('target_id', ids);
        if (error) throw error;
        ids.forEach((id) => results.push({ id, ok: true }));
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    await invalidateCache(['admin:stats_overview', 'admin:config_and_stats']);
    return NextResponse.json({ success: true, results, data: await loadData() });
  } catch (err: any) {
    console.error('[Admin Competition Results POST Error]:', err);
    return NextResponse.json({ error: err?.message || 'Action failed.' }, { status: 500 });
  }
}
