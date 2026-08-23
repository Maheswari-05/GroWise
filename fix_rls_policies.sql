-- ============================================================
-- GroWise — FIX PERMISSIONS & RLS POLICIES
-- Copy and run this ENTIRE script in Supabase SQL Editor
-- ============================================================

-- 1. Create contact_inquiries table if it does not exist
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Student',
  preferred_date TEXT,
  preferred_time TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Grant schema & table permissions to anon, authenticated & service_role
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- 3. Drop existing policies and re-create wide open RLS policies
DO $$
DECLARE
  tbl TEXT;
  pol RECORD;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'subjects','teachers','students','batches','materials',
    'attendance_logs','assignments','weekly_tests','online_classes',
    'notifications','audit_logs','settings','admin_profiles','contact_inquiries'
  ])
  LOOP
    -- Drop all existing policies on table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, tbl);
    END LOOP;

    -- Create fresh RLS policies
    EXECUTE format(
      'CREATE POLICY "allow_select_%1$s" ON %1$s FOR SELECT TO anon, authenticated USING (true)', tbl);
    EXECUTE format(
      'CREATE POLICY "allow_insert_%1$s" ON %1$s FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl);
    EXECUTE format(
      'CREATE POLICY "allow_update_%1$s" ON %1$s FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format(
      'CREATE POLICY "allow_delete_%1$s" ON %1$s FOR DELETE TO anon, authenticated USING (true)', tbl);
  END LOOP;
END
$$;

SELECT 'Permissions and RLS policies successfully granted!' AS status;
