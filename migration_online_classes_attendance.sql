-- ============================================================
-- Migration: Enhanced Online Classes & Attendance Tracking
-- Run this in Supabase SQL Editor to update existing database
-- ============================================================

-- Add new columns to online_classes table
ALTER TABLE online_classes 
  ADD COLUMN IF NOT EXISTS teacher_id TEXT,
  ADD COLUMN IF NOT EXISTS batch_id TEXT,
  ADD COLUMN IF NOT EXISTS attendance_recorded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS joined_students JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Update status column to have default value
ALTER TABLE online_classes 
  ALTER COLUMN status SET DEFAULT 'upcoming';

-- Add new columns to attendance_logs table
ALTER TABLE attendance_logs 
  ADD COLUMN IF NOT EXISTS teacher_id TEXT,
  ADD COLUMN IF NOT EXISTS student_id TEXT,
  ADD COLUMN IF NOT EXISTS batch_id TEXT,
  ADD COLUMN IF NOT EXISTS class_id INTEGER,
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS is_online_class BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_online_classes_batch_id ON online_classes(batch_id);
CREATE INDEX IF NOT EXISTS idx_online_classes_status ON online_classes(status);
CREATE INDEX IF NOT EXISTS idx_online_classes_date ON online_classes(date);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_student_id ON attendance_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_class_id ON attendance_logs(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_batch_id ON attendance_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_date ON attendance_logs(date);

-- Migrate existing data: copy 'student' field to 'batch_id' if batch_id is null
UPDATE online_classes 
SET batch_id = student 
WHERE batch_id IS NULL AND student IS NOT NULL;

-- Create a function to automatically record attendance when class ends
CREATE OR REPLACE FUNCTION auto_record_class_attendance()
RETURNS TRIGGER AS $$
BEGIN
  -- When class status changes to 'completed' and attendance not yet recorded
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.attendance_recorded = false THEN
    -- Mark attendance as recorded
    NEW.attendance_recorded := true;
    NEW.ended_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic attendance recording
DROP TRIGGER IF EXISTS trigger_auto_record_attendance ON online_classes;
CREATE TRIGGER trigger_auto_record_attendance
  BEFORE UPDATE ON online_classes
  FOR EACH ROW
  EXECUTE FUNCTION auto_record_class_attendance();

-- Create a function to track when class starts
CREATE OR REPLACE FUNCTION track_class_start()
RETURNS TRIGGER AS $$
BEGIN
  -- When class status changes to 'live'
  IF NEW.status = 'live' AND OLD.status != 'live' AND NEW.started_at IS NULL THEN
    NEW.started_at := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for class start tracking
DROP TRIGGER IF EXISTS trigger_track_class_start ON online_classes;
CREATE TRIGGER trigger_track_class_start
  BEFORE UPDATE ON online_classes
  FOR EACH ROW
  EXECUTE FUNCTION track_class_start();

-- ============================================================
-- DONE! The database is now ready for enhanced attendance tracking
-- ============================================================
