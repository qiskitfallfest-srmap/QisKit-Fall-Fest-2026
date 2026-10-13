-- Migration: 20261009220000_create_submission_evaluations.sql
-- Description: Provision table, indexes, RLS policies, and realtime publication
--              for live multi-admin evaluation, download tracking, next-round shortlisting,
--              scoring rubrics, and discussion comments across all challenge tracks.

CREATE TABLE IF NOT EXISTS public.submission_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('hackathon', 'reels', 'poster', 'essay', 'coding')),
    target_id TEXT NOT NULL,
    is_next_round BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'shortlisted', 'rejected', 'finalist', 'winner', 'needs_discussion')),
    score NUMERIC(5,2) DEFAULT NULL,
    max_score NUMERIC(5,2) DEFAULT 100,
    rubric_scores JSONB DEFAULT '{}'::jsonb,
    downloaded BOOLEAN DEFAULT false,
    downloaded_by TEXT,
    downloaded_at TIMESTAMPTZ,
    downloads JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    last_evaluated_by_email TEXT,
    last_evaluated_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_category_target UNIQUE (category, target_id)
);

CREATE INDEX IF NOT EXISTS idx_submission_evaluations_cat_target ON public.submission_evaluations (category, target_id);
CREATE INDEX IF NOT EXISTS idx_submission_evaluations_next_round ON public.submission_evaluations (is_next_round);

ALTER TABLE public.submission_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to submission_evaluations" ON public.submission_evaluations;
CREATE POLICY "Allow all access to submission_evaluations"
ON public.submission_evaluations
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable real-time change broadcasting
ALTER PUBLICATION supabase_realtime ADD TABLE public.submission_evaluations;
