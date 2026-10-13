export interface EvaluationRubric {
  rigor?: number;
  execution?: number;
  novelty?: number;
  impact?: number;
  [key: string]: number | undefined;
}

export interface EvaluationComment {
  id: string;
  evaluator_email: string;
  evaluator_name: string;
  text: string;
  created_at: string;
}

export interface EvaluationDownload {
  evaluator_email: string;
  evaluator_name: string;
  downloaded_at: string;
}

export type EvaluationCategory = 'hackathon' | 'reels' | 'poster' | 'essay' | 'coding';

export type EvaluationStatus =
  | 'pending'
  | 'under_review'
  | 'shortlisted'
  | 'rejected'
  | 'finalist'
  | 'winner'
  | 'needs_discussion';

export interface SubmissionEvaluation {
  id: string;
  category: EvaluationCategory;
  target_id: string;
  is_next_round: boolean;
  status: EvaluationStatus;
  score: number | null;
  max_score: number;
  rubric_scores: EvaluationRubric;
  downloaded: boolean;
  downloaded_by: string | null;
  downloaded_at: string | null;
  downloads: EvaluationDownload[];
  comments: EvaluationComment[];
  last_evaluated_by_email: string | null;
  last_evaluated_by_name: string | null;
  created_at: string;
  updated_at: string;
}
