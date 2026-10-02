-- Migration: 20260930000000_create_certificate_and_payments.sql
-- Description: Provision certificate_orders and issued_certificates tables,
--              indexes, constraints, and RLS policies for Razorpay-backed
--              masterclass certification issuance.

-- ============================================================================
-- 1. TABLE: certificate_orders (Razorpay Order Lifecycle & Auditing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.certificate_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount_paise INTEGER NOT NULL, -- in paise: 49900 = INR 499.00
    currency TEXT DEFAULT 'INR' NOT NULL,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'paid', 'failed', 'refunded')),
    idempotency_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cert_orders_email ON public.certificate_orders (lower(user_email));
CREATE INDEX IF NOT EXISTS idx_cert_orders_rzp_id ON public.certificate_orders (razorpay_order_id);

ALTER TABLE public.certificate_orders ENABLE ROW LEVEL SECURITY;

-- Secure certificate_orders: only accessible via Service Role (API routes)
DROP POLICY IF EXISTS "Allow anon read certificate_orders" ON public.certificate_orders;
DROP POLICY IF EXISTS "Allow anon write certificate_orders" ON public.certificate_orders;

-- ============================================================================
-- 2. TABLE: issued_certificates (Official Minted Credentials)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.issued_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number TEXT UNIQUE NOT NULL, -- Format: QFF26-MCL-202610-XXXX
    user_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    institution TEXT DEFAULT 'SRM University-AP',
    course_name TEXT DEFAULT 'IBM Quantum Masterclass: A Decade of Quantum on Cloud' NOT NULL,
    order_id UUID REFERENCES public.certificate_orders(id),
    average_quiz_score NUMERIC(5, 2) NOT NULL,
    certificate_url TEXT NOT NULL,
    verification_hash TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT unique_user_certificate UNIQUE (user_email, course_name)
);

CREATE INDEX IF NOT EXISTS idx_issued_certs_serial ON public.issued_certificates (serial_number);
CREATE INDEX IF NOT EXISTS idx_issued_certs_email ON public.issued_certificates (lower(user_email));

ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read issued_certificates" ON public.issued_certificates;
CREATE POLICY "Allow anon read issued_certificates" 
ON public.issued_certificates 
FOR SELECT 
USING (true);

-- Secure issued_certificates: only writable via Service Role, but readable publicly for verification
DROP POLICY IF EXISTS "Allow anon write issued_certificates" ON public.issued_certificates;
