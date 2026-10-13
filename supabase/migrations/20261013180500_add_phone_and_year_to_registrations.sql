-- Migration: 20261013180500_add_phone_and_year_to_registrations.sql
-- Description: Add phone, year_of_study columns and index to public.registrations for instant participant onboarding.

ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS year_of_study TEXT;

CREATE INDEX IF NOT EXISTS idx_registrations_email_lower ON public.registrations (lower(email));
