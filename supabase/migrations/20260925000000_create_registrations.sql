-- Migration: 20260925000000_create_registrations.sql
-- Description: Provision registrations table for onsite / general festival registrations

CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    institution TEXT,
    role TEXT,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated public submissions
CREATE POLICY "Allow public registration submissions" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read registrations"
ON public.registrations
FOR SELECT
USING (true);
