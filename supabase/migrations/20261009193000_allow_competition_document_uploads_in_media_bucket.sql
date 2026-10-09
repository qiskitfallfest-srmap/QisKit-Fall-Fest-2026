-- ============================================================================
-- Migration: Allow competition document (.pdf, .docx) uploads in media bucket
-- Folder scope: media/competition-submissions/*
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow competition document uploads to media bucket'
  ) THEN
    CREATE POLICY "Allow competition document uploads to media bucket"
      ON storage.objects
      FOR INSERT
      TO public
      WITH CHECK (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'competition-submissions'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Allow competition document updates in media bucket'
  ) THEN
    CREATE POLICY "Allow competition document updates in media bucket"
      ON storage.objects
      FOR UPDATE
      TO public
      USING (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'competition-submissions'
      )
      WITH CHECK (
        bucket_id = 'media'
        AND (storage.foldername(name))[1] = 'competition-submissions'
      );
  END IF;
END $$;
