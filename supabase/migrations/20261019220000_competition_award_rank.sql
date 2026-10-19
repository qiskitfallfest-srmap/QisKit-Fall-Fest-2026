-- Placement (1st/2nd/3rd) for winners of the daily online competitions.
-- The prize amount per placement lives in data/learning/competitions.ts
-- (prizePool). A placement is public on the participant profile only once the
-- entry's result is released (result_released_at), like every other result.

ALTER TABLE public.submission_evaluations
    ADD COLUMN IF NOT EXISTS award_rank SMALLINT
        CHECK (award_rank BETWEEN 1 AND 3);

-- One entry per placement within a competition
CREATE UNIQUE INDEX IF NOT EXISTS uniq_submission_evaluations_award_rank
    ON public.submission_evaluations (category, award_rank)
    WHERE award_rank IS NOT NULL;
