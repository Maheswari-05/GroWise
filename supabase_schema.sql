-- ============================================================
-- GroWise Admin Backend — Supabase Schema
-- Run this ENTIRE file in Supabase SQL Editor (one shot)
-- ============================================================

-- 1. DROP EXISTING TABLES (safe re-run)
-- ============================================================
DROP TABLE IF EXISTS admin_profiles CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS online_classes CASCADE;
DROP TABLE IF EXISTS weekly_tests CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;

-- Also drop existing trigger function if re-running
DROP FUNCTION IF EXISTS log_entity_changes() CASCADE;

-- 2. CREATE TABLES
-- ============================================================

CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE teachers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  qualification TEXT,
  subjects TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  dob TEXT,
  address TEXT,
  parent_name TEXT,
  parent_contact TEXT,
  subjects TEXT[] DEFAULT '{}',
  batch_id TEXT,
  teacher_id TEXT,
  username TEXT,
  password TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE batches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  teacher TEXT,
  student TEXT,
  schedule TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE materials (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  teacher TEXT,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE attendance_logs (
  id SERIAL PRIMARY KEY,
  date TEXT,
  subject TEXT,
  teacher TEXT,
  teacher_id TEXT,
  student TEXT,
  student_id TEXT,
  batch_id TEXT,
  class_id INTEGER,
  status TEXT,
  joined_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  is_online_class BOOLEAN DEFAULT false,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  batch_id TEXT,
  due_date TEXT,
  student TEXT,
  status TEXT DEFAULT 'Pending',
  marks INTEGER,
  total_marks INTEGER,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE weekly_tests (
  id SERIAL PRIMARY KEY,
  subject TEXT,
  title TEXT,
  teacher TEXT,
  date TEXT,
  status TEXT,
  marks_obtained INTEGER,
  total_marks INTEGER,
  percent REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE online_classes (
  id SERIAL PRIMARY KEY,
  subject TEXT,
  title TEXT,
  description TEXT,
  teacher TEXT,
  teacher_id TEXT,
  student TEXT,
  batch_id TEXT,
  date TEXT,
  time TEXT,
  status TEXT DEFAULT 'upcoming',
  attendance_recorded BOOLEAN DEFAULT false,
  joined_students JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type TEXT,
  message TEXT,
  time TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  recipient_type TEXT DEFAULT 'all',  -- 'all' | 'student' | 'teacher' | 'admin'
  recipient TEXT DEFAULT 'all'         -- 'all' | 'student:<id>' | 'teacher:<id>'
);

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TEXT,
  level TEXT,
  source TEXT,
  message TEXT,
  operator TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  student_restricted BOOLEAN DEFAULT true,
  teacher_restricted BOOLEAN DEFAULT true,
  strict_validation BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE ROW LEVEL SECURITY & GRANT TABLE PERMISSIONS
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES — Full CRUD for anon and authenticated roles
-- ============================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'subjects','teachers','students','batches','materials',
    'attendance_logs','assignments','weekly_tests','online_classes',
    'notifications','audit_logs','settings','admin_profiles'
  ])
  LOOP
    EXECUTE format(
      'CREATE POLICY "auth_select_%1$s" ON %1$s FOR SELECT TO anon, authenticated USING (true)', tbl);
    EXECUTE format(
      'CREATE POLICY "auth_insert_%1$s" ON %1$s FOR INSERT TO anon, authenticated WITH CHECK (true)', tbl);
    EXECUTE format(
      'CREATE POLICY "auth_update_%1$s" ON %1$s FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', tbl);
    EXECUTE format(
      'CREATE POLICY "auth_delete_%1$s" ON %1$s FOR DELETE TO anon, authenticated USING (true)', tbl);
  END LOOP;
END
$$;

-- 5. DATABASE TRIGGER FUNCTION — Auto audit logging
-- ============================================================

CREATE OR REPLACE FUNCTION log_entity_changes()
RETURNS TRIGGER AS $$
DECLARE
  new_json JSONB;
  old_json JSONB;
  record_name TEXT;
  record_id TEXT;
  entity_label TEXT;
  source_label TEXT;
BEGIN
  IF TG_OP != 'DELETE' THEN
    new_json := to_jsonb(NEW);
  END IF;
  IF TG_OP != 'INSERT' THEN
    old_json := to_jsonb(OLD);
  END IF;

  -- Labels by table
  CASE TG_TABLE_NAME
    WHEN 'students'  THEN source_label := 'StudentManager';      entity_label := 'student';
    WHEN 'teachers'  THEN source_label := 'TeacherManager';      entity_label := 'teacher';
    WHEN 'subjects'  THEN source_label := 'SubjectManager';      entity_label := 'subject';
    WHEN 'batches'   THEN source_label := 'BatchManager';        entity_label := 'batch';
    WHEN 'materials' THEN source_label := 'MaterialsOversight';  entity_label := 'material';
    ELSE                   source_label := 'System';              entity_label := TG_TABLE_NAME;
  END CASE;

  -- Record identifiers dynamically via JSONB
  IF TG_OP = 'DELETE' THEN
    record_id := old_json->>'id';
    record_name := COALESCE(old_json->>'title', old_json->>'name', 'Record');
  ELSE
    record_id := new_json->>'id';
    record_name := COALESCE(new_json->>'title', new_json->>'name', 'Record');
  END IF;

  -- Insert audit log row
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (timestamp, level, source, message, operator)
    VALUES (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'), 'INFO', source_label,
            'Added new ' || entity_label || ' record: ' || COALESCE(record_name, '') || ' (' || COALESCE(record_id, '') || ')', 'System');
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (timestamp, level, source, message, operator)
    VALUES (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'), 'INFO', source_label,
            'Updated ' || entity_label || ' record: ' || COALESCE(record_name, '') || ' (' || COALESCE(record_id, '') || ')', 'System');
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (timestamp, level, source, message, operator)
    VALUES (to_char(now(), 'YYYY-MM-DD HH24:MI:SS'), 'WARNING', source_label,
            'Deleted ' || entity_label || ' record: ' || COALESCE(record_name, '') || ' (' || COALESCE(record_id, '') || ')', 'System');
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ATTACH TRIGGERS to entity tables
-- ============================================================

CREATE TRIGGER audit_students
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

CREATE TRIGGER audit_teachers
  AFTER INSERT OR UPDATE OR DELETE ON teachers
  FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

CREATE TRIGGER audit_subjects
  AFTER INSERT OR UPDATE OR DELETE ON subjects
  FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

CREATE TRIGGER audit_batches
  AFTER INSERT OR UPDATE OR DELETE ON batches
  FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

CREATE TRIGGER audit_materials
  AFTER INSERT OR UPDATE OR DELETE ON materials
  FOR EACH ROW EXECUTE FUNCTION log_entity_changes();

-- 7. ENABLE SUPABASE REALTIME on all tables
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE
  subjects, teachers, students, batches, materials,
  attendance_logs, assignments, weekly_tests, online_classes,
  notifications, audit_logs, settings, admin_profiles;

-- 8. SEED DATA (2 records per entity)
-- ============================================================
-- NOTE: Assignments, weekly_tests, online_classes, attendance_logs
--       are NOT seeded — they come from teacher/student actions.

INSERT INTO subjects (id, name, code, description) VALUES
  ('1', 'Mathematics', 'MATH12', 'Advanced Calculative Algebra & Calculus Revision Course'),
  ('2', 'Physics', 'PHYS12', 'Quantum Physics Fundamentals & Thermal Systems Dynamics');

INSERT INTO teachers (id, name, contact, email, qualification, subjects, status) VALUES
  ('TCH101', 'Mr. Rajesh',  '+91 94441 23456', 'rajesh.math@growise.edu', 'M.Sc. Mathematics, 10 yrs exp', ARRAY['Mathematics'], 'Active'),
  ('TCH102', 'Mrs. Anita',  '+91 94442 34567', 'anita.phys@growise.edu',  'Ph.D. Physics, 8 yrs exp',      ARRAY['Physics'],     'Active');

INSERT INTO students (id, name, contact, email, dob, address, parent_name, parent_contact, subjects, batch_id, username, password, status) VALUES
  ('STU101', 'Sneha',   '+91 98765 43210', 'sneha@growise.edu',   '2008-04-12', 'No. 12, Guindy Road, Chennai',  'Mr. Ramakrishnan', '+91 98765 99999', ARRAY['Mathematics','Physics'], 'BAT101', 'Sneha',   'Sneha@123',    'Active'),
  ('STU102', 'Aravind', '+91 98765 11111', 'aravind@growise.edu', '2007-09-18', 'No. 40, Velachery, Chennai',    'Mrs. Lakshmi',     '+91 98765 22222', ARRAY['Mathematics','Physics'], 'BAT102', 'Aravind', 'Password@123', 'Active');

INSERT INTO batches (id, name, subject, teacher, student, schedule, status) VALUES
  ('BAT101', 'Batch 12-Maths-Sneha',   'Mathematics', 'Mr. Rajesh', 'Sneha',   'Mon, Wed, Fri - 5:00 PM', 'Active'),
  ('BAT102', 'Batch 12-Phys-Aravind',  'Physics',     'Mrs. Anita', 'Aravind', 'Tue, Thu - 4:00 PM',      'Active');

INSERT INTO materials (id, title, subject, teacher, flagged) VALUES
  ('1', 'Algebra practice Worksheet.pdf',  'Mathematics', 'Mr. Rajesh', false),
  ('2', 'Quantum Physics Waves Notes.pdf', 'Physics',     'Mrs. Anita', false);

INSERT INTO notifications (type, message, time) VALUES
  ('assignment', 'Sneha submitted Physics Quantum Mechanics Homework',        '2 hours ago'),
  ('material',   'Mr. Rajesh uploaded Calculus Limits Formulas study sheet',  '5 hours ago');

INSERT INTO audit_logs (timestamp, level, source, message, operator) VALUES
  ('2026-07-29 19:15:22', 'INFO',    'AuthControl',    'Admin authenticated via secure control credentials.',             'Admin'),
  ('2026-07-29 19:10:05', 'WARNING', 'StudyMaterials', 'Chemistry study file flagged for inappropriate title review.',    'TutorSystem');

INSERT INTO settings (id, student_restricted, teacher_restricted, strict_validation) VALUES
  (1, true, true, false);

-- ============================================================
-- DONE! Now create the admin user in Supabase Dashboard:
--   Authentication → Users → Add User
--   Email:    maha@growise.edu
--   Password: Maha@123
--   Auto Confirm: ON
--
-- The admin_profiles row will be auto-created on first login.
-- ============================================================
