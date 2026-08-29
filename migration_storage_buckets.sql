-- ============================================================
-- MIGRATION: Create Supabase Storage buckets
-- ============================================================
-- Run this in the Supabase SQL editor AFTER applying the schema.
--
-- The app uploads files to two public Storage buckets:
--   * 'weekly-tests'  -> test papers (papers/*), student test
--                        submissions and assignment attachments (submissions/*)
--   * 'materials'     -> study material files (materials/*)
--
-- IMPORTANT: Without these buckets the frontend silently falls back to
-- storing full base64 file content inside DB rows (weekly_tests /
-- assignments JSON), which bloats database size AND egress. Creating the
-- buckets lets uploads go to Storage and only a short public URL is stored.
--
-- Buckets are created as PUBLIC and use the same permissive policy style as
-- the rest of this app (full CRUD for anon + authenticated), matching the
-- table RLS in supabase_schema.sql so the browser anon key can upload and
-- the getPublicUrl(...) links remain usable.
-- ============================================================

-- 1. Create the buckets (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('weekly-tests', 'weekly-tests', true),
  ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable read access to the public file URLs (frontend getPublicUrl)
DROP POLICY IF EXISTS "public_read_weekly-tests" ON storage.objects;
CREATE POLICY "public_read_weekly-tests"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'weekly-tests');

DROP POLICY IF EXISTS "public_read_materials" ON storage.objects;
CREATE POLICY "public_read_materials"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'materials');

-- 3. Upload / update / delete (browser anon key performs uploads)
DROP POLICY IF EXISTS "public_insert_weekly-tests" ON storage.objects;
CREATE POLICY "public_insert_weekly-tests"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'weekly-tests');

DROP POLICY IF EXISTS "public_insert_materials" ON storage.objects;
CREATE POLICY "public_insert_materials"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'materials');

DROP POLICY IF EXISTS "public_update_weekly-tests" ON storage.objects;
CREATE POLICY "public_update_weekly-tests"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'weekly-tests')
  WITH CHECK (bucket_id = 'weekly-tests');

DROP POLICY IF EXISTS "public_update_materials" ON storage.objects;
CREATE POLICY "public_update_materials"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'materials')
  WITH CHECK (bucket_id = 'materials');

DROP POLICY IF EXISTS "public_delete_weekly-tests" ON storage.objects;
CREATE POLICY "public_delete_weekly-tests"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'weekly-tests');

DROP POLICY IF EXISTS "public_delete_materials" ON storage.objects;
CREATE POLICY "public_delete_materials"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'materials');

-- ============================================================
-- Once this runs, go to Supabase -> Storage and confirm both
-- 'weekly-tests' and 'materials' appear with the "Public" badge.
-- ============================================================
