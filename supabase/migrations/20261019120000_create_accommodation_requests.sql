-- ============================================================================
-- Migration: 20261019120000_create_accommodation_requests.sql
-- Description: Accommodation planning for external participants (26–30 October).
--
-- One row per person who will stay (UNIQUE email). External participants fill
-- their own row from /learning/profile; a hackathon team lead can fill rows for
-- the external members of the team (submitted_by records who wrote the row).
-- A row with needs_accommodation = false is kept so the organizers can tell
-- "does not need a stay" apart from "has not answered".
-- Organizers use gender and the check-in / check-out nights to book rooms.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.accommodation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    needs_accommodation BOOLEAN NOT NULL DEFAULT true,
    check_in DATE,
    check_out DATE,
    team_id UUID REFERENCES public.hackathon_teams(id) ON DELETE SET NULL,
    institution TEXT,
    phone TEXT,
    notes TEXT,
    submitted_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'allocated', 'cancelled')),
    allocation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT accommodation_needs_details CHECK (
        NOT needs_accommodation
        OR (gender IS NOT NULL AND check_in IS NOT NULL AND check_out IS NOT NULL AND check_out > check_in)
    )
);

CREATE INDEX IF NOT EXISTS idx_accommodation_requests_team ON public.accommodation_requests (team_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_requests_needs ON public.accommodation_requests (needs_accommodation, gender);

-- Service role only, matching the other participant tables (20261017233000)
ALTER TABLE public.accommodation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full management on accommodation_requests" ON public.accommodation_requests;
CREATE POLICY "Allow service role full management on accommodation_requests"
ON public.accommodation_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.accommodation_requests FROM anon, authenticated;
