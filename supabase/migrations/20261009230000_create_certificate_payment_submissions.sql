-- Migration: 20261009230000_create_certificate_payment_submissions.sql
-- Description: Provision certificate_payment_submissions table for offline UPI QR code
--              and bank transfer tracking via Unique Transaction ID (UTI) / UPI Reference numbers.

CREATE TABLE IF NOT EXISTS public.certificate_payment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    transaction_reference TEXT NOT NULL UNIQUE, -- UTI / UPI Reference No.
    payment_mode TEXT DEFAULT 'upi_qr' NOT NULL,
    amount_inr NUMERIC(10, 2),
    status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    verified_at TIMESTAMPTZ,
    certificate_id UUID REFERENCES public.issued_certificates(id)
);

CREATE INDEX IF NOT EXISTS idx_cert_sub_email ON public.certificate_payment_submissions (lower(user_email));
CREATE INDEX IF NOT EXISTS idx_cert_sub_ref ON public.certificate_payment_submissions (transaction_reference);

ALTER TABLE public.certificate_payment_submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated candidates to view only their own submissions
DROP POLICY IF EXISTS "Allow users to view own payment submissions" ON public.certificate_payment_submissions;
CREATE POLICY "Allow users to view own payment submissions"
ON public.certificate_payment_submissions
FOR SELECT
USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- Allow service role full management
DROP POLICY IF EXISTS "Allow service role full management on certificate_payment_submissions" ON public.certificate_payment_submissions;
CREATE POLICY "Allow service role full management on certificate_payment_submissions"
ON public.certificate_payment_submissions
FOR ALL
USING (auth.role() = 'service_role');
