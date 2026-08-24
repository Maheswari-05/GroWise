# Online Class System - End-to-End Testing Guide

## Overview
This guide provides step-by-step instructions to test the complete online class system with automatic attendance tracking.

## Prerequisites
1. Development server running on `http://localhost:5175/`
2. Supabase database with migrations applied
3. At least one teacher account, one student account, and one admin account
4. Student assigned to a batch with subjects

---

## Test Flow

### Phase 1: Teacher Schedules a Class

#### Steps:
1. **Login as Teacher**
   - Navigate to Role Selection page
   - Select "Teacher" role
   - Login with teacher credentials

2. **Navigate to Online Classes**
   - Click "Online Classes" in the sidebar
   - Verify the page displays existing classes (if any)

3. **Schedule New Class**
   - Click "Schedule New Class" button
   - Fill in the form:
     - **Title**: "Test Physics Class - Quantum Mechanics"
     - **Subject**: Select a subject (e.g., "Physics")
     - **Batch**: Select the student's batch
     - **Date**: Today's date
     - **Time**: A time slot (e.g., "2:00 PM - 3:00 PM")
   - Click "Schedule Class"

4. **Verify Class Created**
   - Check that the new class appears in the list
   - Verify it shows status "UPCOMING"
   - Note the class ID for reference

#### Expected Results:
✓ Class appears in teacher's Online Classes tab
✓ Status shows "UPCOMING"
✓ Batch and subject information displayed correctly
✓ No error messages

---

### Phase 2: Class Goes Live & Attendance Initialization

#### Steps:
1. **Start the Class**
   - Find the scheduled class in the list
   - Click "Start Class" button
   - Verify status changes to "LIVE NOW"

2. **Check Attendance Initialization**
   - Open browser console (F12)
   - Look for log messages indicating attendance initialization:
     ```
     🎯 Initializing attendance for class [classId]...
     ✅ Attendance initialized for [N] students
     ```

3. **Verify Live Class Display**
   - Confirm the video call interface appears
   - Check that "Students in class" section is visible
   - Verify teacher controls (mic, camera, end class) are present

#### Expected Results:
✓ Class status changes to "LIVE NOW"
✓ Attendance records created for all batch students (marked as "Absent" initially)
✓ Console shows successful initialization
✓ Database `attendance_logs` table has new entries with `is_online_class = true`
✓ Database `online_classes` table updated with `attendance_recorded = true`

---

### Phase 3: Student Joins the Class

#### Steps:
1. **Login as Student** (in different browser/incognito)
   - Navigate to Role Selection page
   - Select "Student" role
   - Login with student credentials

2. **Navigate to Online Classes Tab**
   - Click "Online Classes" in the sidebar
   - Verify the live class appears in the list
   - Check for "Your Batch: [batch name]" indicator

3. **Verify Class Visibility**
   - Confirm the class shows "LIVE NOW" badge
   - Verify subject, teacher, date, and time are correct
   - Check that only classes for the student's batch are visible

4. **Join the Class**
   - Click "Join Class" button
   - Watch browser console for logs:
     ```
     🎓 Student [name] ([id]) joining class [classId]...
     ✅ Attendance recorded for [name]
     ```

5. **Verify Class Interface**
   - Confirm video call interface loads
   - Check student controls are available
   - Verify "Leave Class" button is present

#### Expected Results:
✓ Student sees the live class in their dashboard
✓ Only classes for student's batch are visible
✓ "Join Class" button is functional
✓ Console shows successful attendance recording
✓ Database `attendance_logs` updated: student's status changed from "Absent" to "Present"
✓ Database `online_classes` `joined_students` array includes student info
✓ Student's `joined_at` timestamp recorded

---

### Phase 4: Teacher Ends Class & Finalize Attendance

#### Steps:
1. **Return to Teacher Dashboard**
   - In the live class view
   - Click "End Class" button
   - Wait for finalization process

2. **Check Attendance Summary**
   - Verify alert/modal appears showing:
     - Total students: X
     - Present: Y
     - Absent: Z
     - Attendance rate: %
   - Check console for logs:
     ```
     🏁 Ending class [classId] - Finalizing attendance...
     ✅ Class attendance finalized
     ```

3. **Verify Class Status**
   - Confirm class status changes to "COMPLETED"
   - Check that "Start Class" button is no longer available
   - Verify "COMPLETED" badge does NOT appear (removed as per Task #1)

#### Expected Results:
✓ Class status changes to "COMPLETED"
✓ Attendance summary alert displays accurate statistics
✓ Database `online_classes` updated with `ended_at` timestamp
✓ Database `attendance_logs` updated with final durations
✓ Console confirms finalization
✓ No "COMPLETED" or "Attendance Saved" badges visible

---

### Phase 5: Verify Attendance in Student Dashboard

#### Steps:
1. **Return to Student Dashboard**
   - Navigate to "Attendance" tab
   - Look for the recent online class

2. **Check Attendance History**
   - Verify the class appears in attendance table
   - Check for purple "Online" badge with Globe icon
   - Verify status shows "Present"
   - Confirm date, subject, teacher, and duration are correct

3. **Check Attendance Stats**
   - Look at summary cards at top
   - Verify "Total Classes" count includes online class
   - Check "Present" count incremented
   - Verify "Attendance %" is calculated correctly

4. **Test Filtering**
   - Filter by subject to confirm online class appears
   - Filter by time period (This Month) to verify inclusion

#### Expected Results:
✓ Online class appears in student's attendance history
✓ Purple "Online" badge displayed with Globe icon
✓ Status correctly shows "Present"
✓ Duration shows actual time spent in class
✓ Statistics updated accurately
✓ Filters work correctly

---

### Phase 6: Verify Attendance in Teacher Dashboard

#### Steps:
1. **Navigate to Teacher's Attendance Tab**
   - Click "Attendance" in sidebar
   - Check the "History" section

2. **Find Online Class Record**
   - Look for the completed online class
   - Verify purple "Online" badge appears
   - Check student name and status

3. **Check Real-Time Updates**
   - Verify data loads from database
   - Check console for subscription logs:
     ```
     📊 Fetching attendance logs...
     ✓ Found X attendance logs
     ```

4. **Test My Batches Tab**
   - Navigate to "My Batches"
   - Select the batch that attended the class
   - Check student attendance percentage
   - Verify percentages reflect real data (not default 100%)

#### Expected Results:
✓ Online class attendance visible in teacher's Attendance tab
✓ Purple "Online" badges displayed
✓ Real-time data loads from database
✓ Student profiles show accurate attendance percentages
✓ Attendance bars color-coded correctly (green ≥75%, orange ≥60%, red <60%)

---

### Phase 7: Verify Attendance in Admin Dashboard

#### Steps:
1. **Login as Admin**
   - Navigate to Role Selection
   - Select "Admin" role
   - Login with admin credentials

2. **Navigate to Attendance Tab**
   - Click "Attendance" in sidebar
   - Check summary cards at top

3. **Verify Summary Statistics**
   - Check "Online Classes" card count
   - Verify Globe icon appears in purple
   - Confirm count matches scheduled online classes

4. **Check Attendance Table**
   - Look for "Class Type" column
   - Find the online class record
   - Verify purple "Online" badge with Globe icon
   - Check student name, teacher, status, date

5. **Test Class Type Filter**
   - Select "Online" from "Class Type" dropdown
   - Verify only online classes display
   - Select "In-Person" to see traditional attendance
   - Select "All" to see both types

6. **Check Students Tab**
   - Navigate to "Students" tab
   - Find the student who attended the class
   - Check "Attendance" column
   - Verify progress bar and percentage
   - Confirm color coding is correct

#### Expected Results:
✓ "Online Classes" summary card shows correct count
✓ Online class appears in attendance table
✓ "Class Type" column displays purple "Online" badge
✓ Filter correctly separates online and in-person classes
✓ Student attendance percentage includes online class
✓ Progress bar visually represents percentage
✓ Color coding accurate (green/orange/red)

---

## Database Verification

### Check `online_classes` Table
```sql
SELECT id, title, subject, batch_id, teacher_id, status, 
       attendance_recorded, started_at, ended_at, joined_students
FROM online_classes
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- New class record exists
- `batch_id` matches student's batch
- `teacher_id` populated
- `attendance_recorded = true`
- `started_at` and `ended_at` have timestamps
- `joined_students` is JSONB array with student data

### Check `attendance_logs` Table
```sql
SELECT id, student_id, teacher_id, batch_id, class_id, 
       status, is_online_class, joined_at, duration_minutes, date
FROM attendance_logs
WHERE is_online_class = true
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- Multiple records for the class (one per batch student)
- Students who joined have `status = 'Present'`
- Students who didn't join have `status = 'Absent'`
- `is_online_class = true` for all records
- `joined_at` populated for students who joined
- `duration_minutes` calculated for students who stayed

---

## Edge Cases to Test

### 1. Student Not in Batch
- Create a student NOT assigned to the class batch
- Verify they DON'T see the class in their dashboard

### 2. Multiple Classes Same Time
- Schedule two classes for same batch at same time
- Verify both appear (no duplicates)
- Check unique IDs are maintained

### 3. Class Without Students
- Create a batch with no students
- Schedule a class for that batch
- Start the class
- Verify attendance initialization handles empty batch gracefully

### 4. Student Joins Late
- Start a class
- Wait 5 minutes
- Student joins
- Verify `joined_at` timestamp is accurate
- Check duration reflects actual time in class

### 5. Database Connection Loss
- Simulate offline mode (disable network)
- Verify graceful error handling
- Check console for error messages
- Re-enable network and verify data syncs

---

## Success Criteria

✓ Teacher can schedule classes assigned to specific batches
✓ Attendance automatically initialized when class starts
✓ Students see only classes for their batch
✓ Student joining updates attendance to "Present"
✓ Teacher sees real-time attendance during class
✓ Class ending finalizes attendance with accurate statistics
✓ Attendance visible in student dashboard with "Online" badge
✓ Attendance visible in teacher dashboard with accurate percentages
✓ Attendance visible in admin dashboard with filtering
✓ No duplicate classes displayed
✓ All database fields populated correctly
✓ Real-time subscriptions working
✓ Error handling graceful and informative

---

## Troubleshooting

### Class Not Appearing for Student
- Check student's `batch_id` matches class `batch_id`
- Verify console logs for filtering logic
- Check database query results

### Attendance Not Recording
- Verify Supabase connection
- Check browser console for API errors
- Confirm `attendanceTrackingService` imported correctly
- Check database permissions (RLS policies)

### Percentages Showing 100% or 0%
- Verify `attendance_logs` table has data
- Check real-time subscription is active
- Confirm calculation logic in components
- Look for console errors in data fetching

### Real-Time Updates Not Working
- Check Supabase realtime is enabled
- Verify subscription code in useEffect
- Check for unsubscribe on cleanup
- Confirm database triggers are active

---

## Migration SQL Execution

Before testing, ensure you've run the migration:

1. Open Supabase SQL Editor
2. Paste contents of `migration_online_classes_attendance.sql`
3. Execute the migration
4. Verify tables updated with new columns
5. Check triggers created successfully

---

## Conclusion

This comprehensive testing ensures the online class system works end-to-end with automatic attendance tracking visible across all dashboards. Complete all phases to verify full functionality.

**Test Date**: _________________

**Tester**: _________________

**Results**: _________________

**Issues Found**: _________________

---

## Quick Test Checklist

- [ ] Teacher schedules class
- [ ] Class goes live, attendance initialized
- [ ] Student sees class in dashboard
- [ ] Student joins, attendance marked present
- [ ] Teacher ends class, sees summary
- [ ] Student sees attendance in history
- [ ] Teacher sees online attendance
- [ ] Admin sees online class data
- [ ] No duplicates displayed
- [ ] Percentages calculated correctly
- [ ] Real-time updates working
- [ ] Database records accurate
