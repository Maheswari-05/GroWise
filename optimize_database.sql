-- Database Optimization SQL Script for GroWise
-- Run this in Supabase SQL Editor to improve query performance
-- This will reduce API calls by making queries faster

-- ============================================================
-- 1. ADD INDEXES FOR FREQUENTLY QUERIED COLUMNS
-- ============================================================

-- Students table indexes
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);

-- Teachers table indexes
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_created_at ON teachers(created_at DESC);

-- Assignments table indexes
CREATE INDEX IF NOT EXISTS idx_assignments_batch_id ON assignments(batch_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- Materials table indexes
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject);
CREATE INDEX IF NOT EXISTS idx_materials_teacher ON materials(teacher);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at DESC);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Attendance logs table indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id ON attendance_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_logs(date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_created_at ON attendance_logs(created_at DESC);

-- Online classes table indexes
CREATE INDEX IF NOT EXISTS idx_online_classes_batch_id ON online_classes(batch_id);
CREATE INDEX IF NOT EXISTS idx_online_classes_date ON online_classes(date);
CREATE INDEX IF NOT EXISTS idx_online_classes_status ON online_classes(status);

-- Weekly tests table indexes
CREATE INDEX IF NOT EXISTS idx_weekly_tests_batch_id ON weekly_tests(batch_id);
CREATE INDEX IF NOT EXISTS idx_weekly_tests_subject ON weekly_tests(subject);
CREATE INDEX IF NOT EXISTS idx_weekly_tests_created_at ON weekly_tests(created_at DESC);

-- Batches table indexes
CREATE INDEX IF NOT EXISTS idx_batches_teacher_id ON batches(teacher_id);

-- ============================================================
-- 2. ADD ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- This prevents unauthorized access and reduces unnecessary queries

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_tests ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. CREATE VIEWS FOR COMMONLY ACCESSED DATA
-- ============================================================
-- Views reduce repeated complex queries

-- View: Recent notifications (last 30 days only)
CREATE OR REPLACE VIEW recent_notifications AS
SELECT * FROM notifications
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- View: Active assignments (not completed)
CREATE OR REPLACE VIEW active_assignments AS
SELECT * FROM assignments
WHERE status != 'completed'
ORDER BY created_at DESC;

-- View: Recent attendance (last 90 days)
CREATE OR REPLACE VIEW recent_attendance AS
SELECT * FROM attendance_logs
WHERE created_at > NOW() - INTERVAL '90 days'
ORDER BY created_at DESC;

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

ANALYZE students;
ANALYZE teachers;
ANALYZE assignments;
ANALYZE materials;
ANALYZE notifications;
ANALYZE attendance_logs;
ANALYZE online_classes;
ANALYZE weekly_tests;
ANALYZE batches;

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
