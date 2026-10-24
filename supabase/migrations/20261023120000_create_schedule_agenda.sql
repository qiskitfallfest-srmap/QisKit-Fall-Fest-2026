-- ============================================================================
-- Migration: 20261023120000_create_schedule_agenda.sql
-- Description: Sessions a participant saved to "My agenda" on /schedule.
--
-- One row per (email, session). session_id is an id from data/offlineSchedule.ts.
-- Written by /api/agenda for the signed-in email; read by
-- /api/cron/session-reminders (push 10 minutes before start, then sets
-- reminded_at) and tools/mail_daily_agenda.py (morning email digest).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.schedule_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    reminded_at TIMESTAMPTZ,
    UNIQUE (email, session_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_agenda_session ON public.schedule_agenda (session_id) WHERE reminded_at IS NULL;

-- Service role only, matching push_subscriptions
ALTER TABLE public.schedule_agenda ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full management on schedule_agenda" ON public.schedule_agenda;
CREATE POLICY "Allow service role full management on schedule_agenda"
ON public.schedule_agenda
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.schedule_agenda FROM anon, authenticated;
