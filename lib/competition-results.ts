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

/* ───────────────────────── Placements (winners board) ───────────────────────── */

export type AwardRank = 1 | 2 | 3;

export const AWARD_RANKS: AwardRank[] = [1, 2, 3];

export const AWARD_RANK_LABEL: Record<AwardRank, string> = {
  1: 'First Place',
  2: 'Second Place',
  3: 'Third Place',
};

export function isAwardRank(value: unknown): value is AwardRank {
  return value === 1 || value === 2 || value === 3;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export interface CompetitionWinner {
  /** Public ID, e.g. QFF26-REELS-1, verifiable at /awards/[id] once released */
  awardId: string;
  rank: AwardRank;
  name: string;
  institution: string | null;
  entryTitle: string | null;
  /** The winning work: reel link or uploaded poster/essay file */
  entryUrl: string | null;
  prizeInr: number | null;
  isYou: boolean;
  /** false = admin preview of a placement that is not announced yet */
  released: boolean;
  releasedAt: string | null;
}

export interface CompetitionWinnersBoard {
  type: CompetitionType;
  title: string;
  prizePool: number[] | null;
  winners: CompetitionWinner[];
}

/** The viewer's own entry in one competition and where it stands. */
export interface YourCompetitionEntry {
  type: CompetitionType;
  title: string;
  entryTitle: string | null;
  entryUrl: string | null;
  submittedAt: string | null;
  /**
   * pending: winners of this competition are not announced yet.
   * not_selected: announced, and this entry is not among the winners (explicitly or by default).
   */
  status: CompetitionOutcome | 'pending';
  awardId: string | null;
  rank: AwardRank | null;
  feedback: string | null;
}

export interface CompetitionWinnersResponse {
  success: boolean;
  boards: CompetitionWinnersBoard[];
  yourEntries: YourCompetitionEntry[];
  /** True when the boards include unreleased placements (admins only). */
  preview: boolean;
}

/* ───────────────────────── Public award IDs ───────────────────────── */

const AWARD_CODE: Record<CompetitionType, string> = { reels: 'REELS', poster: 'POSTER', essay: 'ESSAY' };

/** Public site used in shared images and captions, so links point at production even from a local preview. */
export const AWARD_SITE_URL = 'https://www.qffsrmap2026.com';

/** e.g. QFF26-REELS-1. One placement per competition and rank, so no lookup table is needed. */
export function awardId(type: CompetitionType, rank: AwardRank): string {
  return `QFF26-${AWARD_CODE[type]}-${rank}`;
}

export function parseAwardId(id: string): { type: CompetitionType; rank: AwardRank } | null {
  const m = /^QFF26-([A-Z]+)-([1-3])$/.exec(String(id).trim().toUpperCase());
  if (!m) return null;
  const type = (Object.keys(AWARD_CODE) as CompetitionType[]).find((t) => AWARD_CODE[t] === m[1]);
  const rank = Number(m[2]);
  return type && isAwardRank(rank) ? { type, rank } : null;
}

export function awardUrl(type: CompetitionType, rank: AwardRank): string {
  return `${AWARD_SITE_URL}/awards/${awardId(type, rank)}`;
}
