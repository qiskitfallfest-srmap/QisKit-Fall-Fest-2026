-- ============================================================================
-- Migration: 20261021150000_registrations_contact_confirmation.sql
-- Description: Participant-confirmed mobile number and emergency contact for the
-- on-campus days. There is no OTP: the participant re-enters and confirms the
-- number on /learning/profile, and must do so before answering bus travel or
-- accommodation.
--
--   phone_confirmed_at       NULL = not confirmed
--   phone_confirmed_value    normalized number (+91XXXXXXXXXX) at confirmation;
--                            the confirmation lapses if registrations.phone changes
--   emergency_contact_name   parent / guardian / friend to call in an emergency
--   emergency_contact_phone  normalized, different from the participant's number
-- ============================================================================

ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS phone_confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS phone_confirmed_value TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_registrations_phone_confirmed
    ON public.registrations (phone_confirmed_at);
