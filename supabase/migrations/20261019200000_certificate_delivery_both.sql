-- ============================================================================
-- Migration: 20261019200000_certificate_delivery_both.sql
-- Description: Allow participants to receive the masterclass certificate both
--              as a printed copy (valedictory ceremony) and by email.
--              delivery_mode: 'ceremony' | 'email' | 'both'.
--              delivered_at still marks the request as fully delivered; for
--              'both' the reviewer marks it once the printed copy is handed over
--              and the email has gone out.
-- ============================================================================

-- The original CHECK was declared inline in 20261017220000, so its name is
-- generated. Drop whichever CHECK constraint covers delivery_mode.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'certificate_payment_submissions'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%delivery_mode%'
  LOOP
    EXECUTE format('ALTER TABLE public.certificate_payment_submissions DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.certificate_payment_submissions
    ADD CONSTRAINT certificate_payment_submissions_delivery_mode_check
    CHECK (delivery_mode IN ('ceremony', 'email', 'both'));
