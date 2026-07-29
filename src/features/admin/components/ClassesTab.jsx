import { useState } from "react";
import { Search, Filter, Video, ArrowLeft, Calendar, Clock, BookOpen, Layers, User, GraduationCap, CheckCircle, AlertTriangle, Activity, Play, Monitor, ExternalLink } from "lucide-react";

const ClassesTab = ({ 
  onlineClasses, 
  subjects, 
  batches, 
  teachers 
}) => {
  const [view, setView] = useState("schedule");
  const [selectedClass, setSelectedClass] = useState(null);

  // Filters
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterTeacher, setFilterTeacher] = useState("All");
  const [filterBatch, setFilterBatch] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  const handleViewAttendance = (item) => {
    setSelectedClass(item);
    setView("attendance");
  };

  const handleJoinJitsi = (title) => {
    const meetName = title.replace(/\s+/g, "-").toLowerCase();
    const url = `https://meet.jit.si/growise-${meetName}`;
    window.open(url, "_blank");
  };

  // Stats
  const totalClasses = onlineClasses.length;
  const completedClasses = onlineClasses.filter(c => c.status === "Completed").length;
  const upcomingClasses = onlineClasses.filter(c => c.status === "Upcoming").length;
  const liveClasses = onlineClasses.filter(c => c.status === "Live Now").length;

  // Filter
  const filteredClasses = onlineClasses.filter(c => {
    const matchesSubject = filterSubject === "All" || c.subject === filterSubject;
    const matchesTeacher = filterTeacher === "All" || c.teacher === filterTeacher;
    const matchesBatch = filterBatch === "All" || (c.batchId && c.batchId === filterBatch);
    const matchesDate = !filterDate || c.date === filterDate;
    return matchesSubject && matchesTeacher && matchesBatch && matchesDate;
  });

  // Today's classes for highlight section
  const todayClasses = onlineClasses.filter(c => c.date === "Today" || c.status === "Live Now" || c.status === "Upcoming");

  return (
    <div className="tab-wrapper">
      {view === "schedule" && (
        <div className="animate-fade-in">
          <div className="section-header-bar">
            <h2>Online Classes Schedule</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <span className="badge-tag count" style={{ fontSize: "12px", padding: "4px 12px" }}>
                {totalClasses} Total Classes
              </span>
            </div>
          </div>

          {/* Summary Stats Cards */}
          <div className="summary-cards-grid" style={{ marginBottom: "24px" }}>
            <div className="summary-card">
              <div className="card-icon-wrapper blue">
                <Video size={24} />
              </div>
              <div className="card-info">
                <h3>{totalClasses}</h3>
                <p>Total Classes</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon-wrapper green">
                <CheckCircle size={24} />
              </div>
              <div className="card-info">
                <h3>{completedClasses}</h3>
                <p>Completed</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon-wrapper purple">
                <Clock size={24} />
              </div>
              <div className="card-info">
                <h3>{upcomingClasses}</h3>
                <p>Upcoming</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon-wrapper orange" style={{ position: "relative" }}>
                <Activity size={24} />
                {liveClasses > 0 && (
                  <span style={{ 
                    position: "absolute", top: "4px", right: "4px", width: "10px", height: "10px", 
                    borderRadius: "50%", background: "#ef4444", border: "2px solid #fff",
                    animation: "pulse 2s infinite"
                  }}></span>
                )}
              </div>
              <div className="card-info">
                <h3>{liveClasses}</h3>
                <p>Live Now</p>
              </div>
            </div>
          </div>

          {/* Today's Schedule Highlight */}
          {todayClasses.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontFamily: '"Sora", sans-serif', fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={16} style={{ color: "#2D6BFF" }} />
                Today's Schedule
              </h4>
              <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "8px" }}>
                {todayClasses.map(c => (
                  <div key={c.id} style={{ 
                    minWidth: "220px", background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: "14px", 
                    padding: "16px", flexShrink: 0, cursor: "pointer", transition: "all 0.2s",
                    borderTop: c.status === "Live Now" ? "3px solid #ef4444" : c.status === "Upcoming" ? "3px solid #2D6BFF" : "3px solid #37C871"
                  }}
                    onClick={() => handleViewAttendance(c)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontFamily: '"Fira Code", monospace', fontSize: "12px", fontWeight: 700, color: "#2D6BFF" }}>{c.time}</span>
                      <span className={`status-badge ${c.status === "Live Now" ? "live-now" : c.status === "Upcoming" ? "upcoming" : "completed"}`}
                        style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", padding: "2px 8px", borderRadius: "12px",
                          background: c.status === "Live Now" ? "#fef2f2" : c.status === "Upcoming" ? "#eff6ff" : "#f0fdf4",
                          color: c.status === "Live Now" ? "#ef4444" : c.status === "Upcoming" ? "#3b82f6" : "#16a34a",
                          display: "inline-flex", alignItems: "center", gap: "4px"
                        }}
                      >
                        {c.status === "Live Now" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }}></span>}
                        {c.status}
                      </span>
                    </div>
                    <span className="badge-tag subject" style={{ marginBottom: "6px", display: "inline-block" }}>{c.subject}</span>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#334155", marginTop: "4px" }}>{c.teacher}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters panel */}
          <div className="filters-panel">
            <div className="filter-dropdowns" style={{ width: "100%", justifyContent: "space-between" }}>
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
                <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
                  <option value="All">All Teachers</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}>
                  <option value="All">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
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

          {/* Schedule Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>#</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Batch</th>
                  <th>Teacher (1:1)</th>
                  <th>Student (1:1)</th>
                  <th>Meeting Link</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center", padding: "48px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Video size={28} color="#94a3b8" />
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>No online classes scheduled</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c, idx) => (
                    <tr key={c.id} className="hover-row">
                      <td style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>{idx + 1}</td>
                      <td className="font-mono" style={{ fontSize: "13px", fontWeight: 600 }}>{c.date}</td>
                      <td className="font-mono text-xs">{c.time}</td>
                      <td><span className="badge-tag subject">{c.subject}</span></td>
                      <td><span className="badge-tag batch">{c.batchId || "BAT101"}</span></td>
                      <td>{c.teacher}</td>
                      <td>{c.student || "Sneha"}</td>
                      <td>
                        {c.status === "Missed" ? (
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Expired</span>
                        ) : c.status === "Completed" ? (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Session ended</span>
                        ) : (
                          <button 
                            onClick={() => handleJoinJitsi(c.title)}
                            style={{ 
                              background: "linear-gradient(135deg, #2D6BFF, #37C871)", color: "#fff", border: "none",
                              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px",
                              transition: "all 0.2s", boxShadow: "0 2px 8px rgba(45, 107, 255, 0.2)"
                            }}
                          >
                            <Play size={12} />
                            Join Meet
                          </button>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge-pill ${c.status === "Completed" ? "active" : c.status === "Live Now" ? "live" : c.status === "Upcoming" ? "pending" : "inactive"}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          {c.status === "Live Now" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }}></span>}
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell" style={{ justifyContent: "center" }}>
                          <button 
                            className="action-btn view" 
                            title="View Attendance Details" 
                            onClick={() => handleViewAttendance(c)}
                          >
                            <CheckCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "attendance" && selectedClass && (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="profile-header-strip">
            <button className="back-link-btn" onClick={() => setView("schedule")}>
              <ArrowLeft size={16} />
              <span>Back to Schedule</span>
            </button>
            <span className="font-mono text-xs text-muted">Session ID: CLS00{selectedClass.id}</span>
          </div>

          {/* Session Info Card */}
          <div style={{ 
            background: "linear-gradient(135deg, rgba(45, 107, 255, 0.04), rgba(55, 200, 113, 0.04))", 
            borderRadius: "20px", padding: "24px", border: "1.5px solid #f1f5f9", marginBottom: "24px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span className="badge-tag subject">{selectedClass.subject}</span>
              <span className="badge-tag batch">Batch: {selectedClass.batchId || "BAT101"}</span>
              <span className={`status-badge-pill ${selectedClass.status === "Completed" ? "active" : selectedClass.status === "Live Now" ? "live" : "pending"}`}>
                {selectedClass.status}
              </span>
            </div>
            <h2 style={{ fontFamily: '"Sora", sans-serif', fontSize: "22px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              {selectedClass.title} - Session Log
            </h2>
            <p style={{ color: "#64748b", fontSize: "14px" }}>{selectedClass.description || "1-on-1 online revision interactive lecture."}</p>
          </div>

          {/* Time & Reference Grid */}
          <div style={{ 
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" 
          }}>
            {[
              { label: "Date", value: selectedClass.date, icon: <Calendar size={16} /> },
              { label: "Start Time", value: selectedClass.time.split(" - ")[0], icon: <Clock size={16} /> },
              { label: "End Time", value: selectedClass.time.split(" - ")[1], icon: <Clock size={16} /> },
              { label: "Status", value: selectedClass.status, icon: <Activity size={16} /> }
            ].map((item, i) => (
              <div key={i} style={{ background: "#f8fafc", border: "1.5px solid #f1f5f9", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                <div style={{ color: "#94a3b8", marginBottom: "8px", display: "flex", justifyContent: "center" }}>{item.icon}</div>
                <span style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase" }}>{item.label}</span>
                <span style={{ fontFamily: '"Fira Code", monospace', fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Attendance Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Teacher */}
            <div className="profile-details-card">
              <div className="card-heading">
                <GraduationCap size={18} style={{ color: "#37C871" }} />
                <h3>Teacher Attendance</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", gap: "16px" }}>
                <div style={{ 
                  width: "64px", height: "64px", borderRadius: "50%", 
                  background: "linear-gradient(135deg, rgba(55, 200, 113, 0.1), rgba(55, 200, 113, 0.2))",
                  border: "2px solid #37C871", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: '"Sora", sans-serif', fontSize: "24px", fontWeight: 800, color: "#37C871"
                }}>
                  {selectedClass.teacher.charAt(0)}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>{selectedClass.teacher}</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Instructor Faculty</span>
                </div>
                {selectedClass.status === "Missed" ? (
                  <span className="status-badge-pill inactive" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px" }}>
                    <AlertTriangle size={14} />
                    Absent / Cancelled
                  </span>
                ) : (
                  <span className="status-badge-pill active" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px" }}>
                    <CheckCircle size={14} />
                    Present
                  </span>
                )}
              </div>
            </div>

            {/* Student */}
            <div className="profile-details-card">
              <div className="card-heading">
                <User size={18} style={{ color: "#2D6BFF" }} />
                <h3>Student Attendance</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", gap: "16px" }}>
                <div style={{ 
                  width: "64px", height: "64px", borderRadius: "50%", 
                  background: "linear-gradient(135deg, rgba(45, 107, 255, 0.1), rgba(45, 107, 255, 0.2))",
                  border: "2px solid #2D6BFF", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: '"Sora", sans-serif', fontSize: "24px", fontWeight: 800, color: "#2D6BFF"
                }}>
                  {(selectedClass.student || "S").charAt(0)}
                </div>
                <div style={{ textAlign: "center" }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: "16px", color: "#0f172a" }}>{selectedClass.student || "Sneha"}</span>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Enrolled Student (1:1)</span>
                </div>
                {selectedClass.status === "Missed" ? (
                  <span className="status-badge-pill inactive" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px" }}>
                    <AlertTriangle size={14} />
                    Absent / Missed
                  </span>
                ) : selectedClass.status === "Upcoming" ? (
                  <span className="status-badge-pill pending" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px" }}>
                    <Clock size={14} />
                    Pending Class
                  </span>
                ) : (
                  <span className="status-badge-pill active" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "13px" }}>
                    <CheckCircle size={14} />
                    Present
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Session Timeline */}
          <div className="profile-details-card" style={{ marginTop: "24px" }}>
            <div className="card-heading">
              <Clock size={18} style={{ color: "#2D6BFF" }} />
              <h3>Session Timeline</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", position: "relative" }}>
              <div style={{ position: "absolute", top: "50%", left: "80px", right: "80px", height: "3px", background: "#e2e8f0", borderRadius: "2px" }}></div>
              <div style={{ position: "absolute", top: "50%", left: "80px", height: "3px", borderRadius: "2px",
                width: selectedClass.status === "Completed" ? "calc(100% - 160px)" : selectedClass.status === "Live Now" ? "calc(50% - 80px)" : "0",
                background: "linear-gradient(90deg, #2D6BFF, #37C871)", transition: "width 0.6s ease"
              }}></div>
              {[
                { label: "Session Start", time: selectedClass.time.split(" - ")[0], done: selectedClass.status !== "Upcoming" },
                { label: "In Progress", time: "Active", done: selectedClass.status === "Completed" || selectedClass.status === "Live Now" },
                { label: "Session End", time: selectedClass.time.split(" - ")[1], done: selectedClass.status === "Completed" }
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 2, position: "relative" }}>
                  <div style={{ 
                    width: "24px", height: "24px", borderRadius: "50%",
                    background: step.done ? "linear-gradient(135deg, #2D6BFF, #37C871)" : "#e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "3px solid #fff", boxShadow: "0 0 0 2px " + (step.done ? "#2D6BFF" : "#e2e8f0")
                  }}>
                    {step.done && <CheckCircle size={12} color="#fff" />}
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: step.done ? "#0f172a" : "#94a3b8" }}>{step.label}</span>
                  <span style={{ fontFamily: '"Fira Code", monospace', fontSize: "11px", color: "#64748b" }}>{step.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default ClassesTab;
