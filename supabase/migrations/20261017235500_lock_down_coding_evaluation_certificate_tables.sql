-- Migration: 20261017235500_lock_down_coding_evaluation_certificate_tables.sql
-- Description: Replace the permissive RLS policies on the coding challenge
--              tables, submission_evaluations, issued_certificates and
--              registrations with service-role-only access.
--
-- The anon key ships to every browser. Before this migration, directly through
-- PostgREST, any visitor could:
--   - coding_submissions / coding_test_results / coding_drafts
--     (20261008000000, FOR ALL USING (true) WITH CHECK (true)): read every
--     participant's source code and drafts, and insert or rewrite submissions
--     and scores, which feed the coding leaderboard;
--   - coding_challenges (20261008000000): "Allow service write coding_challenges"
--     has no TO clause, so it applied to PUBLIC, not service_role. Anyone could
--     change problem points or disable problems;
--   - submission_evaluations (20261009220000, FOR ALL): read every judge's
--     scores and comments, and set any team or entry to shortlisted / winner;
--   - issued_certificates (20260930000000, anon SELECT): enumerate every
--     certificate holder's email and name;
--   - registrations (20260925000000, anon SELECT and INSERT): read every
--     registrant's email, phone and institution, and insert arbitrary rows.
--
-- After this migration all reads and writes go through Next.js API routes and
-- server components using supabaseAdmin:
--   - coding tables: app/api/qiskit/*, app/api/admin/coding-challenge,
--     lib/qiskit-judge.ts (all behind getServerSession);
--   - submission_evaluations: app/api/admin/{evaluations,hackathon,competitions,
--     coding-challenge}, lib/hackathon-pass.ts. The admin hackathon and
--     competitions views poll /api/admin/evaluations instead of subscribing
--     through Supabase Realtime;
--   - issued_certificates: lib/certificate.ts, app/api/learning/certificate/*,
--     app/api/admin/payments, app/api/payment/webhook, and the public
--     /verify-certificate/[serial] page, which runs on the server and selects
--     only the fields it displays (no email);
--   - registrations: app/api/auth/register, app/api/pass/*,
--     app/api/webhooks/google-form, app/api/learning/certificate/submit-payment,
--     lib/participant-universities.ts.
-- No browser code queries these tables, so no public SELECT is kept. Problem
-- statements for the arena are served from data/qiskit/challenges, not from
-- coding_challenges.
--
-- PREREQUISITE: SUPABASE_SERVICE_ROLE_KEY must be set in the deployment
-- environment and the code from this branch deployed before applying.

-- ============================================================================
-- coding_challenges
-- ============================================================================
ALTER TABLE public.coding_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read coding_challenges" ON public.coding_challenges;
DROP POLICY IF EXISTS "Allow service write coding_challenges" ON public.coding_challenges;

DROP POLICY IF EXISTS "Allow service role full management on coding_challenges" ON public.coding_challenges;
CREATE POLICY "Allow service role full management on coding_challenges"
ON public.coding_challenges
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.coding_challenges FROM anon, authenticated;

-- ============================================================================
-- coding_submissions
-- ============================================================================
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all coding_submissions" ON public.coding_submissions;

DROP POLICY IF EXISTS "Allow service role full management on coding_submissions" ON public.coding_submissions;
CREATE POLICY "Allow service role full management on coding_submissions"
ON public.coding_submissions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.coding_submissions FROM anon, authenticated;

-- ============================================================================
-- coding_test_results
-- ============================================================================
ALTER TABLE public.coding_test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all coding_test_results" ON public.coding_test_results;

DROP POLICY IF EXISTS "Allow service role full management on coding_test_results" ON public.coding_test_results;
CREATE POLICY "Allow service role full management on coding_test_results"
ON public.coding_test_results
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.coding_test_results FROM anon, authenticated;

-- ============================================================================
-- coding_drafts
-- ============================================================================
ALTER TABLE public.coding_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all coding_drafts" ON public.coding_drafts;

DROP POLICY IF EXISTS "Allow service role full management on coding_drafts" ON public.coding_drafts;
CREATE POLICY "Allow service role full management on coding_drafts"
ON public.coding_drafts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.coding_drafts FROM anon, authenticated;

-- ============================================================================
-- submission_evaluations
-- ============================================================================
ALTER TABLE public.submission_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to submission_evaluations" ON public.submission_evaluations;

DROP POLICY IF EXISTS "Allow service role full management on submission_evaluations" ON public.submission_evaluations;
CREATE POLICY "Allow service role full management on submission_evaluations"
ON public.submission_evaluations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.submission_evaluations FROM anon, authenticated;

-- ============================================================================
-- issued_certificates
-- ============================================================================
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read issued_certificates" ON public.issued_certificates;
DROP POLICY IF EXISTS "Allow anon write issued_certificates" ON public.issued_certificates;

DROP POLICY IF EXISTS "Allow service role full management on issued_certificates" ON public.issued_certificates;
CREATE POLICY "Allow service role full management on issued_certificates"
ON public.issued_certificates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.issued_certificates FROM anon, authenticated;

-- ============================================================================
-- registrations
-- ============================================================================
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public registration submissions" ON public.registrations;
DROP POLICY IF EXISTS "Allow public read registrations" ON public.registrations;

DROP POLICY IF EXISTS "Allow service role full management on registrations" ON public.registrations;
CREATE POLICY "Allow service role full management on registrations"
ON public.registrations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.registrations FROM anon, authenticated;

-- ============================================================================
-- Realtime
-- ============================================================================
-- submission_evaluations was added to the publication in 20261009220000. The
-- admin views now poll the API, so remove it (and the others, in case they
-- were added from the dashboard).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'coding_challenges', 'coding_submissions', 'coding_test_results', 'coding_drafts',
    'submission_evaluations', 'issued_certificates', 'registrations'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
