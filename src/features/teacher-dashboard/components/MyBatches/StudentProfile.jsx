import { useState } from "react";
import {
  X,
  Mail,
  Phone,
  User,
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  BarChart3,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
} from "lucide-react";
import AvatarPlaceholder from "./AvatarPlaceholder";
import "./StudentProfile.css";

const TABS = [
  { id: "overview",    label: "Academic Overview", icon: BarChart3 },
  { id: "attendance",  label: "Attendance",        icon: CalendarCheck },
  { id: "assignments", label: "Assignments",       icon: ClipboardList },
  { id: "tests",       label: "Weekly Tests",      icon: FileCheck2 },
];

const statusConfig = {
  reviewed:  { label: "Reviewed",  icon: CheckCircle2, color: "#27a55e", bg: "rgba(55,200,113,0.12)"  },
  submitted: { label: "Submitted", icon: Clock3,       color: "#2D6BFF", bg: "rgba(45,107,255,0.10)"  },
  pending:   { label: "Pending",   icon: Clock3,       color: "#ea580c", bg: "rgba(234,88,12,0.10)"   },
  missing:   { label: "Missing",   icon: XCircle,      color: "#dc2626", bg: "rgba(220,38,38,0.10)"   },
};



/* ── Mini bar chart ─────────────────────────────────────── */
const ScoreBar = ({ score, max }) => {
  const pct = max ? Math.round((score / max) * 100) : 0;
  const color = pct >= 80 ? "#37C871" : pct >= 60 ? "#2D6BFF" : "#ea580c";
  return (
    <div className="sp-bar-wrap">
      <div className="sp-bar-bg">
        <div className="sp-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="sp-bar-pct" style={{ color }}>{pct}%</span>
    </div>
  );
};

/* ── Circular progress ──────────────────────────────────── */
const CircleProgress = ({ value, size = 80, stroke = 7, color }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
};

/* ── Tab: Overview ──────────────────────────────────────── */
const OverviewTab = ({ student }) => {
  const testAvg = student.tests.length
    ? Math.round(student.tests.reduce((s, t) => s + (t.score / t.maxScore) * 100, 0) / student.tests.length)
    : 0;
  const assignSubmitted = student.assignments.filter(a => a.status !== "missing").length;
  const assignTotal     = student.assignments.length;

  const stats = [
    { label: "Avg Score",          value: `${student.avgScore}%`, color: "#2D6BFF",  ring: student.avgScore,   ringColor: "#2D6BFF"  },
    { label: "Attendance",         value: `${student.attendancePercent}%`, color: "#37C871", ring: student.attendancePercent, ringColor: "#37C871" },
    { label: "Test Avg",           value: `${testAvg}%`,  color: "#8b5cf6",  ring: testAvg,    ringColor: "#8b5cf6"  },
    { label: "Assignments Done",   value: `${assignSubmitted}/${assignTotal}`, color: "#ea580c",  ring: Math.round((assignSubmitted/assignTotal)*100), ringColor: "#ea580c" },
  ];

  return (
    <div className="sp-overview">
      <div className="sp-stat-grid">
        {stats.map((s, i) => (
          <div key={i} className="sp-stat-card">
            <div className="sp-stat-ring-wrap">
              <CircleProgress value={s.ring} color={s.ringColor} />
              <span className="sp-stat-ring-label" style={{ color: s.ringColor }}>{s.value}</span>
            </div>
            <p className="sp-stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent test scores */}
      <div className="sp-overview-bottom">
        <div className="sp-recent-tests">
          <p className="sp-section-label">Recent Test Scores</p>
          {student.tests.slice(-4).map((t, i) => (
            <div key={i} className="sp-recent-test-row">
              <span className="sp-recent-test-name">{t.title}</span>
              <ScoreBar score={t.score} max={t.maxScore} />
              <span className="sp-test-score-inline">{t.score}/{t.maxScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Tab: Attendance ────────────────────────────────────── */
const AttendanceTab = ({ student }) => {
  const totalPresent = student.attendance.reduce((s, w) => s + (w.present ?? 0), 0);
  const totalClasses = student.attendance.reduce((s, w) => s + w.total, 0);

  return (
    <div className="sp-attendance">
      <div className="sp-att-summary">
        <div className="sp-att-summary-item">
          <span className="sp-att-big" style={{ color: "#37C871" }}>{totalPresent}</span>
          <span className="sp-att-label">Present</span>
        </div>
        <div className="sp-att-divider" />
        <div className="sp-att-summary-item">
          <span className="sp-att-big" style={{ color: "#ef4444" }}>{totalClasses - totalPresent}</span>
          <span className="sp-att-label">Absent</span>
        </div>
        <div className="sp-att-divider" />
        <div className="sp-att-summary-item">
          <span className="sp-att-big" style={{ color: "#2D6BFF" }}>{student.attendancePercent}%</span>
          <span className="sp-att-label">Overall</span>
        </div>
      </div>

      <div className="sp-weeks">
        {student.attendance.map((w, i) => {
          const pct = Math.round(((w.present ?? 0) / w.total) * 100);
          const color = pct === 100 ? "#37C871" : pct >= 50 ? "#2D6BFF" : "#ef4444";
          return (
            <div key={i} className="sp-week-row">
              <div className="sp-week-info">
                <span className="sp-week-name">{w.week}</span>
                <div className="sp-week-classes">
                  {w.classes.map((c, j) => (
                    <span
                      key={j}
                      className={`sp-class-chip ${c.includes("✓") ? "present" : "absent"}`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="sp-week-right">
                <span className="sp-week-count" style={{ color }}>
                  {w.present ?? 0}/{w.total}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Tab: Assignments ───────────────────────────────────── */
const AssignmentsTab = ({ student }) => (
  <div className="sp-assignments">
    {student.assignments.map((a, i) => {
      const s = statusConfig[a.status] || statusConfig.pending;
      const Icon = s.icon;
      const pct = a.score != null ? Math.round((a.score / a.maxScore) * 100) : null;
      return (
        <div key={i} className="sp-assignment-row">
          <div className="sp-asgn-left">
            <p className="sp-asgn-title">{a.title}</p>
            <p className="sp-asgn-sub">
              {a.submitted ? `Submitted: ${a.submitted}` : "Not submitted"}
              {" · "}Max: {a.maxScore} marks
            </p>
          </div>
          <div className="sp-asgn-mid">
            {pct !== null ? <ScoreBar score={a.score} max={a.maxScore} /> : <span className="sp-asgn-noscore">—</span>}
          </div>
          <span className="sp-status-badge" style={{ color: s.color, background: s.bg }}>
            <Icon size={11} /> {s.label}
          </span>
        </div>
      );
    })}
  </div>
);

/* ── Tab: Tests ─────────────────────────────────────────── */
const TestsTab = ({ student }) => (
  <div className="sp-tests">
    {student.tests.map((t, i) => (
      <div key={i} className="sp-test-row">
        <div className="sp-test-left">
          <p className="sp-test-title">{t.title}</p>
          <p className="sp-test-date">{t.date}</p>
        </div>
        <div className="sp-test-mid">
          <ScoreBar score={t.score} max={t.maxScore} />
          <span className="sp-test-score">{t.score}/{t.maxScore}</span>
        </div>
      </div>
    ))}
  </div>
);

/* ── Main StudentProfile ────────────────────────────────── */
const StudentProfile = ({ student, batchName, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sp-header">
          <div className="sp-profile-row">
            <AvatarPlaceholder src={student.avatar} name={student.name} size={72} className="sp-avatar" />
            <div className="sp-header-info">
              <div className="sp-header-name-row">
                <h2 className="sp-name">{student.name}</h2>
                <span className={`sp-status-pill sp-status-pill--${student.status}`}>
                  {student.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="sp-sub-info">
                Roll No: <strong>{student.rollNo}</strong> &nbsp;·&nbsp;
                {student.grade} &nbsp;·&nbsp; {batchName}
              </p>
              <div className="sp-contact-row">
                <span className="sp-contact-chip"><Mail size={12} />{student.email}</span>
                <span className="sp-contact-chip"><Phone size={12} />{student.phone}</span>
                <span className="sp-contact-chip"><User size={12} />Parent: {student.parent}</span>
              </div>
            </div>
            <div className="sp-header-actions">
              <button className="sp-perf-btn">
                <ExternalLink size={14} /> View Performance
              </button>
              <button className="sp-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="sp-tabs">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`sp-tab ${activeTab === id ? "active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="sp-content">
          {activeTab === "overview"    && <OverviewTab    student={student} />}
          {activeTab === "attendance"  && <AttendanceTab  student={student} />}
          {activeTab === "assignments" && <AssignmentsTab student={student} />}
          {activeTab === "tests"       && <TestsTab       student={student} />}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
