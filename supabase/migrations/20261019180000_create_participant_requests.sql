-- ============================================================================
-- Migration: 20261019180000_create_participant_requests.sql
-- Description: Requests participants send to the organizers from /learning/profile.
--
--   kind = 'roster_change'  A team lead asks to add and/or drop members (or a
--                           member asks to leave). Rosters are locked after
--                           finalization, so the change is applied only when an
--                           admin approves it (lib/participant-requests.ts).
--                           changes = { add: [{email, name, institution}],
--                                       drop: [{email, name}] }
--   kind = 'question'       Free-form question; the admin reply is shown on the
--                           participant's profile.
--
-- message holds the participant's reason (roster change) or question text.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.participant_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL CHECK (kind IN ('roster_change', 'question')),
    requester_email TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    team_id UUID REFERENCES public.hackathon_teams(id) ON DELETE SET NULL,
    team_name TEXT,
    category TEXT,
    subject TEXT,
    message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 3000),
    changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'approved', 'rejected', 'answered', 'withdrawn')),
    admin_response TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_participant_requests_requester ON public.participant_requests (lower(requester_email));
CREATE INDEX IF NOT EXISTS idx_participant_requests_status ON public.participant_requests (status, kind);
CREATE INDEX IF NOT EXISTS idx_participant_requests_team ON public.participant_requests (team_id);

-- One open roster change per team at a time
CREATE UNIQUE INDEX IF NOT EXISTS uniq_participant_requests_open_roster
    ON public.participant_requests (team_id)
    WHERE kind = 'roster_change' AND status = 'open';

-- Service role only, matching the other participant tables (20261017233000)
ALTER TABLE public.participant_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full management on participant_requests" ON public.participant_requests;
CREATE POLICY "Allow service role full management on participant_requests"
ON public.participant_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.participant_requests FROM anon, authenticated;

-- ============================================================================
-- certificate_names: the exact name a participant wants printed on certificates.
-- Set from /learning/profile; locked once a certificate is issued. Minting uses
-- it ahead of the account name (app/api/admin/payments, submit-payment).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.certificate_names (
    email TEXT PRIMARY KEY,
    certificate_name TEXT NOT NULL CHECK (char_length(certificate_name) BETWEEN 2 AND 80),
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.certificate_names ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full management on certificate_names" ON public.certificate_names;
CREATE POLICY "Allow service role full management on certificate_names"
ON public.certificate_names
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.certificate_names FROM anon, authenticated;
