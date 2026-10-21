-- ============================================================================
-- Migration: 20261022120000_create_push_subscriptions.sql
-- Description: Web Push subscriptions for the installable app.
--
-- One row per browser/device (UNIQUE endpoint); a participant can have several.
-- Written by /api/push/subscribe for the signed-in email; read by
-- tools/send_push.py, which deletes rows the push service reports as gone
-- (HTTP 404/410) and counts other failures.
--
--   endpoint     push service URL for this browser (FCM, Mozilla, Apple)
--   p256dh/auth  the browser's encryption keys for the payload
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_sent_at TIMESTAMPTZ,
    failure_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_email ON public.push_subscriptions (lower(email));

-- Service role only, matching transport_requests
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full management on push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow service role full management on push_subscriptions"
ON public.push_subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.push_subscriptions FROM anon, authenticated;
