-- ============================================================
-- GroWise — Missing table creation
-- Create the `materials`, `weekly_tests`, and `assignments`
-- tables that the app writes to but which are NOT currently in
-- the database (all reads/writes to them currently 404).
--
-- Run this in Supabase Dashboard → SQL Editor → New query →
-- paste → Run.
-- ============================================================

-- Ensure gen_random_uuid() is available (Postgres 13+ has it built-in)
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- STUDY MATERIALS
-- Written by StudyMaterials.jsx (dbPayload) + adminService.js
-- ------------------------------------------------------------
create table if not exists public.materials (
  id           uuid primary key default gen_random_uuid(),
  title        text,                  -- JSON blob (title, description, fileName, ...)
  subject      text not null default 'General',
  teacher      text,
  teacher_id   text,
  teacher_email text,
  flagged      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- WEEKLY TESTS
-- Written by addWeeklyTest / updateWeeklyTest (adminService.js)
-- ------------------------------------------------------------
create table if not exists public.weekly_tests (
  id          uuid primary key default gen_random_uuid(),
  subject     text not null default 'General',
  title       text not null,
  teacher     text,                   -- JSON blob (teacher, teacherId, studentMarks, ...)
  date        text,
  status      text not null default 'Result Pending',
  total_marks numeric not null default 20,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ASSIGNMENTS
-- Written by addAssignment (adminService.js)
-- ------------------------------------------------------------
create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  subject     text not null default 'General',
  batch_id    text,
  due_date    text,
  total_marks numeric not null default 20,
  status      text not null default 'Active',
  student     text,
  description text,                   -- JSON blob (description, attachmentName, submissions, ...)
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Row Level Security
-- Enable RLS but allow anon/authenticated full access for this
-- internal app (the client is currently using the anon key for
-- all reads/writes). Replace with stricter policies if needed.
-- ------------------------------------------------------------
alter table public.materials     enable row level security;
alter table public.weekly_tests  enable row level security;
alter table public.assignments   enable row level security;

drop policy if exists "materials anon all"    on public.materials;
drop policy if exists "weekly_tests anon all" on public.weekly_tests;
drop policy if exists "assignments anon all"  on public.assignments;

create policy "materials anon all"    on public.materials    for all using (true) with check (true);
create policy "weekly_tests anon all" on public.weekly_tests for all using (true) with check (true);
create policy "assignments anon all"  on public.assignments  for all using (true) with check (true);

-- ============================================================
-- MIGRATION (idempotent — safe to re-run)
-- The live `materials` table was created WITHOUT the
-- `teacher_email` column that StudyMaterials.jsx writes, so any
-- insert that includes teacher_email returns 400 and the upload
-- only saves locally (cross-device data loss). Add the missing
-- column if it isn't present yet.
-- ============================================================
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'materials' and column_name = 'teacher_email'
  ) then
    alter table public.materials add column teacher_email text;
  end if;
end $$;
