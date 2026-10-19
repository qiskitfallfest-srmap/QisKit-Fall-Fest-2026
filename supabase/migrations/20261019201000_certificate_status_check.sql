-- ============================================================================
-- Migration: 20261019201000_certificate_status_check.sql
-- Description: Restore the status CHECK on certificate_payment_submissions.
--              20261009230000 declares it, but the live table predates that
--              file (CREATE TABLE IF NOT EXISTS) and never had it.
--              Applied to production on 2026-10-19 after confirming every row
--              was already within the allowed set.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.certificate_payment_submissions'::regclass
      AND conname = 'certificate_payment_submissions_status_check'
  ) THEN
    ALTER TABLE public.certificate_payment_submissions
      ADD CONSTRAINT certificate_payment_submissions_status_check
      CHECK (status IN ('pending_verification', 'verified', 'rejected'));
  END IF;
END $$;
