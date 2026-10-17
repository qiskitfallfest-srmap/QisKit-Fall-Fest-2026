-- ============================================================================
-- Migration: 20261017193500_create_festival_pass_claims.sql
-- Description: Provision festival_pass_claims table and media storage bucket
--              policies for the on-campus General Offline Pass (₹99) flow,
--              receipt verification, QR badge tokens, and gate check-in desk.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.festival_pass_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    pass_tier TEXT NOT NULL DEFAULT 'general_offline' CHECK (pass_tier IN ('general_offline', 'flagship_offline')),
    transaction_reference TEXT NOT NULL UNIQUE, -- Easebuzz Transaction ID (e.g. E26101518BKHN3)
    bank_reference TEXT,                        -- Optional secondary bank UTR / reference
    receipt_url TEXT NOT NULL,                  -- Supabase storage URL in media/pass-receipts/
    amount_inr NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
    status TEXT NOT NULL DEFAULT 'claimed_provisional' CHECK (status IN ('claimed_provisional', 'verified', 'rejected')),
    institution TEXT,
    contact_phone TEXT,
    admin_notes TEXT,
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    checked_in_by TEXT,
    qr_code_token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for rapid lookups at gate check-in desk and admin console
CREATE INDEX IF NOT EXISTS idx_festival_pass_user_email ON public.festival_pass_claims (user_email);
CREATE INDEX IF NOT EXISTS idx_festival_pass_user_email_lower ON public.festival_pass_claims (lower(user_email));
CREATE INDEX IF NOT EXISTS idx_festival_pass_qr_token ON public.festival_pass_claims (qr_code_token);
CREATE INDEX IF NOT EXISTS idx_festival_pass_txn_ref ON public.festival_pass_claims (transaction_reference);
CREATE INDEX IF NOT EXISTS idx_festival_pass_status ON public.festival_pass_claims (status);

-- Enable Row Level Security
ALTER TABLE public.festival_pass_claims ENABLE ROW LEVEL SECURITY;

-- 1. Allow authenticated attendees to view only their own festival passes
DROP POLICY IF EXISTS "Users can view their own festival passes" ON public.festival_pass_claims;
CREATE POLICY "Users can view their own festival passes"
ON public.festival_pass_claims
FOR SELECT
USING (
  (auth.jwt() ->> 'email') = user_email
  OR lower(user_email) = lower(auth.jwt() ->> 'email')
);

-- 2. Allow service role full management for Next.js API routes (supabaseAdmin)
DROP POLICY IF EXISTS "Allow service role full management on festival_pass_claims" ON public.festival_pass_claims;
CREATE POLICY "Allow service role full management on festival_pass_claims"
ON public.festival_pass_claims
FOR ALL
USING (auth.role() = 'service_role');

-- Storage Bucket Policies for pass receipts upload/update under media/pass-receipts/*
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow pass receipts uploads to media bucket'
  ) THEN
    CREATE POLICY "Allow pass receipts uploads to media bucket"
      ON storage.objects
      FOR INSERT
      TO public
      WITH CHECK (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'pass-receipts'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow pass receipts updates in media bucket'
  ) THEN
    CREATE POLICY "Allow pass receipts updates in media bucket"
      ON storage.objects
      FOR UPDATE
      TO public
      USING (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'pass-receipts'
      )
      WITH CHECK (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'pass-receipts'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow pass receipts deletes in media bucket'
  ) THEN
    CREATE POLICY "Allow pass receipts deletes in media bucket"
      ON storage.objects
      FOR DELETE
      TO public
      USING (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'pass-receipts'
      );
  END IF;
END $$;
