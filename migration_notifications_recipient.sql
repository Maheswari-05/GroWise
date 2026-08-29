-- ============================================================
-- MIGRATION: Targeted notifications (per-role / per-user)
-- ============================================================
-- Run this in the Supabase SQL editor BEFORE the app update.
-- Adds two columns that let each client fetch ONLY the rows that
-- belong to it, instead of every client receiving every row and
-- filtering heuristically (which is what caused notifications to
-- "go to all" roles).
--
--   recipient_type : 'all' | 'student' | 'teacher' | 'admin'
--   recipient      : 'all' | 'student:<id>' | 'teacher:<id>'
--
-- Purpose:
--   * student rows  -> recipient_type='student'
--   * teacher rows  -> recipient_type='teacher'
--   * global rows   -> recipient_type='all' (legacy / admin oversight)
-- ============================================================

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS recipient_type TEXT DEFAULT 'all';

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS recipient TEXT DEFAULT 'all';

-- Optional index for fast per-role filtering
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type
  ON public.notifications (recipient_type);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON public.notifications (recipient);
