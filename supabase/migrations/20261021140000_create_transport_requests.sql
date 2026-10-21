-- ============================================================================
-- Migration: 20261021140000_create_transport_requests.sql
-- Description: SRM bus travel planning (26–30 October) for Phase 2 shortlisted
-- teams and external General Pass holders.
--
-- One row per person (UNIQUE email). Participants answer from /learning/profile;
-- the lead of a shortlisted team can answer for accepted teammates
-- (submitted_by records who wrote the row). A row with needs_transport = false
-- is kept so organizers can tell "own arrangement" apart from "has not answered".
--
--   boarding_point  one of the points in platform_config 'transport_config'
--                   (organizers can edit that list) or 'Other'
--   boarding_other  free text when boarding_point = 'Other'
--   travel_dates    event days the person needs the bus
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transport_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    needs_transport BOOLEAN NOT NULL,
    boarding_point TEXT,
    boarding_other TEXT,
    travel_dates DATE[] NOT NULL DEFAULT '{}',
    team_id UUID REFERENCES public.hackathon_teams(id) ON DELETE SET NULL,
    phone TEXT,
    notes TEXT,
    submitted_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT transport_needs_details CHECK (
        NOT needs_transport
        OR (boarding_point IS NOT NULL AND cardinality(travel_dates) > 0
            AND (boarding_point <> 'Other' OR coalesce(trim(boarding_other), '') <> ''))
    )
);

CREATE INDEX IF NOT EXISTS idx_transport_requests_team ON public.transport_requests (team_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_point ON public.transport_requests (needs_transport, boarding_point);

-- Service role only, matching accommodation_requests
ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full management on transport_requests" ON public.transport_requests;
CREATE POLICY "Allow service role full management on transport_requests"
ON public.transport_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.transport_requests FROM anon, authenticated;
