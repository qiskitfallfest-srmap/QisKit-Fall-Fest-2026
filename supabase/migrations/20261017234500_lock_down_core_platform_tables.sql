-- Migration: 20261017234500_lock_down_core_platform_tables.sql
-- Description: Replace the permissive anon RLS policies on public.allowed_emails,
--              public.platform_config, public.user_progress and
--              public.competition_submissions (created in 20260929214500) with
--              service-role-only access.
--
-- The anon key ships to every browser. With FOR ALL USING (true) WITH CHECK (true)
-- any visitor could, directly through PostgREST:
--   - upsert their own allowed_emails row with role = 'admin'. lib/auth.ts
--     getServerSession() trusts allowed_emails.role for isAdmin, so this was a
--     full admin privilege escalation;
--   - read every registered email and name;
--   - overwrite platform_config (finalized_teams map, hackathon and lecture
--     release overrides, quiz overrides, coding challenge config);
--   - read or rewrite any student's progress and competition submissions.
--
-- No browser code queries these tables. All reads and writes go through Next.js
-- API routes and server libs that check getServerSession() (or the Google Form
-- webhook secret) and use supabaseAdmin. No public SELECT is kept.
--
-- PREREQUISITE: SUPABASE_SERVICE_ROLE_KEY must be set in the deployment
-- environment before this migration is applied. lib/supabase-admin.ts falls
-- back to the anon key when it is missing; with this migration applied that
-- fallback has no access, so login (whitelist lookup), admin pages, progress
-- tracking and competition submission would all fail.

-- ============================================================================
-- allowed_emails
-- ============================================================================
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read allowed_emails" ON public.allowed_emails;
DROP POLICY IF EXISTS "Allow anon write allowed_emails" ON public.allowed_emails;

DROP POLICY IF EXISTS "Allow service role full management on allowed_emails" ON public.allowed_emails;
CREATE POLICY "Allow service role full management on allowed_emails"
ON public.allowed_emails
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.allowed_emails FROM anon, authenticated;

-- ============================================================================
-- platform_config
-- ============================================================================
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all platform_config" ON public.platform_config;

DROP POLICY IF EXISTS "Allow service role full management on platform_config" ON public.platform_config;
CREATE POLICY "Allow service role full management on platform_config"
ON public.platform_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.platform_config FROM anon, authenticated;

-- ============================================================================
-- user_progress
-- ============================================================================
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all user_progress" ON public.user_progress;

DROP POLICY IF EXISTS "Allow service role full management on user_progress" ON public.user_progress;
CREATE POLICY "Allow service role full management on user_progress"
ON public.user_progress
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.user_progress FROM anon, authenticated;

-- ============================================================================
-- competition_submissions
-- ============================================================================
ALTER TABLE public.competition_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all competition_submissions" ON public.competition_submissions;

DROP POLICY IF EXISTS "Allow service role full management on competition_submissions" ON public.competition_submissions;
CREATE POLICY "Allow service role full management on competition_submissions"
ON public.competition_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.competition_submissions FROM anon, authenticated;
