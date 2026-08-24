import { useState, useEffect } from "react";
import { Search, Calendar, Filter, Check, X, Edit2, CheckCircle, XCircle, Users, Clock, TrendingUp, BarChart3, AlertCircle, Globe } from "lucide-react";
import supabase from "../../../lib/supabase";

const AttendanceTab = ({ 
  attendanceLogs, 
  students, 
  teachers, 
  subjects, 
  onUpdateAttendanceLog 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [filterType, setFilterType] = useState("All"); // "All", "Online", "In-Person"
  const [editingIndex, setEditingIndex] = useState(null);
  const [editStatus, setEditStatus] = useState("Present");
  const [dbAttendanceLogs, setDbAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add spinner animation style
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch attendance logs from database
  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          console.log(`📊 Admin: Fetched ${data.length} attendance logs from database`);
          setDbAttendanceLogs(data);
        }
      } catch (error) {
        console.error('Error fetching attendance logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceLogs();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('admin-attendance-logs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'attendance_logs'
      }, () => {
        fetchAttendanceLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Merge database logs with local logs
  // Merge database logs, local storage logs, and props logs
  let localLogsArr = [];
  try {
    const raw = localStorage.getItem("gw_attendance_logs_v3");
    if (raw) localLogsArr = JSON.parse(raw);
  } catch (e) {}

  const mergedLogsMap = new Map();
  [
    ...dbAttendanceLogs.map((log) => ({
      id: log.id,
      date: log.date,
      subject: log.subject || "General",
      student: log.student || "Student",
      teacher: log.teacher || "Faculty",
      status: log.status,
      isOnlineClass: log.is_online_class || false,
      classId: log.class_id,
      durationMinutes: log.duration_minutes,
    })),
    ...localLogsArr.map((log) => ({
      id: log.id,
      date: log.date,
      subject: log.subject || "General",
      student: log.student || "Student",
      teacher: log.teacher || "Faculty",
      status: log.status,
      isOnlineClass: log.is_online_class || log.isOnlineClass || false,
      classId: log.class_id || log.classId,
      durationMinutes: log.duration_minutes || log.durationMinutes,
    })),
    ...attendanceLogs,
  ].forEach((item) => {
    if (item && item.id) {
      mergedLogsMap.set(String(item.id), item);
    }
  });

  const allLogs = Array.from(mergedLogsMap.values());

  // Calculate statistics
  const totalLogs = allLogs.length;
  const presentCount = allLogs.filter(log => log.status === "Present").length;
  const absentCount = totalLogs - presentCount;
  const onlineClassCount = allLogs.filter(log => log.isOnlineClass).length;
  const averageRate = totalLogs > 0 ? Math.round((presentCount / totalLogs) * 100) : 100;
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (circumference * averageRate) / 100;

  const handleEditClick = (idx, currentStatus) => {
    setEditingIndex(idx);
    setEditStatus(currentStatus);
  };

  const handleSaveEdit = (log) => {
    const updatedLog = { ...log, status: editStatus };
    onUpdateAttendanceLog(updatedLog);
    setEditingIndex(null);
  };

  // Filter logs
  const filteredLogs = allLogs.filter(log => {
    const matchesSearch = 
      log.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "All" || log.subject === filterSubject;
    const matchesStatus = filterStatus === "All" || log.status === filterStatus;
    const matchesDate = !filterDate || log.date === filterDate || (filterDate === "Today" && log.date === "Today");
    const matchesType = filterType === "All" || 
                        (filterType === "Online" && log.isOnlineClass) ||
                        (filterType === "In-Person" && !log.isOnlineClass);
    return matchesSearch && matchesSubject && matchesStatus && matchesDate && matchesType;
  });

  // Per-student attendance for breakdown
  const studentBreakdown = students.map(s => {
    const logs = attendanceLogs.filter(l => l.student === s.name);
    const pres = logs.filter(l => l.status === "Present").length;
    const rate = logs.length > 0 ? Math.round((pres / logs.length) * 100) : 100;
    return { name: s.name, total: logs.length, present: pres, absent: logs.length - pres, rate };
  });

  return (
    <div className="tab-wrapper animate-fade-in">
      <div className="section-header-bar">
        <h2>Master Attendance Registry</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="badge-tag count" style={{ fontSize: "12px", padding: "4px 12px" }}>
            {totalLogs} Total Records
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid" style={{ marginBottom: "24px" }}>
        {/* Attendance Rate with Circular Progress */}
        <div className="summary-card" style={{ padding: "20px" }}>
          <div style={{ position: "relative", width: "64px", height: "64px", flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2D6BFF" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.8s ease" }} />
            </svg>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>{averageRate}%</span>
            </div>
          </div>
          <div className="card-info">
            <p>Attendance Rate</p>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Overall average</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper blue">
            <Calendar size={24} />
          </div>
          <div className="card-info">
            <h3>{totalLogs}</h3>
            <p>Total Sessions</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper green">
            <CheckCircle size={24} />
          </div>
          <div className="card-info">
            <h3>{presentCount}</h3>
            <p>Present Count</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper orange">
            <XCircle size={24} />
          </div>
          <div className="card-info">
            <h3>{absentCount}</h3>
            <p>Absent Count</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper purple" style={{ background: "#f3e8ff", color: "#9333ea" }}>
            <Globe size={24} />
          </div>
          <div className="card-info">
            <h3>{onlineClassCount}</h3>
            <p>Online Classes</p>
          </div>
        </div>
      </div>



      {/* Search & filters */}
      <div className="filters-panel">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search logs by Student or Teacher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-dropdowns">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
              <option value="All">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Absent">Absent Only</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Online">Online Classes</option>
              <option value="In-Person">In-Person</option>
            </select>
          </div>
          <div className="filter-group">
            <input 
              type="date" 
              className="date-filter-input"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Attendance Registry Table */}
      <div className="table-responsive-wrapper">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Class Date</th>
              <th>Course Subject</th>
              <th>Student Name</th>
              <th>Class Type</th>
              <th>Student Status</th>
              <th>Conducted Teacher</th>
              <th>Faculty Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      border: "4px solid #e2e8f0",
                      borderTopColor: "#2D6BFF",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>Loading attendance records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "48px 20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AlertCircle size={28} color="#94a3b8" />
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>No attendance records found</span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Try adjusting your filters or search query</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => {
                const isEditing = editingIndex === idx;
                return (
                  <tr key={log.id || idx} className="hover-row">
                    <td className="font-mono text-sm" style={{ fontWeight: 600 }}>{log.date}</td>
                    <td>
                      <span className="badge-tag subject">{log.subject}</span>
                    </td>
                    <td className="font-semibold">{log.student}</td>
                    <td>
                      {log.isOnlineClass ? (
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
                    <td>
                      {isEditing ? (
                        <select 
                          value={editStatus} 
                          onChange={(e) => setEditStatus(e.target.value)}
                          style={{ padding: "6px 12px", border: "2px solid #2D6BFF", borderRadius: "8px", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, outline: "none", background: "#fff" }}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      ) : (
                        <span className={`status-badge-pill ${log.status === "Present" ? "active" : "inactive"}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          {log.status === "Present" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {log.status}
                        </span>
                      )}
                    </td>
                    <td>{log.teacher}</td>
                    <td>
                      <span className="status-badge-pill active" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle size={12} />
                        Present
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell" style={{ justifyContent: "center" }}>
                        {isEditing ? (
                          <>
                            <button 
                              className="action-btn edit" 
                              title="Save Changes" 
                              onClick={() => handleSaveEdit(log)}
                              style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a" }}
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              className="action-btn delete" 
                              title="Cancel" 
                              onClick={() => setEditingIndex(null)}
                              style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#ef4444" }}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="action-btn edit" 
                            title="Edit Attendance Record" 
                            onClick={() => handleEditClick(idx, log.status)}
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTab;
