-- Migration: 20260929214500_create_learning_and_hackathon_platform.sql
-- Description: Provision tables, indexes, constraints, RLS policies, and seed data
--              for the Qiskit Fall Fest 2026 Online Learning Platform & Hackathon Workspace.

-- ============================================================================
-- 1. TABLE: allowed_emails (Access Control & Whitelist)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.allowed_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'tester', 'mentor')),
    is_active BOOLEAN DEFAULT true,
    added_by TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Case-insensitive index for instant email lookups
CREATE INDEX IF NOT EXISTS idx_allowed_emails_lower ON public.allowed_emails (lower(email));

-- Enable Row Level Security (RLS)
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read allowed_emails" ON public.allowed_emails;
CREATE POLICY "Allow anon read allowed_emails" 
ON public.allowed_emails 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow anon write allowed_emails" ON public.allowed_emails;
CREATE POLICY "Allow anon write allowed_emails" 
ON public.allowed_emails 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Seed default super-admin accounts
INSERT INTO public.allowed_emails (email, full_name, role, is_active)
VALUES 
  ('qiskitfallfest@srmap.edu.in', 'QFF SRMAP Organizing Lead', 'admin', true),
  ('gyankumar_sah@srmap.edu.in', 'Gyan Kumar Sah (Lead)', 'admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'admin', is_active = true;

-- ============================================================================
-- 2. TABLE: user_progress (Sequential Lecture Progress & Quiz Scores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    session_id TEXT NOT NULL, -- e.g. 'session-1' to 'session-6'
    video_completed BOOLEAN DEFAULT false,
    quiz_score INTEGER DEFAULT 0,
    quiz_passed BOOLEAN DEFAULT false,
    quiz_attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_session UNIQUE (email, session_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_email ON public.user_progress (lower(email));

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all user_progress" ON public.user_progress;
CREATE POLICY "Allow anon all user_progress" 
ON public.user_progress 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ============================================================================
-- 3. TABLE: competition_submissions (Daily Creative Competitions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.competition_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    competition_type TEXT NOT NULL CHECK (competition_type IN ('reels', 'poster', 'essay')),
    submission_url TEXT NOT NULL,
    submission_title TEXT,
    notes TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'shortlisted')),
    submitted_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_competition UNIQUE (email, competition_type)
);

CREATE INDEX IF NOT EXISTS idx_competition_submissions_email ON public.competition_submissions (lower(email));

ALTER TABLE public.competition_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all competition_submissions" ON public.competition_submissions;
CREATE POLICY "Allow anon all competition_submissions" 
ON public.competition_submissions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ============================================================================
-- 4. TABLE: hackathon_teams (Hackathon Teams & Problem Statement Choice)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hackathon_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    lead_email TEXT UNIQUE NOT NULL,
    lead_name TEXT NOT NULL,
    vertical TEXT NOT NULL,
    problem_statement_id TEXT NOT NULL,
    github_repo_url TEXT,
    submission_notes TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hackathon_teams_name ON public.hackathon_teams (lower(name));

ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all hackathon_teams" ON public.hackathon_teams;
CREATE POLICY "Allow anon all hackathon_teams" 
ON public.hackathon_teams 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ============================================================================
-- 5. TABLE: team_members (Teammate Invitations & Exclusivity Constraint)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL, -- Enforces an individual Gmail can belong to ONLY ONE team
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined')),
    invited_at TIMESTAMPTZ DEFAULT now(),
    responded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members (lower(email));
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members (team_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all team_members" ON public.team_members;
CREATE POLICY "Allow anon all team_members" 
ON public.team_members 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- ============================================================================
-- 6. TABLE: platform_config (System Overrides & Calendar Triggers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all platform_config" ON public.platform_config;
CREATE POLICY "Allow anon all platform_config" 
ON public.platform_config 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Initialize default configuration
INSERT INTO public.platform_config (key, value)
VALUES 
  ('hackathon_release_override', '{"enabled": false}'::jsonb),
  ('lecture_lock_override', '{"enabled": false}'::jsonb),
  ('hackathon_release_date', '"2026-10-10T00:00:00+05:30"'::jsonb)
ON CONFLICT (key) DO NOTHING;
