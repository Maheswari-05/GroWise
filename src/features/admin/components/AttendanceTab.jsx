import { useState } from "react";
import { Search, Calendar, Filter, Check, X, Edit2, CheckCircle, XCircle, Users, Clock, TrendingUp, BarChart3, AlertCircle } from "lucide-react";

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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editStatus, setEditStatus] = useState("Present");

  // Calculate statistics
  const totalLogs = attendanceLogs.length;
  const presentCount = attendanceLogs.filter(log => log.status === "Present").length;
  const absentCount = totalLogs - presentCount;
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
  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch = 
      log.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "All" || log.subject === filterSubject;
    const matchesStatus = filterStatus === "All" || log.status === filterStatus;
    const matchesDate = !filterDate || log.date === filterDate || (filterDate === "Today" && log.date === "Today");
    return matchesSearch && matchesSubject && matchesStatus && matchesDate;
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
              <th style={{ width: "40px" }}>#</th>
              <th>Class Date</th>
              <th>Course Subject</th>
              <th>Student Name</th>
              <th>Student Status</th>
              <th>Conducted Teacher</th>
              <th>Faculty Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
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
                  <tr key={idx} className="hover-row">
                    <td style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>{idx + 1}</td>
                    <td className="font-mono text-sm" style={{ fontWeight: 600 }}>{log.date}</td>
                    <td>
                      <span className="badge-tag subject">{log.subject}</span>
                    </td>
                    <td className="font-semibold">{log.student}</td>
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
