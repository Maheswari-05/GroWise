-- Database Optimization SQL Script for GroWise
-- Run this in Supabase SQL Editor to improve query performance
-- This will reduce API calls by making queries faster

-- ============================================================
-- 1. ADD INDEXES FOR FREQUENTLY QUERIED COLUMNS
-- ============================================================
-- Note: Uses conditional logic to only create indexes if tables/columns exist

-- Students table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'students') THEN
    CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
    CREATE INDEX IF NOT EXISTS idx_students_batch_id ON students(batch_id);
    CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);
  END IF;
END $$;

-- Teachers table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'teachers') THEN
    CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
    CREATE INDEX IF NOT EXISTS idx_teachers_created_at ON teachers(created_at DESC);
  END IF;
END $$;

-- Assignments table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'assignments' AND column_name = 'batch_id') THEN
      CREATE INDEX IF NOT EXISTS idx_assignments_batch_id ON assignments(batch_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'assignments' AND column_name = 'subject') THEN
      CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'assignments' AND column_name = 'status') THEN
      CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
    END IF;
    CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at DESC);
  END IF;
END $$;

-- Materials table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'materials') THEN
    CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject);
    CREATE INDEX IF NOT EXISTS idx_materials_teacher ON materials(teacher);
    CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at DESC);
  END IF;
END $$;

-- Notifications table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'recipient') THEN
      CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'type') THEN
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
    END IF;
  END IF;
END $$;

-- Attendance logs table indexes (conditional - only create if columns exist)
DO $$
BEGIN
  -- Check if columns exist before creating indexes
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'attendance_logs' AND column_name = 'student_id') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_logs(student_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'attendance_logs' AND column_name = 'teacher_id') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance_logs(teacher_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'attendance_logs' AND column_name = 'date') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_logs(date DESC);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'attendance_logs' AND column_name = 'created_at') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance_logs(created_at DESC);
  END IF;
END $$;

-- Online classes table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'online_classes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'online_classes' AND column_name = 'batch_id') THEN
      CREATE INDEX IF NOT EXISTS idx_online_classes_batch_id ON online_classes(batch_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'online_classes' AND column_name = 'date') THEN
      CREATE INDEX IF NOT EXISTS idx_online_classes_date ON online_classes(date);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'online_classes' AND column_name = 'status') THEN
      CREATE INDEX IF NOT EXISTS idx_online_classes_status ON online_classes(status);
    END IF;
  END IF;
END $$;

-- Weekly tests table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_tests') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weekly_tests' AND column_name = 'batch_id') THEN
      CREATE INDEX IF NOT EXISTS idx_weekly_tests_batch_id ON weekly_tests(batch_id);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'weekly_tests' AND column_name = 'subject') THEN
      CREATE INDEX IF NOT EXISTS idx_weekly_tests_subject ON weekly_tests(subject);
    END IF;
    CREATE INDEX IF NOT EXISTS idx_weekly_tests_created_at ON weekly_tests(created_at DESC);
  END IF;
END $$;

-- Batches table indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'batches') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'batches' AND column_name = 'teacher_id') THEN
      CREATE INDEX IF NOT EXISTS idx_batches_teacher_id ON batches(teacher_id);
    END IF;
  END IF;
END $$;

-- ============================================================
-- 2. ADD ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- This prevents unauthorized access and reduces unnecessary queries
-- Only enables RLS if tables exist

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'students', 'teachers', 'assignments', 'materials', 
    'notifications', 'attendance_logs', 'online_classes', 'weekly_tests'
  ])
  LOOP
    -- Check if table exists before enabling RLS
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      RAISE NOTICE 'RLS enabled for table: %', tbl;
    ELSE
      RAISE NOTICE 'Table % does not exist, skipping RLS', tbl;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 3. CREATE VIEWS FOR COMMONLY ACCESSED DATA
-- ============================================================
-- Views reduce repeated complex queries
-- Only creates views if base tables exist

-- View: Recent notifications (last 30 days only)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW recent_notifications AS
      SELECT * FROM notifications
      WHERE created_at > NOW() - INTERVAL ''30 days''
      ORDER BY created_at DESC
    ';
    RAISE NOTICE 'Created view: recent_notifications';
  END IF;
END $$;

-- View: Active assignments (not completed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW active_assignments AS
      SELECT * FROM assignments
      WHERE status != ''completed''
      ORDER BY created_at DESC
    ';
    RAISE NOTICE 'Created view: active_assignments';
  END IF;
END $$;

-- View: Recent attendance (last 90 days)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance_logs') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW recent_attendance AS
      SELECT * FROM attendance_logs
      WHERE created_at > NOW() - INTERVAL ''90 days''
      ORDER BY created_at DESC
    ';
    RAISE NOTICE 'Created view: recent_attendance';
  END IF;
END $$;

-- ============================================================
-- 4. CLEANUP OLD DATA (ONE-TIME EXECUTION)
-- ============================================================
-- Comment out after first run to prevent accidental deletion

-- Delete notifications older than 60 days
-- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '60 days';

-- Delete attendance logs older than 120 days
-- DELETE FROM attendance_logs WHERE created_at < NOW() - INTERVAL '120 days';

-- Delete completed assignments older than 90 days
-- DELETE FROM assignments WHERE status = 'completed' AND created_at < NOW() - INTERVAL '90 days';

-- ============================================================
-- 5. ANALYZE TABLES FOR BETTER QUERY PLANNING
-- ============================================================
-- Updates statistics used by the query planner
-- Only analyzes tables that exist

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'students', 'teachers', 'assignments', 'materials', 
    'notifications', 'attendance_logs', 'online_classes', 
    'weekly_tests', 'batches'
  ])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
      EXECUTE format('ANALYZE %I', tbl);
      RAISE NOTICE 'Analyzed table: %', tbl;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- 6. VACUUM TABLES TO RECLAIM STORAGE
-- ============================================================
-- Reclaims storage from deleted rows
-- Note: VACUUM FULL requires table lock, do during low traffic

-- VACUUM FULL students;
-- VACUUM FULL teachers;
-- VACUUM FULL assignments;
-- VACUUM FULL materials;
-- VACUUM FULL notifications;
-- VACUUM FULL attendance_logs;

-- ============================================================
-- DONE! Database optimization complete.
-- ============================================================

-- To verify indexes were created, run:
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- To check table sizes, run:
-- SELECT 
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
