import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  CalendarCheck,
  Eye,
  GraduationCap,
} from "lucide-react";
import StudentProfile from "./StudentProfile";
import AvatarPlaceholder from "./AvatarPlaceholder";
import "./MyBatches.css";

const subjectFilters = ["All Subjects", "Mathematics", "Science", "Physics", "Chemistry"];

const batchColorMap = {
  blue:   { bg: "rgba(45,107,255,0.08)",  border: "rgba(45,107,255,0.18)", text: "#2D6BFF",  activeBg: "rgba(45,107,255,0.13)"  },
  green:  { bg: "rgba(55,200,113,0.08)",  border: "rgba(55,200,113,0.20)", text: "#27a55e",  activeBg: "rgba(55,200,113,0.14)"  },
  purple: { bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.18)", text: "#7c3aed",  activeBg: "rgba(139,92,246,0.13)"  },
};

const attendanceColor = (pct) =>
  pct >= 90 ? "#27a55e" : pct >= 75 ? "#2D6BFF" : "#ea580c";

const matchStudentBatch = (student, batch) => {
  if (!student || !batch) return false;
  const sBatchId = String(student.batchId || student.batch_id || "").trim().toLowerCase();
  const sBatchName = String(student.batch || student.batchName || "").trim().toLowerCase();
  const bId = String(batch.id || "").trim().toLowerCase();
  const bName = String(batch.name || "").trim().toLowerCase();

  if (!sBatchId && !sBatchName) return true;
  return (
    (bId && sBatchId === bId) ||
    (bName && sBatchName === bName) ||
    (bId && sBatchName === bId) ||
    (bName && sBatchId === bName)
  );
};

const getAttendancePct = (s) => {
  if (typeof s?.attendancePercent === "number" && !isNaN(s.attendancePercent)) return s.attendancePercent;
  if (typeof s?.attendance_percent === "number" && !isNaN(s.attendance_percent)) return s.attendance_percent;
  return 100;
};

const getAvgScore = (s) => {
  if (typeof s?.avgScore === "number" && !isNaN(s.avgScore)) return s.avgScore;
  if (typeof s?.avg_score === "number" && !isNaN(s.avg_score)) return s.avg_score;
  return 85;
};

const getRollNo = (s) => {
  return s?.rollNo || s?.roll_no || s?.id || "N/A";
};

const MyBatches = ({ batches: propBatches = [], students: propStudents = [] }) => {
  const batches = Array.isArray(propBatches) ? propBatches : [];
  const students = Array.isArray(propStudents) ? propStudents : [];

  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id || batches[0]?.name || "");
  const [selectedStudent, setSelectedStudent]  = useState(null);
  const [search,          setSearch]           = useState("");
  const [subjectFilter,   setSubjectFilter]    = useState("All Subjects");
  const [filterOpen,      setFilterOpen]       = useState(false);

  // Keep selectedBatchId valid when batches list updates
  const effectiveBatchId = selectedBatchId || batches[0]?.id || batches[0]?.name || "";
  const selectedBatch = useMemo(() => {
    if (!batches.length) return null;
    return batches.find((b) => String(b.id) === String(effectiveBatchId) || String(b.name) === String(effectiveBatchId)) || batches[0];
  }, [batches, effectiveBatchId]);

  /* Batch students */
  const batchStudents = useMemo(() => {
    if (!selectedBatch) return students;
    return students.filter((s) => matchStudentBatch(s, selectedBatch));
  }, [students, selectedBatch]);

  /* Filtered students for search */
  const filteredStudents = useMemo(() => {
    let list = batchStudents;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (getRollNo(s) && getRollNo(s).toLowerCase().includes(q))
      );
    }
    return list;
  }, [batchStudents, search]);

  /* Batch stats */
  const activeCount = useMemo(() => {
    return batchStudents.filter((s) => {
      const st = String(s.status || "Active").toLowerCase();
      return st === "active";
    }).length;
  }, [batchStudents]);

  const avgAttendance = useMemo(() => {
    if (!batchStudents.length) return 0;
    const total = batchStudents.reduce((acc, s) => acc + getAttendancePct(s), 0);
    return Math.round(total / batchStudents.length);
  }, [batchStudents]);

  const avgScore = useMemo(() => {
    if (!batchStudents.length) return 0;
    const total = batchStudents.reduce((acc, s) => acc + getAvgScore(s), 0);
    return Math.round(total / batchStudents.length);
  }, [batchStudents]);

  return (
    <div className="mb-page">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="mb-page-header">
        <div>
          <h1 className="mb-page-title">My Batches & Students</h1>
          <p className="mb-page-sub">
            {batches.length} batches · {students.length} students enrolled
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-controls">
          <div className="mb-search-wrap">
            <Search size={16} className="mb-search-icon" />
            <input
              className="mb-search-input"
              placeholder="Search student or roll no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mb-filter-wrap">
            <button
              className={`mb-filter-btn ${filterOpen ? "open" : ""}`}
              onClick={() => setFilterOpen((v) => !v)}
            >
              <Filter size={15} /> Filter
            </button>
            {filterOpen && (
              <div className="mb-filter-dropdown">
                <p className="mb-filter-label">Subject</p>
                {subjectFilters.map((f) => (
                  <button
                    key={f}
                    className={`mb-filter-option ${subjectFilter === f ? "active" : ""}`}
                    onClick={() => { setSubjectFilter(f); setFilterOpen(false); }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {batches.length === 0 ? (
        <div className="mb-empty-state" style={{ padding: "60px 24px", textAlign: "center", background: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
          <GraduationCap size={42} style={{ color: "#94a3b8", marginBottom: "12px" }} />
          <h2 style={{ fontSize: "18px", color: "#0f172a", fontWeight: 700, margin: "0 0 6px" }}>No Batches Found</h2>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>There are no assigned batches or enrolled students yet.</p>
        </div>
      ) : (
        /* ── Main Grid ───────────────────────────────────────── */
        <div className="mb-grid">

          {/* ── Left: Batch List ──────────────────────────────── */}
          <aside className="mb-batch-list">
            <p className="mb-section-label">Batches</p>
            {batches.map((batch) => {
              const c      = batchColorMap[batch.color] || batchColorMap.blue;
              const active = selectedBatch && (batch.id === selectedBatch.id || batch.name === selectedBatch.name);
              const count  = students.filter((s) => matchStudentBatch(s, batch)).length;
              return (
                <button
                  key={batch.id || batch.name}
                  className={`mb-batch-card ${active ? "active" : ""}`}
                  style={active ? { background: c.activeBg, borderColor: c.border } : {}}
                  onClick={() => { setSelectedBatchId(batch.id || batch.name); setSearch(""); }}
                >
                  <div className="mb-batch-icon" style={{ background: c.bg, color: c.text }}>
                    <GraduationCap size={18} />
                  </div>
                  <div className="mb-batch-info">
                    <p className="mb-batch-name">{batch.name}</p>
                    <p className="mb-batch-subject" style={{ color: c.text }}>{batch.subject || "General"}</p>
                    <p className="mb-batch-grade">{batch.grade || "All Grades"}</p>
                  </div>
                  <div className="mb-batch-right">
                    <span className="mb-batch-count">
                      <Users size={12} /> {count}
                    </span>
                    {active && <ChevronRight size={16} style={{ color: c.text }} />}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* ── Right: Students Panel ────────────────────────── */}
          <div className="mb-students-panel">

            {/* Batch Stats Bar */}
            {selectedBatch && (
              <div className="mb-stats-bar">
                <div className="mb-stats-bar-left">
                  <span className="mb-stats-batch-name">{selectedBatch.name}</span>
                  <span className="mb-stats-separator">·</span>
                  <span className="mb-stats-subject">{selectedBatch.subject || "General"}</span>
                  {selectedBatch.schedule && (
                    <>
                      <span className="mb-stats-separator">·</span>
                      <span className="mb-stats-schedule">{selectedBatch.schedule}</span>
                    </>
                  )}
                </div>
                <div className="mb-stats-pills">
                  <span className="mb-stat-pill mb-stat-pill--green">
                    <Users size={12} /> {activeCount} active
                  </span>
                  <span className="mb-stat-pill mb-stat-pill--blue">
                    <CalendarCheck size={12} /> Avg Attendance: {avgAttendance}%
                  </span>
                  <span className="mb-stat-pill mb-stat-pill--purple">
                    <Award size={12} /> Avg Score: {avgScore}%
                  </span>
                </div>
              </div>
            )}

            {/* Column Headers */}
            <div className="mb-student-list-header">
              <span>Student</span>
              <span>Roll No</span>
              <span>Attendance</span>
              <span>Avg Score</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {/* Student Rows */}
            <div className="mb-student-list">
              {filteredStudents.length === 0 ? (
                <div className="mb-empty">
                  <Search size={32} />
                  <p>{search ? `No students found for "${search}"` : "No students in this batch"}</p>
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const attPct     = getAttendancePct(student);
                  const scoreVal   = getAvgScore(student);
                  const roll       = getRollNo(student);
                  const attColor   = attendanceColor(attPct);
                  const scoreColor =
                    scoreVal >= 80 ? "#27a55e"
                    : scoreVal >= 60 ? "#2D6BFF"
                    : "#ea580c";
                  const statusLabel = String(student.status || "Active").toLowerCase() === "active" ? "Active" : "Inactive";
                  const isAct       = statusLabel === "Active";

                  return (
                    <div key={student.id || student.name} className="mb-student-row">
                      {/* Avatar + Name */}
                      <div className="mb-student-cell mb-student-name-cell">
                        <AvatarPlaceholder src={student.avatar} name={student.name} size={36} className="mb-student-avatar" />
                        <div>
                          <p className="mb-student-name">{student.name}</p>
                          <p className="mb-student-joined">{student.joinedOn ? `Since ${student.joinedOn}` : student.email || ""}</p>
                        </div>
                      </div>

                      {/* Roll No */}
                      <span className="mb-student-cell mb-roll-no">{roll}</span>

                      {/* Attendance */}
                      <div className="mb-student-cell mb-att-cell">
                        <div className="mb-att-bar-wrap">
                          <div className="mb-att-bar-bg">
                            <div
                              className="mb-att-bar-fill"
                              style={{ width: `${attPct}%`, background: attColor }}
                            />
                          </div>
                          <span className="mb-att-pct" style={{ color: attColor }}>
                            {attPct}%
                          </span>
                        </div>
                      </div>

                      {/* Avg Score */}
                      <div className="mb-student-cell mb-score-cell">
                        <span className="mb-score-badge" style={{ color: scoreColor, background: `${scoreColor}18` }}>
                          {scoreVal >= 80 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {scoreVal}%
                        </span>
                      </div>

                      {/* Status */}
                      <span className="mb-student-cell">
                        <span className={`mb-status-dot mb-status-dot--${isAct ? "active" : "inactive"}`} />
                        <span className="mb-status-text">{statusLabel}</span>
                      </span>

                      {/* Action */}
                      <button
                        className="mb-student-cell mb-view-btn"
                        onClick={() => setSelectedStudent({
                          ...student,
                          attendancePercent: attPct,
                          avgScore: scoreVal,
                          rollNo: roll,
                          attendance: student.attendance || [],
                          assignments: student.assignments || [],
                          tests: student.tests || [],
                        })}
                      >
                        <Eye size={14} /> View Profile
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Student Profile Overlay ─────────────────────────── */}
      {selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          batchName={`${selectedBatch?.name || "Batch"} · ${selectedBatch?.subject || "General"}`}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default MyBatches;
