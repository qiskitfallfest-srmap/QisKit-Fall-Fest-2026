-- ============================================================================
-- Migration: 20261021120000_registrations_institution_confirmation.sql
-- Description: Record when a participant confirms or corrects their institution
-- from the /learning/profile banner.
--
-- Until now the "Looks correct" click was kept only in the participant's browser
-- (localStorage), so organizers could not count responses.
--
--   institution_confirmed_at     NULL = has not answered the banner yet
--   institution_confirmed_value  the institution text at the time of the answer;
--                                the banner reappears if the stored institution changes
--   institution_confirm_source   'confirmed' = kept the existing value,
--                                'edited'    = saved a new value from the profile
-- ============================================================================

ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS institution_confirmed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS institution_confirmed_value TEXT,
    ADD COLUMN IF NOT EXISTS institution_confirm_source TEXT
        CHECK (institution_confirm_source IN ('confirmed', 'edited'));

CREATE INDEX IF NOT EXISTS idx_registrations_institution_confirmed
    ON public.registrations (institution_confirmed_at);
