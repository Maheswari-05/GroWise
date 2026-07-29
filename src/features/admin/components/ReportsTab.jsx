import { useState } from "react";
import { Search, Filter, FileText, Download, TrendingUp, BarChart3, Users, Award, Calendar, CheckSquare, CalendarCheck, ClipboardCheck, Activity } from "lucide-react";

const ReportsTab = ({ 
  students, 
  teachers, 
  subjects, 
  batches, 
  attendanceLogs, 
  assignments, 
  weeklyTests 
}) => {
  const [reportType, setReportType] = useState("Attendance");
  
  // Filters
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-07-31");
  const [filterBatch, setFilterBatch] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [selectedStudentName, setSelectedStudentName] = useState(students[0]?.name || "");

  // Export State
  const [isExporting, setIsExporting] = useState(null);

  const handleExport = (type) => {
    setIsExporting(type);
    setTimeout(() => {
      setIsExporting(null);
      alert(`Successfully generated and downloaded ${reportType}_Report.${type === "pdf" ? "pdf" : "xlsx"}`);
    }, 1500);
  };

  const reportTypes = [
    { key: "Attendance", label: "Attendance Report", desc: "Track presence rates", icon: <CalendarCheck size={20} />, color: "#2D6BFF" },
    { key: "Assignments", label: "Assignments", desc: "Submission analysis", icon: <ClipboardCheck size={20} />, color: "#37C871" },
    { key: "Tests", label: "Weekly Tests", desc: "Score breakdowns", icon: <Award size={20} />, color: "#8b5cf6" },
    { key: "Performance", label: "Performance", desc: "Student drill-down", icon: <TrendingUp size={20} />, color: "#f97316" }
  ];

  return (
    <div className="tab-wrapper animate-fade-in">
      <div className="section-header-bar">
        <h2>Reports Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 16px" }}
            disabled={isExporting !== null}
            onClick={() => handleExport("excel")}
          >
            <Download size={14} />
            <span>{isExporting === "excel" ? "Generating..." : "Export Excel"}</span>
          </button>
          <button 
            className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "8px 16px" }}
            disabled={isExporting !== null}
            onClick={() => handleExport("pdf")}
          >
            <FileText size={14} />
            <span>{isExporting === "pdf" ? "Compiling..." : "Export PDF"}</span>
          </button>
        </div>
      </div>

      {/* Report Type Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {reportTypes.map(rt => (
          <div key={rt.key} onClick={() => setReportType(rt.key)}
            style={{ 
              background: reportType === rt.key ? "linear-gradient(135deg, rgba(45, 107, 255, 0.04), rgba(55, 200, 113, 0.04))" : "#fff",
              border: reportType === rt.key ? "2px solid #2D6BFF" : "1.5px solid #f1f5f9",
              borderRadius: "14px", padding: "20px", cursor: "pointer", transition: "all 0.25s",
              boxShadow: reportType === rt.key ? "0 4px 12px rgba(45, 107, 255, 0.1)" : "none"
            }}
          >
            <div style={{ 
              width: "42px", height: "42px", borderRadius: "10px", 
              background: `${rt.color}12`, display: "flex", alignItems: "center", justifyContent: "center",
              color: rt.color, marginBottom: "12px"
            }}>
              {rt.icon}
            </div>
            <h4 style={{ fontFamily: '"Sora", sans-serif', fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{rt.label}</h4>
            <p style={{ fontSize: "12px", color: "#64748b" }}>{rt.desc}</p>
          </div>
        ))}
      </div>

      {/* Config Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1.5px solid #f1f5f9", marginBottom: "24px" }}>
        <div className="form-control">
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: "10px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontFamily: "inherit", fontSize: "13px", background: "#fff" }} />
        </div>
        <div className="form-control">
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: "10px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontFamily: "inherit", fontSize: "13px", background: "#fff" }} />
        </div>
        <div className="form-control">
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Subject</label>
          <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} style={{ padding: "10px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontFamily: "inherit", fontSize: "13px", background: "#fff" }}>
            <option value="All">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-control">
          <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Batch</label>
          <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)} style={{ padding: "10px", border: "1.5px solid #cbd5e1", borderRadius: "8px", fontFamily: "inherit", fontSize: "13px", background: "#fff" }}>
            <option value="All">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* ==================== 1. ATTENDANCE REPORT ==================== */}
      {reportType === "Attendance" && (
        <div className="animate-fade-in">
          {/* Trend Chart */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1.5px solid #f1f5f9", marginBottom: "24px" }}>
            <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: "15px", color: "#0f172a", marginBottom: "4px" }}>Attendance Percentage Monthly Trends</h3>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "20px" }}>Averaged logs showing student/teacher attendance trends</p>
            <svg width="100%" height="180" viewBox="0 0 500 180">
              {/* Gradient fill area */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D6BFF" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2D6BFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid */}
              {[30, 70, 110, 150].map(y => (
                <line key={y} x1="50" y1={y} x2="460" y2={y} stroke="#f1f5f9" strokeWidth="1" />
              ))}
              {/* Area fill */}
              <polygon fill="url(#areaGrad)" points="50,130 130,100 210,70 290,50 370,60 450,35 450,150 50,150" />
              {/* Line */}
              <polyline fill="none" stroke="#2D6BFF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"
                points="50,130 130,100 210,70 290,50 370,60 450,35" />
              {/* Data points */}
              {[[50,130,"65%"],[130,100,"75%"],[210,70,"85%"],[290,50,"90%"],[370,60,"88%"],[450,35,"95%"]].map(([x,y,label], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2D6BFF" strokeWidth="3">
                    <title>{label}</title>
                  </circle>
                </g>
              ))}
              {/* Y Labels */}
              <text x="12" y="34" fontSize="10" fill="#94a3b8">100%</text>
              <text x="18" y="74" fontSize="10" fill="#94a3b8">75%</text>
              <text x="18" y="114" fontSize="10" fill="#94a3b8">50%</text>
              <text x="18" y="154" fontSize="10" fill="#94a3b8">25%</text>
              {/* X Labels */}
              {[["50","Feb"],["130","Mar"],["210","Apr"],["290","May"],["370","Jun"],["450","Jul"]].map(([x,m]) => (
                <text key={m} x={x} y="172" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">{m}</text>
              ))}
            </svg>
          </div>

          <div className="profile-details-panels">
            {/* Student Summary */}
            <div className="profile-details-card">
              <div className="card-heading">
                <Users size={18} style={{ color: "#2D6BFF" }} />
                <h3>Student Attendance Summary</h3>
              </div>
              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Sessions</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const logs = attendanceLogs.filter(l => l.student === s.name);
                      const pres = logs.filter(l => l.status === "Present").length;
                      const abs = logs.length - pres;
                      const rate = logs.length > 0 ? Math.round((pres / logs.length) * 100) : 100;
                      return (
                        <tr key={s.id}>
                          <td className="font-semibold">{s.name}</td>
                          <td className="font-mono" style={{ fontSize: "13px" }}>{logs.length}</td>
                          <td style={{ color: "#16a34a", fontWeight: 700, fontFamily: '"Fira Code", monospace', fontSize: "13px" }}>{pres}</td>
                          <td style={{ color: "#ef4444", fontWeight: 700, fontFamily: '"Fira Code", monospace', fontSize: "13px" }}>{abs}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "40px", height: "40px", position: "relative" }}>
                                <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: "rotate(-90deg)" }}>
                                  <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                                  <circle cx="20" cy="20" r="16" fill="none" stroke={rate >= 80 ? "#37C871" : rate >= 60 ? "#f97316" : "#ef4444"} strokeWidth="4" strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 16} strokeDashoffset={2 * Math.PI * 16 * (1 - rate / 100)} />
                                </svg>
                              </div>
                              <span style={{ fontWeight: 800, color: "#2D6BFF", fontFamily: '"Fira Code", monospace', fontSize: "13px" }}>{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher Summary */}
            <div className="profile-details-card">
              <div className="card-heading">
                <Award size={18} style={{ color: "#37C871" }} />
                <h3>Teacher Attendance Log</h3>
              </div>
              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Teacher</th>
                      <th>Classes</th>
                      <th>Status</th>
                      <th>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map(t => {
                      const logs = attendanceLogs.filter(l => l.teacher === t.name);
                      return (
                        <tr key={t.id}>
                          <td className="font-semibold">{t.name}</td>
                          <td className="font-mono" style={{ fontSize: "13px" }}>{logs.length}</td>
                          <td><span className="status-badge-pill active">Present</span></td>
                          <td style={{ fontWeight: 800, color: "#37C871", fontFamily: '"Fira Code", monospace' }}>100%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. ASSIGNMENTS REPORT ==================== */}
      {reportType === "Assignments" && (
        <div className="animate-fade-in">
          {/* Stacked Bar */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1.5px solid #f1f5f9", marginBottom: "24px" }}>
            <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: "15px", color: "#0f172a", marginBottom: "16px" }}>Submission Breakdown Status</h3>
            <div className="stacked-progress-track" style={{ height: "28px", borderRadius: "14px" }}>
              <div className="stacked-fill evaluated" style={{ width: "60%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "10px", color: "#fff", fontWeight: 800 }}>Evaluated 60%</span>
              </div>
              <div className="stacked-fill submitted" style={{ width: "25%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "10px", color: "#fff", fontWeight: 800 }}>Submitted 25%</span>
              </div>
              <div className="stacked-fill pending" style={{ width: "15%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "10px", color: "#fff", fontWeight: 800 }}>15%</span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "14px" }}>
              <span className="legend-item"><span className="legend-dot green"></span> Evaluated: 60%</span>
              <span className="legend-item"><span className="legend-dot blue"></span> Submitted: 25%</span>
              <span className="legend-item"><span className="legend-dot orange"></span> Pending: 15%</span>
            </div>
          </div>

          {/* Subject progress bars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
            {subjects.map(sub => {
              const subAss = assignments.filter(a => a.subject === sub.name);
              const evalCount = subAss.filter(a => a.status === "Evaluated").length;
              const subCount = subAss.filter(a => a.status === "Submitted").length;
              const total = subAss.length;
              const rate = total > 0 ? Math.round(((evalCount + subCount) / total) * 100) : 100;
              return (
                <div key={sub.id} style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1.5px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>{sub.name}</span>
                    <span style={{ fontWeight: 800, fontSize: "13px", color: rate >= 80 ? "#37C871" : "#f97316" }}>{rate}%</span>
                  </div>
                  <div className="stats-bar-track">
                    <div className="stats-bar-fill" style={{ width: `${rate}%`, background: rate >= 80 ? "#37C871" : rate >= 60 ? "#f97316" : "#ef4444" }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginTop: "6px" }}>
                    <span>{evalCount} evaluated</span>
                    <span>{subCount} submitted</span>
                    <span>{total - evalCount - subCount} pending</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Table */}
          <div className="profile-details-card">
            <div className="card-heading">
              <CheckSquare size={18} style={{ color: "#2D6BFF" }} />
              <h3>Assignment Statistics by Subject</h3>
            </div>
            <div className="table-responsive-wrapper">
              <table className="profile-subtable">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Total</th>
                    <th>Evaluated</th>
                    <th>Submitted</th>
                    <th>Pending</th>
                    <th>Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(sub => {
                    const subAss = assignments.filter(a => a.subject === sub.name);
                    const evalCount = subAss.filter(a => a.status === "Evaluated").length;
                    const subCount = subAss.filter(a => a.status === "Submitted").length;
                    const pendCount = subAss.filter(a => a.status === "Pending").length;
                    const total = subAss.length;
                    const rate = total > 0 ? Math.round(((evalCount + subCount) / total) * 100) : 100;
                    return (
                      <tr key={sub.id}>
                        <td className="font-semibold">{sub.name}</td>
                        <td className="font-mono" style={{ fontSize: "13px" }}>{total}</td>
                        <td style={{ color: "#16a34a", fontWeight: 700 }}>{evalCount}</td>
                        <td style={{ color: "#2D6BFF", fontWeight: 700 }}>{subCount}</td>
                        <td style={{ color: "#f97316", fontWeight: 700 }}>{pendCount}</td>
                        <td style={{ fontWeight: 800, color: rate >= 80 ? "#37C871" : "#f97316" }}>{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. WEEKLY TEST REPORT ==================== */}
      {reportType === "Tests" && (
        <div className="animate-fade-in">
          {/* Bar Chart */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", border: "1.5px solid #f1f5f9", marginBottom: "24px" }}>
            <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: "15px", color: "#0f172a", marginBottom: "20px" }}>Subject-wise Weekly Test Averages</h3>
            <svg width="100%" height="180" viewBox="0 0 500 180">
              <defs>
                <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2D6BFF" /><stop offset="100%" stopColor="#2D6BFF" stopOpacity="0.6" /></linearGradient>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#37C871" /><stop offset="100%" stopColor="#37C871" stopOpacity="0.6" /></linearGradient>
                <linearGradient id="barGrad3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF9F43" /><stop offset="100%" stopColor="#FF9F43" stopOpacity="0.6" /></linearGradient>
              </defs>
              {[30, 70, 110].map(y => <line key={y} x1="50" y1={y} x2="450" y2={y} stroke="#f1f5f9" strokeWidth="1" />)}
              <line x1="50" y1="140" x2="450" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Bars */}
              <rect x="90" y="40" width="50" height="100" fill="url(#barGrad1)" rx="8" />
              <text x="115" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2D6BFF">90%</text>
              <rect x="225" y="50" width="50" height="90" fill="url(#barGrad2)" rx="8" />
              <text x="250" y="44" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#37C871">80%</text>
              <rect x="360" y="70" width="50" height="70" fill="url(#barGrad3)" rx="8" />
              <text x="385" y="64" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#FF9F43">65%</text>
              {/* Average line */}
              <line x1="50" y1="55" x2="450" y2="55" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="460" y="59" fontSize="9" fill="#ef4444" fontWeight="700">Avg: 78%</text>
              {/* X Labels */}
              <text x="115" y="158" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">Mathematics</text>
              <text x="250" y="158" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">Physics</text>
              <text x="385" y="158" textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a">Chemistry</text>
            </svg>
          </div>

          {/* Test Summary Table */}
          <div className="profile-details-card">
            <div className="card-heading">
              <Award size={18} style={{ color: "#8b5cf6" }} />
              <h3>Weekly Test Summary Scores</h3>
            </div>
            <div className="table-responsive-wrapper">
              <table className="profile-subtable">
                <thead>
                  <tr>
                    <th>Test Title</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Teacher</th>
                    <th>Average</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyTests.map(t => {
                    const avgStr = t.status === "Published" ? `${t.percent}%` : "Pending";
                    const scoreColor = t.status === "Published" ? (t.percent >= 80 ? "#37C871" : t.percent >= 60 ? "#f97316" : "#ef4444") : "#94a3b8";
                    return (
                      <tr key={t.id}>
                        <td className="font-semibold">{t.title}</td>
                        <td><span className="badge-tag subject">{t.subject}</span></td>
                        <td className="font-mono" style={{ fontSize: "13px" }}>{t.date}</td>
                        <td>{t.teacher}</td>
                        <td style={{ fontWeight: 800, color: scoreColor, fontFamily: '"Fira Code", monospace' }}>{avgStr}</td>
                        <td>
                          <span className={`status-badge-pill ${t.status === "Published" ? "active" : "pending"}`}>{t.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. PERFORMANCE REPORT ==================== */}
      {reportType === "Performance" && (
        <div className="animate-fade-in">
          {/* Student Selector */}
          <div style={{ background: "linear-gradient(135deg, rgba(45, 107, 255, 0.04), rgba(55, 200, 113, 0.04))", padding: "24px", borderRadius: "16px", border: "1.5px solid #f1f5f9", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Users size={18} style={{ color: "#2D6BFF" }} />
              <h3 style={{ fontFamily: '"Sora", sans-serif', fontSize: "15px", color: "#0f172a" }}>Student Performance Drill-Down</h3>
            </div>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <select value={selectedStudentName} onChange={(e) => setSelectedStudentName(e.target.value)}
                style={{ flex: 1, padding: "12px", border: "1.5px solid #cbd5e1", borderRadius: "10px", fontFamily: "inherit", fontSize: "14px", fontWeight: 600, background: "#fff" }}
              >
                {students.map(s => <option key={s.id} value={s.name}>{s.name} ({s.id})</option>)}
              </select>
              <div style={{ 
                width: "48px", height: "48px", borderRadius: "50%", 
                background: "linear-gradient(135deg, #2D6BFF, #37C871)", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: "20px", fontFamily: '"Sora", sans-serif'
              }}>
                {selectedStudentName.charAt(0)}
              </div>
            </div>
          </div>

          <div className="profile-details-panels">
            {/* Subject Scores */}
            <div className="profile-details-card">
              <div className="card-heading">
                <Award size={18} style={{ color: "#2D6BFF" }} />
                <h3>{selectedStudentName}'s Subject Scores</h3>
              </div>
              <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: "16px" }}>
                {subjects.map((sub, idx) => {
                  const studentObj = students.find(s => s.name === selectedStudentName);
                  const isEnrolled = studentObj?.subjects?.includes(sub.name);
                  const score = isEnrolled ? (sub.name === "Mathematics" ? 90 : sub.name === "Physics" ? 80 : 70) : 0;
                  const colors = ["#2D6BFF", "#37C871", "#8b5cf6"];
                  return (
                    <div key={sub.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontWeight: 700, fontSize: "13px", color: "#0f172a" }}>{sub.name}</span>
                        {isEnrolled ? (
                          <span style={{ fontWeight: 800, fontSize: "13px", color: colors[idx % 3] }}>{score}%</span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Not Enrolled</span>
                        )}
                      </div>
                      {isEnrolled && (
                        <div className="stats-bar-track" style={{ height: "8px" }}>
                          <div className="stats-bar-fill" style={{ 
                            width: `${score}%`, height: "100%", borderRadius: "4px",
                            background: `linear-gradient(90deg, ${colors[idx % 3]}, ${colors[idx % 3]}88)`,
                            transition: "width 0.6s ease"
                          }}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Academic Standing */}
            <div className="profile-details-card">
              <div className="card-heading">
                <TrendingUp size={18} style={{ color: "#37C871" }} />
                <h3>Academic Standing Overview</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "16px 0" }}>
                {[
                  { label: "GPA Standing", value: "A- Equivalent", color: "#2D6BFF", pct: 85 },
                  { label: "Assignment Rate", value: "92% submitted", color: "#37C871", pct: 92 },
                  { label: "Test Attendance", value: "100% Attended", color: "#8b5cf6", pct: 100 }
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ position: "relative", width: "52px", height: "52px", flexShrink: 0 }}>
                      <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="26" cy="26" r="20" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                        <circle cx="26" cy="26" r="20" fill="none" stroke={item.color} strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 20} strokeDashoffset={2 * Math.PI * 20 * (1 - item.pct / 100)} />
                      </svg>
                      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, color: item.color }}>{item.pct}%</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{item.label}</span>
                      <span style={{ display: "block", fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
