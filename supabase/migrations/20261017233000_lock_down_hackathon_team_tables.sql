-- Migration: 20261017233000_lock_down_hackathon_team_tables.sql
-- Description: Replace the permissive "Allow anon all" RLS policies on
--              public.hackathon_teams and public.team_members (created in
--              20260929214500) with service-role-only access.
--
-- The anon key ships to every browser, so FOR ALL USING (true) let any visitor
-- read team rosters (names, emails) and insert, update or delete any team or
-- membership row directly through PostgREST. All reads and writes of these
-- tables now go through Next.js API routes (app/api/hackathon/*,
-- app/api/admin/*, app/api/pass/*, app/api/user/profile) that check
-- getServerSession() and use supabaseAdmin. The browser no longer queries or
-- subscribes (Realtime) to these tables. anon/authenticated also held direct
-- table grants including TRUNCATE (not covered by RLS); those are revoked.
--
-- PREREQUISITE: SUPABASE_SERVICE_ROLE_KEY must be set in the deployment
-- environment before this migration is applied. lib/supabase-admin.ts falls
-- back to the anon key when it is missing; with this migration applied that
-- fallback has no access and every hackathon route returns empty data or fails.

-- ============================================================================
-- hackathon_teams
-- ============================================================================
ALTER TABLE public.hackathon_teams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all hackathon_teams" ON public.hackathon_teams;

DROP POLICY IF EXISTS "Allow service role full management on hackathon_teams" ON public.hackathon_teams;
CREATE POLICY "Allow service role full management on hackathon_teams"
ON public.hackathon_teams
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.hackathon_teams FROM anon, authenticated;

-- ============================================================================
-- team_members
-- ============================================================================
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all team_members" ON public.team_members;

DROP POLICY IF EXISTS "Allow service role full management on team_members" ON public.team_members;
CREATE POLICY "Allow service role full management on team_members"
ON public.team_members
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.team_members FROM anon, authenticated;

-- ============================================================================
-- Realtime
-- ============================================================================
-- Both tables were in the supabase_realtime publication, so any anon client
-- could subscribe to postgres_changes and receive every roster change. No
-- client subscribes to them any more; remove them from the publication.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'hackathon_teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.hackathon_teams;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'team_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.team_members;
  END IF;
END $$;
