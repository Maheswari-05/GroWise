-- ============================================================
-- MIGRATION: Add teacher_id to materials table
-- ============================================================
-- Run this in the Supabase SQL editor.
--
-- The upload code used to reference a teacher_id column that did NOT
-- exist in the deployed 'materials' table, causing a 400 error:
--   "couldn't find the teacher_id column of materials in the schema cache"
--
-- Uploads now work WITHOUT this column (the code scopes a teacher's notes
-- by the 'teacher' name column). Adding this column is recommended so each
-- material can also be matched by the exact teacher id, making teacher
-- scoping robust even when two teachers share a name.
-- ============================================================

ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS teacher_id TEXT;
