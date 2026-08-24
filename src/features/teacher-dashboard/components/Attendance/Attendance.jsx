import { useState, useEffect } from "react";
import { Calendar, Search, Filter, BookOpen, Users, CheckCircle, XCircle, AlertCircle, Edit, Save, Plus, ArrowLeft, History, Globe } from "lucide-react";
import * as adminService from "../../../../services/adminService";
import supabase from "../../../../lib/supabase";
import "./Attendance.css";

const Attendance = ({ attendanceRecords, setAttendanceRecords, students, batches, teacherProfile }) => {
  const [activeTab, setActiveTab] = useState("register"); // "register" | "history"
  const [selectedBatch, setSelectedBatch] = useState("b1");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Search queries
  const [searchStudentQuery, setSearchStudentQuery] = useState("");
  const [searchHistoryQuery, setSearchHistoryQuery] = useState("");

  // Editing state for active attendance sheet
  const [tempRecords, setTempRecords] = useState({}); // studentId -> status ("present" | "absent" | "late")
  const [tempRemarks, setTempRemarks] = useState({}); // studentId -> remark
  const [onlineClassFlag, setOnlineClassFlag] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dbAttendanceLogs, setDbAttendanceLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch attendance logs from database (includes online class attendance)
  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      if (!teacherProfile) return;
      
      setLoadingLogs(true);
      try {
        const teacherId = teacherProfile.id || teacherProfile.email;
        
        // Fetch attendance logs for this teacher
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('*')
          .eq('teacher_id', teacherId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          console.log(`📊 Fetched ${data.length} attendance logs from database`);
          setDbAttendanceLogs(data);
          
          // Merge with local attendance records
          mergeAttendanceData(data);
        }
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchAttendanceLogs();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('teacher-attendance-logs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendance_logs',
        filter: `teacher_id=eq.${teacherProfile?.id || teacherProfile?.email}`
      }, () => {
        fetchAttendanceLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [teacherProfile]);

  // Merge database attendance logs with local records
  const mergeAttendanceData = (dbLogs) => {
    if (!dbLogs || dbLogs.length === 0) return;

    // Group logs by date, batch, and subject
    const groupedLogs = {};
    
    dbLogs.forEach(log => {
      const key = `${log.date}_${log.batch_id}_${log.subject}`;
      if (!groupedLogs[key]) {
        groupedLogs[key] = {
          id: log.id || key,
          date: log.date,
          batchId: log.batch_id,
          subject: log.subject,
          teacherStatus: 'Submitted',
          onlineClass: log.is_online_class || false,
          records: {},
          remarks: {}
        };
      }
      
      // Add student record
      if (log.student_id) {
        groupedLogs[key].records[log.student_id] = log.status === 'Present' ? 'present' : 
                                                      log.status === 'Absent' ? 'absent' : 
                                                      log.status === 'Late' ? 'late' : 'present';
        groupedLogs[key].remarks[log.student_id] = log.remarks || '';
      }
    });

    const mergedRecords = Object.values(groupedLogs);
    
    // Merge with existing local records (keep local if not in DB)
    const existingIds = new Set(mergedRecords.map(r => r.id));
    const localOnlyRecords = attendanceRecords.filter(r => !existingIds.has(r.id));
    
    setAttendanceRecords([...mergedRecords, ...localOnlyRecords]);
  };

  // Find existing record
  const existingRecord = attendanceRecords.find(
    (r) => r.batchId === selectedBatch && r.subject === selectedSubject && r.date === selectedDate
  );

  // Sync temp state with existing record or initialize new draft
  useEffect(() => {
    const batchStudents = students.filter((s) => s.batchId === selectedBatch);
    if (existingRecord) {
      const safeRecords = existingRecord.records || {};
      const safeRemarks = existingRecord.remarks || {};
      const recordsMap = {};
      const remarksMap = {};
      batchStudents.forEach((student) => {
        recordsMap[student.id] = safeRecords[student.id] || "present";
        remarksMap[student.id] = safeRemarks[student.id] || "";
      });
      setTempRecords(recordsMap);
      setTempRemarks(remarksMap);
      setOnlineClassFlag(existingRecord.onlineClass || false);
      setIsEditing(false);
    } else {
      // Default: new sheet with all students marked present
      const recordsMap = {};
      const remarksMap = {};
      batchStudents.forEach((student) => {
        recordsMap[student.id] = "present";
        remarksMap[student.id] = "";
      });
      setTempRecords(recordsMap);
      setTempRemarks(remarksMap);
      setOnlineClassFlag(false);
      setIsEditing(true); // Automatically in edit mode for new entries
    }
  }, [selectedBatch, selectedSubject, selectedDate, existingRecord, students]);


  const handleSaveAttendance = () => {
    const batchStudents = students.filter((s) => s.batchId === selectedBatch);
    const savedRecord = {
      id: existingRecord ? existingRecord.id : "a" + (attendanceRecords.length + 1),
      date: selectedDate,
      batchId: selectedBatch,
      subject: selectedSubject,
      teacherStatus: "Submitted",
      onlineClass: onlineClassFlag,
      records: { ...tempRecords },
      remarks: { ...tempRemarks }
    };

    let updatedRecords;
    if (existingRecord) {
      updatedRecords = attendanceRecords.map((r) => (r.id === existingRecord.id ? savedRecord : r));
    } else {
      updatedRecords = [savedRecord, ...attendanceRecords];
    }

    setAttendanceRecords(updatedRecords);
    setIsEditing(false);
    alert("Attendance sheet saved successfully!");
  };

  const getStats = () => {
    const values = Object.values(tempRecords);
    if (values.length === 0) return { present: 0, absent: 0, late: 0, rate: 0, total: 0 };
    
    const present = values.filter((v) => v === "present").length;
    const absent = values.filter((v) => v === "absent").length;
    const late = values.filter((v) => v === "late").length;
    const total = values.length;
    const rate = (((present + late) / total) * 100).toFixed(0);

    return { present, absent, late, rate, total };
  };

  const handleCorrectHistory = (record) => {
    setSelectedBatch(record.batchId);
    setSelectedSubject(record.subject);
    setSelectedDate(record.date);
    setActiveTab("register");
    setIsEditing(true);
  };

  const stats = getStats();
  
  // Filter registered students list based on searchStudentQuery
  const filteredStudents = students
    .filter((s) => s.batchId === selectedBatch)
    .filter((student) => student.name.toLowerCase().includes(searchStudentQuery.toLowerCase()));

  // Filter history records
  const filteredHistory = attendanceRecords.filter((record) => {
    const batch = batches.find((b) => b.id === record.batchId);
    const searchStr = `${batch?.name} ${record.subject} ${record.date} ${record.teacherStatus}`.toLowerCase();
    return searchStr.includes(searchHistoryQuery.toLowerCase());
  });

  return (
    <div className="attendance-container">
      {/* Tab Navigation header */}
      <div className="att-tab-header">
        <button 
          className={`att-tab-btn ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          <Edit size={16} /> Attendance Register
        </button>
        <button 
          className={`att-tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={16} /> Attendance History
        </button>
      </div>

      {activeTab === "register" ? (
        <>
          {/* Filters Bar */}
          <div className="att-filters-bar">
            <div className="att-filters-left">
              {/* Batch Selector */}
              <div className="att-filter-item">
                <Users size={15} />
                <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="att-filter-item">
                <BookOpen size={15} />
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                </select>
              </div>

              {/* Date Selector */}
              <div className="att-filter-item">
                <Calendar size={15} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            <div className="att-filters-right">
              {existingRecord && !isEditing && (
                <button className="att-edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit size={14} /> Correct Attendance
                </button>
              )}
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="att-stats-grid">
            <div className="att-stat-card bg-light-blue">
              <span className="att-stat-label">TOTAL STUDENTS</span>
              <h3 className="att-stat-value">{stats.total}</h3>
              <p className="att-stat-desc">Enrolled in batch</p>
            </div>
            <div className="att-stat-card bg-light-green">
              <span className="att-stat-label">PRESENT / LATE</span>
              <h3 className="att-stat-value text-green">{stats.present} <span className="att-stat-sub">Present</span> · {stats.late} <span className="att-stat-sub">Late</span></h3>
              <p className="att-stat-desc">Checked-in students</p>
            </div>
            <div className="att-stat-card bg-light-red">
              <span className="att-stat-label">ABSENT</span>
              <h3 className="att-stat-value text-red">{stats.absent}</h3>
              <p className="att-stat-desc">Unexcused leaves</p>
            </div>
            <div className="att-stat-card bg-lavender">
              <span className="att-stat-label">ATTENDANCE RATE</span>
              <h3 className="att-stat-value text-blue">{stats.rate}%</h3>
              <p className="att-stat-desc">Present & Late ratio</p>
            </div>
          </div>

          {/* Students Roll List */}
          <div className="att-sheet-card">
            <div className="att-sheet-header">
              <div className="att-sheet-title-info">
                <h3>Attendance Register</h3>
                <div className="att-sheet-meta-tags">
                  <span className={`att-status-badge ${existingRecord ? "badge-submitted" : "badge-pending"}`}>
                    {existingRecord ? "STATUS: SUBMITTED" : "STATUS: PENDING ENTRY"}
                  </span>
                  {onlineClassFlag && (
                    <span className="att-online-badge">
                      <Globe size={13} /> ONLINE SESSION
                    </span>
                  )}
                </div>
              </div>

              <div className="att-header-actions-group">
                {/* Search box inside Register */}
                <div className="att-search-student-box">
                  <Search size={14} className="att-search-student-icon" />
                  <input 
                    type="text" 
                    placeholder="Search students..." 
                    value={searchStudentQuery}
                    onChange={(e) => setSearchStudentQuery(e.target.value)}
                  />
                </div>

                {isEditing && (
                  <label className="att-online-checkbox-label">
                    <input
                      type="checkbox"
                      checked={onlineClassFlag}
                      onChange={(e) => setOnlineClassFlag(e.target.checked)}
                    />
                    Mark as Online Class
                  </label>
                )}
              </div>
            </div>

            <div className="att-sheet-table-wrapper">
              <table className="att-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Attendance Status</th>
                    <th>Remarks / Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="att-empty-row-text">
                        No students found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const status = tempRecords[student.id] || "present";
                      const remark = tempRemarks[student.id] || "";

                      return (
                        <tr key={student.id}>
                          <td className="att-col-roll">{student.rollNo}</td>
                          <td className="att-col-name">{student.name}</td>
                          <td className="att-col-status">
                            {isEditing ? (
                              <div className="att-status-buttons">
                                <button
                                  type="button"
                                  className={`status-btn btn-present ${status === "present" ? "active" : ""}`}
                                  onClick={() => setTempRecords({ ...tempRecords, [student.id]: "present" })}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  className={`status-btn btn-late ${status === "late" ? "active" : ""}`}
                                  onClick={() => setTempRecords({ ...tempRecords, [student.id]: "late" })}
                                >
                                  Late
                                </button>
                                <button
                                  type="button"
                                  className={`status-btn btn-absent ${status === "absent" ? "active" : ""}`}
                                  onClick={() => setTempRecords({ ...tempRecords, [student.id]: "absent" })}
                                >
                                  Absent
                                </button>
                              </div>
                            ) : (
                              <span className={`status-display status-${status}`}>
                                {status === "present" && <CheckCircle size={15} />}
                                {status === "late" && <AlertCircle size={15} />}
                                {status === "absent" && <XCircle size={15} />}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            )}
                          </td>
                          <td className="att-col-remarks">
                            {isEditing ? (
                              <input
                                type="text"
                                value={remark}
                                placeholder="Add attendance remarks (e.g. sick leave, late entry reason)"
                                className="att-remarks-input"
                                onChange={(e) => setTempRemarks({ ...tempRemarks, [student.id]: e.target.value })}
                              />
                            ) : (
                              <span className="att-remarks-text">{remark || "—"}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {isEditing && (
              <div className="att-sheet-footer">
                <button className="att-btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="att-btn-primary" onClick={handleSaveAttendance}>
                  <Save size={16} /> Submit Attendance
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History Tab View */
        <div className="att-sheet-card">
          <div className="att-sheet-header">
            <div className="att-sheet-title-info">
              <h3>Attendance Submission History</h3>
              <p>Search and correct submitted registers.</p>
            </div>
            
            <div className="att-search-student-box width-large">
              <Search size={14} className="att-search-student-icon" />
              <input 
                type="text" 
                placeholder="Search history by batch, subject, date, or status..." 
                value={searchHistoryQuery}
                onChange={(e) => setSearchHistoryQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="att-sheet-table-wrapper">
            {loadingLogs && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#2D6BFF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px'
                }}></div>
                Loading attendance records...
              </div>
            )}
            
            <table className="att-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Batch Name</th>
                  <th>Subject</th>
                  <th>Online Class</th>
                  <th>Attendance Rate</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="att-empty-row-text">
                      No historical records found. Submit an attendance sheet to see history!
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((record) => {
                    const batch = batches.find((b) => b.id === record.batchId);
                    
                    // Calculate Rate safely
                    const values = Object.values(record.records || {});
                    const presentCount = values.filter((v) => v === "present" || v === "late").length;
                    const rate = values.length > 0 ? ((presentCount / values.length) * 100).toFixed(0) + "%" : "N/A";

                    return (
                      <tr key={record.id}>
                        <td><strong>{new Date(record.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</strong></td>
                        <td>{batch?.name || "Unknown Batch"} ({batch?.grade || ""})</td>
                        <td>{record.subject}</td>
                        <td>
                          {record.onlineClass ? (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#ddd6fe',
                              color: '#6b21a8',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              <Globe size={12} /> Online
                            </span>
                          ) : (
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#e0f2fe',
                              color: '#075985',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              In-Person
                            </span>
                          )}
                        </td>
                        <td><strong>{rate}</strong></td>
                        <td>
                          <span className="att-status-badge badge-submitted">
                            {record.teacherStatus}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="att-history-action-btn"
                            onClick={() => handleCorrectHistory(record)}
                          >
                            Correct / Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
