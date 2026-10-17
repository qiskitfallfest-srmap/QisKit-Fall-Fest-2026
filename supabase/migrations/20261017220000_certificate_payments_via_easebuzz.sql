-- ============================================================================
-- Migration: 20261017220000_certificate_payments_via_easebuzz.sql
-- Description: Move the masterclass certificate fee (₹99) onto the same Easebuzz
--              gateway as the General Offline Pass. Certificate claims now carry
--              an Easebuzz Transaction ID plus an uploaded receipt, reviewed in the
--              admin Payments tab. Pass and certificate are separate purchases:
--              one transaction ID cannot be claimed in both tables.
-- ============================================================================

-- 1. Receipt + review metadata on certificate claims (nullable for legacy UTI rows)
ALTER TABLE public.certificate_payment_submissions
    ADD COLUMN IF NOT EXISTS receipt_url TEXT,
    ADD COLUMN IF NOT EXISTS bank_reference TEXT,
    ADD COLUMN IF NOT EXISTS institution TEXT,
    ADD COLUMN IF NOT EXISTS contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.certificate_payment_submissions
    ALTER COLUMN payment_mode SET DEFAULT 'easebuzz';

-- Delivery: collect in person at the valedictory ceremony, or receive by email
ALTER TABLE public.certificate_payment_submissions
    ADD COLUMN IF NOT EXISTS delivery_mode TEXT CHECK (delivery_mode IN ('ceremony', 'email')),
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS delivered_by TEXT;

CREATE INDEX IF NOT EXISTS idx_cert_sub_status ON public.certificate_payment_submissions (status);
CREATE INDEX IF NOT EXISTS idx_cert_sub_ref_upper ON public.certificate_payment_submissions (upper(transaction_reference));

-- 2. Pass review metadata (who approved / rejected)
ALTER TABLE public.festival_pass_claims
    ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

CREATE INDEX IF NOT EXISTS idx_festival_pass_txn_ref_upper ON public.festival_pass_claims (upper(transaction_reference));

-- 3. Cross-table guard: an Easebuzz transaction ID belongs to exactly one purchase.
--    Enforced in the database so concurrent claims cannot slip past the API checks.
CREATE OR REPLACE FUNCTION public.reject_cross_claimed_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_TABLE_NAME = 'festival_pass_claims' THEN
    IF EXISTS (
      SELECT 1 FROM public.certificate_payment_submissions
      WHERE upper(transaction_reference) = upper(NEW.transaction_reference)
    ) THEN
      RAISE EXCEPTION 'transaction_reference already claimed for a certificate'
        USING ERRCODE = '23505';
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.festival_pass_claims
      WHERE upper(transaction_reference) = upper(NEW.transaction_reference)
    ) THEN
      RAISE EXCEPTION 'transaction_reference already claimed for an offline pass'
        USING ERRCODE = '23505';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pass_txn_not_in_certificates ON public.festival_pass_claims;
CREATE TRIGGER trg_pass_txn_not_in_certificates
    BEFORE INSERT OR UPDATE OF transaction_reference ON public.festival_pass_claims
    FOR EACH ROW EXECUTE FUNCTION public.reject_cross_claimed_transaction();

DROP TRIGGER IF EXISTS trg_cert_txn_not_in_passes ON public.certificate_payment_submissions;
CREATE TRIGGER trg_cert_txn_not_in_passes
    BEFORE INSERT OR UPDATE OF transaction_reference ON public.certificate_payment_submissions
    FOR EACH ROW EXECUTE FUNCTION public.reject_cross_claimed_transaction();

-- 4. Storage policies for certificate receipts under media/certificate-receipts/*
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow certificate receipts uploads to media bucket'
  ) THEN
    CREATE POLICY "Allow certificate receipts uploads to media bucket"
      ON storage.objects
      FOR INSERT
      TO public
      WITH CHECK (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'certificate-receipts'
      );
  END IF;
END $$;
