-- ============================================================================
-- Migration: Support competition submission window overrides
-- Allows per-user extended submission deadlines configured in public.platform_config
-- for key 'competition_submission_overrides'.
-- Specifically permits document uploads for vemulaguruprasad713@gmail.com
-- through 18 October 2026, 11:59:59 PM IST.
-- ============================================================================

ALTER POLICY "Allow competition document uploads to media bucket"
  ON storage.objects
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'competition-submissions'
    AND (
      now() <= TIMESTAMPTZ '2026-10-17 23:59:59+05:30'
      OR (
        name ILIKE '%vemulaguruprasad713%'
        AND now() <= TIMESTAMPTZ '2026-10-18 23:59:59+05:30'
      )
    )
  );

ALTER POLICY "Allow competition document updates in media bucket"
  ON storage.objects
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'competition-submissions'
    AND (
      now() <= TIMESTAMPTZ '2026-10-17 23:59:59+05:30'
      OR (
        name ILIKE '%vemulaguruprasad713%'
        AND now() <= TIMESTAMPTZ '2026-10-18 23:59:59+05:30'
      )
    )
  )
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'competition-submissions'
    AND (
      now() <= TIMESTAMPTZ '2026-10-17 23:59:59+05:30'
      OR (
        name ILIKE '%vemulaguruprasad713%'
        AND now() <= TIMESTAMPTZ '2026-10-18 23:59:59+05:30'
      )
    )
  );
