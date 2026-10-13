-- Migration: 20261013200000_secure_rls_and_revoke_anon_mutations.sql
-- Description: Revoke unrestricted anonymous write policies on core tables
--              and enforce strict server-side and role-based access control.

-- ============================================================================
-- 1. SECURE TABLE: allowed_emails
-- ============================================================================
-- Drop vulnerable open write policy
DROP POLICY IF EXISTS "Allow anon write allowed_emails" ON public.allowed_emails;

-- Ensure SELECT is permitted for whitelist lookup
DROP POLICY IF EXISTS "Allow anon read allowed_emails" ON public.allowed_emails;
CREATE POLICY "Allow anon read allowed_emails" 
ON public.allowed_emails 
FOR SELECT 
USING (true);

-- Mutations restricted to service_role (backend server operations)
DROP POLICY IF EXISTS "Allow service role all allowed_emails" ON public.allowed_emails;
CREATE POLICY "Allow service role all allowed_emails"
ON public.allowed_emails
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 2. SECURE TABLE: platform_config
-- ============================================================================
-- Drop open policy that allowed anyone to alter configuration flags
DROP POLICY IF EXISTS "Allow anon all platform_config" ON public.platform_config;

-- Public can read configuration (e.g. countdowns, dates)
DROP POLICY IF EXISTS "Allow anon read platform_config" ON public.platform_config;
CREATE POLICY "Allow anon read platform_config" 
ON public.platform_config 
FOR SELECT 
USING (true);

-- Mutations restricted to service_role
DROP POLICY IF EXISTS "Allow service role all platform_config" ON public.platform_config;
CREATE POLICY "Allow service role all platform_config"
ON public.platform_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 3. SECURE TABLE: hackathon_teams
-- ============================================================================
-- Add first-class finalized columns to eliminate JSON blob race conditions
ALTER TABLE public.hackathon_teams ADD COLUMN IF NOT EXISTS is_finalized BOOLEAN DEFAULT false;
ALTER TABLE public.hackathon_teams ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

-- Drop open policy
DROP POLICY IF EXISTS "Allow anon all hackathon_teams" ON public.hackathon_teams;

-- Allow read access
DROP POLICY IF EXISTS "Allow read hackathon_teams" ON public.hackathon_teams;
CREATE POLICY "Allow read hackathon_teams"
ON public.hackathon_teams
FOR SELECT
USING (true);

-- Mutations restricted to service_role and authenticated users
DROP POLICY IF EXISTS "Allow service role all hackathon_teams" ON public.hackathon_teams;
CREATE POLICY "Allow service role all hackathon_teams"
ON public.hackathon_teams
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 4. SECURE TABLE: team_members
-- ============================================================================
DROP POLICY IF EXISTS "Allow anon all team_members" ON public.team_members;

DROP POLICY IF EXISTS "Allow read team_members" ON public.team_members;
CREATE POLICY "Allow read team_members"
ON public.team_members
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow service role all team_members" ON public.team_members;
CREATE POLICY "Allow service role all team_members"
ON public.team_members
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
