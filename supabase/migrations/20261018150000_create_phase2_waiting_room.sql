-- ============================================================================
-- Migration: 20261018150000_create_phase2_waiting_room.sql
-- Description: Rolling Phase 2 invitations ("waiting room").
--
-- Admins release Phase 1 results team by team from /learning/admin. Inviting a
-- team creates a row in hackathon_phase2_offers. The team lead accepts or
-- declines before respond_by; after accepting, every member pays the Flagship
-- Pass before pay_by, the lead paying last. A declined or expired offer frees
-- the desk, and the next waitlisted team in the same track (highest jury score)
-- is invited automatically by lib/phase2-waiting-room.ts.
--
-- One offer row per team (UNIQUE team_id): the unique constraint is what keeps
-- two concurrent auto-promotions from inviting the same team twice.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hackathon_phase2_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL UNIQUE REFERENCES public.hackathon_teams(id) ON DELETE CASCADE,
    track TEXT NOT NULL CHECK (track IN ('internal', 'external')),
    status TEXT NOT NULL DEFAULT 'invited'
        CHECK (status IN ('invited', 'accepted', 'confirmed', 'declined', 'expired', 'revoked')),
    source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'auto_promotion')),
    replaces_offer_id UUID REFERENCES public.hackathon_phase2_offers(id) ON DELETE SET NULL,
    replaced_by_offer_id UUID REFERENCES public.hackathon_phase2_offers(id) ON DELETE SET NULL,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    invited_by TEXT,
    respond_by TIMESTAMPTZ NOT NULL,
    payment_window_hours INTEGER NOT NULL DEFAULT 48 CHECK (payment_window_hours BETWEEN 1 AND 240),
    responded_at TIMESTAMPTZ,
    responded_by TEXT,
    decline_reason TEXT,
    pay_by TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    close_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_phase2_offers_status ON public.hackathon_phase2_offers (status);
CREATE INDEX IF NOT EXISTS idx_phase2_offers_track_status ON public.hackathon_phase2_offers (track, status);
CREATE INDEX IF NOT EXISTS idx_phase2_offers_respond_by ON public.hackathon_phase2_offers (respond_by) WHERE status = 'invited';
CREATE INDEX IF NOT EXISTS idx_phase2_offers_pay_by ON public.hackathon_phase2_offers (pay_by) WHERE status = 'accepted';

-- Service role only, matching the other hackathon tables (20261017233000)
ALTER TABLE public.hackathon_phase2_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full management on hackathon_phase2_offers" ON public.hackathon_phase2_offers;
CREATE POLICY "Allow service role full management on hackathon_phase2_offers"
ON public.hackathon_phase2_offers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.hackathon_phase2_offers FROM anon, authenticated;

-- ============================================================================
-- submission_evaluations: per-team result release and participant-facing note
-- ============================================================================
-- result_released_at: NULL keeps the jury decision hidden from the team.
-- participant_feedback: shown to the team with its result (unlike `comments`,
-- which stays internal to the jury).
ALTER TABLE public.submission_evaluations
    ADD COLUMN IF NOT EXISTS result_released_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS participant_feedback TEXT;
