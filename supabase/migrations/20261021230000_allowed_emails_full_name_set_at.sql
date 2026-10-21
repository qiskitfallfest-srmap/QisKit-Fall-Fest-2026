-- ============================================================================
-- Migration: 20261021230000_allowed_emails_full_name_set_at.sql
-- Description: Mark names the participant set themselves on /learning/profile.
--
-- Sign-in used to prefer the Google account display name over the stored name,
-- so a corrected name reverted at the next login. When full_name_set_at is set,
-- sign-in uses allowed_emails.full_name instead (lib/auth-name.ts). Names
-- imported from team sheets keep the old behaviour.
-- ============================================================================

ALTER TABLE public.allowed_emails
    ADD COLUMN IF NOT EXISTS full_name_set_at TIMESTAMPTZ;
