import supabase from '../lib/supabase';

/**
 * Attendance Tracking Service
 * Handles real-time tracking of student attendance in online classes
 */

class AttendanceTrackingService {
  constructor() {
    this.activeClassSessions = new Map(); // classId -> { students: Map(studentId -> joinTime) }
  }

  /**
   * Initialize attendance tracking for a class when it goes live
   */
  async initializeClassAttendance(classId, batchId, teacherId) {
    try {
      // Get all students in the batch
      const { data: students, error } = await supabase
        .from('students')
        .select('id, name, batch_id')
        .eq('batch_id', batchId);

      if (error) throw error;

      // Create attendance records for all students (initially absent)
      const attendanceRecords = students.map(student => ({
        class_id: classId,
        student_id: student.id,
        student: student.name,
        batch_id: batchId,
        teacher_id: teacherId,
        date: new Date().toISOString().split('T')[0],
        status: 'Absent',
        is_online_class: true,
        joined_at: null,
        duration_minutes: 0
      }));

      // Insert initial attendance records
      const { error: insertError } = await supabase
        .from('attendance_logs')
        .insert(attendanceRecords);

      if (insertError) throw insertError;

      // Initialize session tracking
      this.activeClassSessions.set(classId, {
        students: new Map(),
        batchId,
        teacherId,
        startTime: new Date()
      });

      console.log(`✅ Initialized attendance tracking for class ${classId} with ${students.length} students`);
      return { success: true, studentCount: students.length };
    } catch (error) {
      console.error('Error initializing class attendance:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record when a student joins the class
   */
  async recordStudentJoin(classId, studentId, studentName) {
    try {
      const joinTime = new Date();
      
      // Update local session tracking
      const session = this.activeClassSessions.get(classId);
      if (session) {
        session.students.set(studentId, joinTime);
      }

      // Update attendance record to Present
      const { error: updateError } = await supabase
        .from('attendance_logs')
        .update({
          status: 'Present',
          joined_at: joinTime.toISOString()
        })
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (updateError) throw updateError;

      // Update online_classes joined_students array
      const { data: classData } = await supabase
        .from('online_classes')
        .select('joined_students')
        .eq('id', classId)
        .single();

      const joinedStudents = classData?.joined_students || [];
      
      // Add student if not already in the list
      if (!joinedStudents.find(s => s.id === studentId)) {
        joinedStudents.push({
          id: studentId,
          name: studentName,
          joinedAt: joinTime.toISOString()
        });

        await supabase
          .from('online_classes')
          .update({ joined_students: joinedStudents })
          .eq('id', classId);
      }

      console.log(`✅ Student ${studentName} (${studentId}) joined class ${classId}`);
      return { success: true, joinTime };
    } catch (error) {
      console.error('Error recording student join:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record when a student leaves the class
   */
  async recordStudentLeave(classId, studentId) {
    try {
      const leaveTime = new Date();
      
      // Get join time from session
      const session = this.activeClassSessions.get(classId);
      let durationMinutes = 0;
      
      if (session && session.students.has(studentId)) {
        const joinTime = session.students.get(studentId);
        durationMinutes = Math.round((leaveTime - joinTime) / 60000); // Convert ms to minutes
        session.students.delete(studentId);
      }

      // Update attendance record with duration
      const { error: updateError } = await supabase
        .from('attendance_logs')
        .update({
          duration_minutes: durationMinutes
        })
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (updateError) throw updateError;

      console.log(`✅ Student ${studentId} left class ${classId} (Duration: ${durationMinutes} minutes)`);
      return { success: true, durationMinutes };
    } catch (error) {
      console.error('Error recording student leave:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Finalize attendance when class ends
   */
  async finalizeClassAttendance(classId) {
    try {
      const session = this.activeClassSessions.get(classId);
      if (!session) {
        console.warn(`No active session found for class ${classId}`);
        return { success: false, error: 'No active session' };
      }

      const endTime = new Date();

      // Calculate duration for all students still in class
      for (const [studentId, joinTime] of session.students.entries()) {
        const durationMinutes = Math.round((endTime - joinTime) / 60000);
        
        await supabase
          .from('attendance_logs')
          .update({ duration_minutes: durationMinutes })
          .eq('class_id', classId)
          .eq('student_id', studentId);
      }

      // Mark attendance as recorded in online_classes
      const { error: updateError } = await supabase
        .from('online_classes')
        .update({
          attendance_recorded: true,
          ended_at: endTime.toISOString()
        })
        .eq('id', classId);

      if (updateError) throw updateError;

      // Get final attendance stats
      const { data: attendanceData } = await supabase
        .from('attendance_logs')
        .select('status')
        .eq('class_id', classId);

      const stats = {
        total: attendanceData?.length || 0,
        present: attendanceData?.filter(a => a.status === 'Present').length || 0,
        absent: attendanceData?.filter(a => a.status === 'Absent').length || 0
      };

      // Clean up session
      this.activeClassSessions.delete(classId);

      console.log(`✅ Finalized attendance for class ${classId}:`, stats);
      return { success: true, stats };
    } catch (error) {
      console.error('Error finalizing class attendance:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get real-time attendance status for a class
   */
  async getClassAttendanceStatus(classId) {
    try {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('class_id', classId);

      if (error) throw error;

      const session = this.activeClassSessions.get(classId);
      const activeStudents = session ? Array.from(session.students.keys()) : [];

      return {
        success: true,
        attendanceRecords: data,
        activeStudents,
        stats: {
          total: data.length,
          present: data.filter(a => a.status === 'Present').length,
          absent: data.filter(a => a.status === 'Absent').length,
          currentlyActive: activeStudents.length
        }
      };
    } catch (error) {
      console.error('Error getting class attendance status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get student's attendance history
   */
  async getStudentAttendanceHistory(studentId, options = {}) {
    try {
      let query = supabase
        .from('attendance_logs')
        .select(`
          *,
          online_classes!attendance_logs_class_id_fkey (
            id,
            title,
            subject,
            teacher,
            date,
            time
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }
      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }
      if (options.subject) {
        query = query.eq('subject', options.subject);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate statistics
      const stats = {
        total: data.length,
        present: data.filter(a => a.status === 'Present').length,
        absent: data.filter(a => a.status === 'Absent').length,
        late: data.filter(a => a.status === 'Late').length,
        attendancePercentage: data.length > 0 
          ? Math.round((data.filter(a => a.status === 'Present').length / data.length) * 100)
          : 0
      };

      return { success: true, history: data, stats };
    } catch (error) {
      console.error('Error getting student attendance history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get batch attendance statistics
   */
  async getBatchAttendanceStats(batchId, options = {}) {
    try {
      let query = supabase
        .from('attendance_logs')
        .select('*')
        .eq('batch_id', batchId);

      if (options.startDate) {
        query = query.gte('date', options.startDate);
      }
      if (options.endDate) {
        query = query.lte('date', options.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by student
      const studentStats = {};
      data.forEach(record => {
        if (!studentStats[record.student_id]) {
          studentStats[record.student_id] = {
            studentId: record.student_id,
            studentName: record.student,
            total: 0,
            present: 0,
            absent: 0,
            late: 0
          };
        }
        studentStats[record.student_id].total++;
        if (record.status === 'Present') studentStats[record.student_id].present++;
        if (record.status === 'Absent') studentStats[record.student_id].absent++;
        if (record.status === 'Late') studentStats[record.student_id].late++;
      });

      // Calculate percentages
      Object.values(studentStats).forEach(stats => {
        stats.attendancePercentage = stats.total > 0
          ? Math.round((stats.present / stats.total) * 100)
          : 0;
      });

      return {
        success: true,
        studentStats: Object.values(studentStats),
        overallStats: {
          totalRecords: data.length,
          totalPresent: data.filter(a => a.status === 'Present').length,
          totalAbsent: data.filter(a => a.status === 'Absent').length,
          averageAttendance: Object.values(studentStats).length > 0
            ? Math.round(
                Object.values(studentStats).reduce((sum, s) => sum + s.attendancePercentage, 0) /
                Object.values(studentStats).length
              )
            : 0
        }
      };
    } catch (error) {
      console.error('Error getting batch attendance stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up inactive sessions (for long-running classes)
   */
  cleanupInactiveSessions() {
    const now = new Date();
    const maxDuration = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    for (const [classId, session] of this.activeClassSessions.entries()) {
      if (now - session.startTime > maxDuration) {
        console.warn(`⚠️ Cleaning up inactive session for class ${classId}`);
        this.finalizeClassAttendance(classId);
      }
    }
  }
}

// Export singleton instance
export const attendanceTracker = new AttendanceTrackingService();

// Auto-cleanup inactive sessions every 30 minutes
setInterval(() => {
  attendanceTracker.cleanupInactiveSessions();
}, 30 * 60 * 1000);

export default AttendanceTrackingService;
