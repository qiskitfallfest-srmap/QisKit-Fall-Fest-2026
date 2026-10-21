-- ============================================================================
-- Migration: 20261021170000_accommodation_travel_details.sql
-- Description: How participants who need a room reach campus, so organizers
-- can plan pickups.
--
--   travelling_from  home city or town
--   arrival_mode     train | bus | flight | own_vehicle
--   arrival_point    a listed point (lib/accommodation.ts ARRIVAL_POINTS) or the
--                    place the participant typed for "Other"
--   arrival_time     approximate arrival time on the check-in date (IST)
--
-- Nullable: rows saved before this migration have no travel details; the
-- profile asks those participants to add them.
-- ============================================================================

ALTER TABLE public.accommodation_requests
    ADD COLUMN IF NOT EXISTS travelling_from TEXT,
    ADD COLUMN IF NOT EXISTS arrival_mode TEXT
        CHECK (arrival_mode IN ('train', 'bus', 'flight', 'own_vehicle')),
    ADD COLUMN IF NOT EXISTS arrival_point TEXT,
    ADD COLUMN IF NOT EXISTS arrival_time TIME;
