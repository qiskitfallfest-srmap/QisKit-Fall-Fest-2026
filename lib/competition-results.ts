// Results for the daily online competitions (reels, poster, essay).
//
// The jury records its decision in submission_evaluations (category = the
// competition type, target_id = competition_submissions.id). Like the hackathon
// Phase 2 results, nothing is visible to the participant until an admin releases
// it from /learning/admin (result_released_at). participant_feedback is the note
// shown with the result; `comments` stay internal to the jury.

export type CompetitionType = 'reels' | 'poster' | 'essay';

export const COMPETITION_TYPES: CompetitionType[] = ['reels', 'poster', 'essay'];

export type CompetitionOutcome = 'winner' | 'finalist' | 'shortlisted' | 'not_selected';

/** Jury statuses that carry a decision and can therefore be released. */
export const OUTCOME_BY_STATUS: Record<string, CompetitionOutcome> = {
  winner: 'winner',
  finalist: 'finalist',
  shortlisted: 'shortlisted',
  rejected: 'not_selected',
};

export const OUTCOME_LABEL: Record<CompetitionOutcome, string> = {
  winner: 'Winner',
  finalist: 'Finalist',
  shortlisted: 'Shortlisted',
  not_selected: 'Not selected',
};

export interface CompetitionResult {
  outcome: CompetitionOutcome;
  label: string;
  score: number | null;
  maxScore: number;
  feedback: string | null;
  releasedAt: string;
}

interface EvaluationRow {
  status?: string | null;
  score?: number | string | null;
  max_score?: number | string | null;
  participant_feedback?: string | null;
  result_released_at?: string | null;
}

/**
 * The participant-facing result, or null while it is unreleased or the jury
 * status no longer carries a decision (e.g. moved back to review after release).
 */
export function toCompetitionResult(ev: EvaluationRow | null | undefined): CompetitionResult | null {
  if (!ev?.result_released_at) return null;
  const outcome = OUTCOME_BY_STATUS[ev.status || ''];
  if (!outcome) return null;
  return {
    outcome,
    label: OUTCOME_LABEL[outcome],
    score: ev.score != null ? Number(ev.score) : null,
    maxScore: ev.max_score != null ? Number(ev.max_score) : 100,
    feedback: ev.participant_feedback || null,
    releasedAt: ev.result_released_at,
  };
}
