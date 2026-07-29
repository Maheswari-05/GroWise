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
} from "lucide-react";
import { batches, students } from "./batchesData";
import StudentProfile from "./StudentProfile";
import AvatarPlaceholder from "./AvatarPlaceholder";
import "./MyBatches.css";

const subjectFilters = ["All Subjects", "Mathematics", "Science"];

const batchColorMap = {
  blue:  { bg: "rgba(45,107,255,0.08)",  border: "rgba(45,107,255,0.18)", text: "#2D6BFF",  activeBg: "rgba(45,107,255,0.13)"  },
  green: { bg: "rgba(55,200,113,0.08)",  border: "rgba(55,200,113,0.20)", text: "#27a55e",  activeBg: "rgba(55,200,113,0.14)"  },
};

const attendanceColor = (pct) =>
  pct >= 90 ? "#27a55e" : pct >= 75 ? "#2D6BFF" : "#ea580c";

const MyBatches = () => {
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0].id);
  const [selectedStudent, setSelectedStudent]  = useState(null);
  const [search,          setSearch]           = useState("");
  const [subjectFilter,   setSubjectFilter]    = useState("All Subjects");
  const [filterOpen,      setFilterOpen]       = useState(false);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);

  /* Filtered students */
  const filteredStudents = useMemo(() => {
    let list = students.filter((s) => s.batchId === selectedBatchId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedBatchId, search]);

  /* Batch stats */
  const batchStudents = students.filter((s) => s.batchId === selectedBatchId);
  const avgAttendance = batchStudents.length
    ? Math.round(batchStudents.reduce((a, s) => a + s.attendancePercent, 0) / batchStudents.length)
    : 0;
  const avgScore = batchStudents.length
    ? Math.round(batchStudents.reduce((a, s) => a + s.avgScore, 0) / batchStudents.length)
    : 0;
  const activeCount = batchStudents.filter((s) => s.status === "active").length;

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

      {/* ── Main Grid ───────────────────────────────────────── */}
      <div className="mb-grid">

        {/* ── Left: Batch List ──────────────────────────────── */}
        <aside className="mb-batch-list">
          <p className="mb-section-label">Batches</p>
          {batches.map((batch) => {
            const c      = batchColorMap[batch.color];
            const active = batch.id === selectedBatchId;
            const count  = students.filter((s) => s.batchId === batch.id).length;
            return (
              <button
                key={batch.id}
                className={`mb-batch-card ${active ? "active" : ""}`}
                style={active ? { background: c.activeBg, borderColor: c.border } : {}}
                onClick={() => { setSelectedBatchId(batch.id); setSearch(""); }}
              >
                <div className="mb-batch-icon" style={{ background: c.bg, color: c.text }}>
                  <span className="mb-batch-emoji">{batch.icon}</span>
                </div>
                <div className="mb-batch-info">
                  <p className="mb-batch-name">{batch.name}</p>
                  <p className="mb-batch-subject" style={{ color: c.text }}>{batch.subject}</p>
                  <p className="mb-batch-grade">{batch.grade}</p>
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
                <span className="mb-stats-subject">{selectedBatch.subject}</span>
                <span className="mb-stats-separator">·</span>
                <span className="mb-stats-schedule">{selectedBatch.schedule}</span>
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
                <p>No students found for "{search}"</p>
              </div>
            ) : (
              filteredStudents
                .map((student) => {
                  const attColor  = attendanceColor(student.attendancePercent);
                  const scoreColor =
                    student.avgScore >= 80 ? "#27a55e"
                    : student.avgScore >= 60 ? "#2D6BFF"
                    : "#ea580c";
                  return (
                    <div key={student.id} className="mb-student-row">
                      {/* Avatar + Name */}
                      <div className="mb-student-cell mb-student-name-cell">
                        <AvatarPlaceholder src={student.avatar} name={student.name} size={36} className="mb-student-avatar" />
                        <div>
                          <p className="mb-student-name">{student.name}</p>
                          <p className="mb-student-joined">Since {student.joinedOn}</p>
                        </div>
                      </div>

                      {/* Roll No */}
                      <span className="mb-student-cell mb-roll-no">{student.rollNo}</span>

                      {/* Attendance */}
                      <div className="mb-student-cell mb-att-cell">
                        <div className="mb-att-bar-wrap">
                          <div className="mb-att-bar-bg">
                            <div
                              className="mb-att-bar-fill"
                              style={{ width: `${student.attendancePercent}%`, background: attColor }}
                            />
                          </div>
                          <span className="mb-att-pct" style={{ color: attColor }}>
                            {student.attendancePercent}%
                          </span>
                        </div>
                      </div>

                      {/* Avg Score */}
                      <div className="mb-student-cell mb-score-cell">
                        <span className="mb-score-badge" style={{ color: scoreColor, background: `${scoreColor}18` }}>
                          {student.avgScore >= 80 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {student.avgScore}%
                        </span>
                      </div>

                      {/* Status */}
                      <span className="mb-student-cell">
                        <span className={`mb-status-dot mb-status-dot--${student.status}`} />
                        <span className="mb-status-text">{student.status === "active" ? "Active" : "Inactive"}</span>
                      </span>

                      {/* Action */}
                      <button
                        className="mb-student-cell mb-view-btn"
                        onClick={() => setSelectedStudent(student)}
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

      {/* ── Student Profile Overlay ─────────────────────────── */}
      {selectedStudent && (
        <StudentProfile
          student={selectedStudent}
          batchName={`${selectedBatch?.name} · ${selectedBatch?.subject}`}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default MyBatches;
