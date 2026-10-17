-- ============================================================================
-- Migration: Close competition document uploads after the online deadline
-- Online competitions closed 17 October 2026, 11:59 PM IST.
-- The original policies let the public role INSERT and UPDATE anything under
-- media/competition-submissions/*, which would allow submitted documents to be
-- overwritten after judging starts. Both policies now expire at the deadline.
-- ALTER POLICY (not DROP/CREATE) matches how this was applied in production.
-- ============================================================================

ALTER POLICY "Allow competition document uploads to media bucket"
  ON storage.objects
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'competition-submissions'
    AND now() <= TIMESTAMPTZ '2026-10-17 23:59:59+05:30'
  );

ALTER POLICY "Allow competition document updates in media bucket"
  ON storage.objects
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'competition-submissions'
    AND now() <= TIMESTAMPTZ '2026-10-17 23:59:59+05:30'
  )
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'competition-submissions'
    AND now() <= TIMESTAMPTZ '2026-10-17 23:59:59+05:30'
  );
