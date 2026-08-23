import { useState, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  CalendarDays,
  Users,
  Award,
  ClipboardList,
  Save,
  Paperclip,
  Star,
  BookOpen,
} from "lucide-react";
import {
  initialAssignments,
  SUBJECTS,
  BATCH_STUDENTS,
  generateId,
  assignmentStatus,
  dueDateLabel,
} from "./assignmentsData";
import AvatarPlaceholder from "../MyBatches/AvatarPlaceholder";
import supabase from "../../../../lib/supabase";
import "./Assignments.css";

/* ── Constants ─────────────────────────────────────────────── */
const subjectColor = {
  Mathematics: { text: "#2D6BFF", bg: "rgba(45,107,255,0.08)",  border: "rgba(45,107,255,0.18)" },
  Science:     { text: "#27a55e", bg: "rgba(55,200,113,0.08)",  border: "rgba(55,200,113,0.18)" },
};

const statusConfig = {
  completed: { label: "Completed",  color: "#27a55e", bg: "rgba(55,200,113,0.12)" },
  active:    { label: "Active",     color: "#2D6BFF", bg: "rgba(45,107,255,0.10)" },
  "due-soon":{ label: "Due Soon",   color: "#f97316", bg: "rgba(249,115,22,0.10)" },
  overdue:   { label: "Overdue",    color: "#ef4444", bg: "rgba(239,68,68,0.10)"  },
};

const submissionStatus = {
  reviewed:  { label: "Reviewed",  icon: CheckCircle2, color: "#27a55e", bg: "rgba(55,200,113,0.12)"  },
  submitted: { label: "Submitted", icon: Clock3,       color: "#2D6BFF", bg: "rgba(45,107,255,0.10)"  },
  pending:   { label: "Pending",   icon: Clock3,       color: "#f97316", bg: "rgba(249,115,22,0.10)"  },
  missing:   { label: "Missing",   icon: XCircle,      color: "#ef4444", bg: "rgba(239,68,68,0.10)"   },
};

/* ── Toast ─────────────────────────────────────────────────── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  return (
    <div className={`as-toast as-toast--${toast.type}`}>
      {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span>{toast.message}</span>
    </div>
  );
};

/* ── Submission summary counts ─────────────────────────────── */
const submissionCounts = (asgn) => {
  const subs = Array.isArray(asgn?.submissions) ? asgn.submissions : [];
  const submitted = subs.filter(s => s && s.status === "submitted").length;
  const reviewed  = subs.filter(s => s && s.status === "reviewed").length;
  const missing   = subs.filter(s => s && s.status === "missing").length;
  const total     = subs.length;
  return { submitted, reviewed, missing, total, done: submitted + reviewed };
};

/* ── Assignment Card ───────────────────────────────────────── */
const AssignmentCard = ({ asgn, onView, onEdit, onDelete }) => {
  const sc   = subjectColor[asgn.subject] || subjectColor.Mathematics;
  const stat = assignmentStatus(asgn);
  const sc2  = statusConfig[stat] || statusConfig.active;
  const due  = dueDateLabel(asgn.dueDate);
  const { done, reviewed, missing, total } = submissionCounts(asgn);
  const progressPct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className={`as-card as-card--${stat}`}>
      {/* Top row */}
      <div className="as-card-top">
        <div className="as-card-icon-wrap" style={{ background: sc.bg }}>
          <ClipboardList size={22} color={sc.text} />
        </div>
        <div className="as-card-badges">
          <span className="as-status-pill" style={{ color: sc2.color, background: sc2.bg }}>
            {sc2.label}
          </span>
        </div>
        <div className="as-card-actions">
          <button className="as-action-btn as-action-btn--view"  onClick={() => onView(asgn)}   title="View Submissions"><Eye    size={15} /></button>
          <button className="as-action-btn as-action-btn--edit"  onClick={() => onEdit(asgn)}   title="Edit"><Pencil size={14} /></button>
          <button className="as-action-btn as-action-btn--delete" onClick={() => onDelete(asgn)} title="Delete"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Title & description */}
      <h3 className="as-card-title">{asgn.title}</h3>
      <p className="as-card-desc">{asgn.description}</p>

      {/* Chips */}
      <div className="as-card-chips">
        <span className="as-chip as-chip--subject" style={{ color: sc.text, background: sc.bg, borderColor: sc.border }}>
          {asgn.subject}
        </span>
        <span className="as-chip">{asgn.batch}</span>
        <span className="as-chip">{asgn.grade}</span>
        {asgn.attachmentName && (
          <span className="as-chip as-chip--file">
            <Paperclip size={11} /> {asgn.attachmentName}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="as-card-stats">
        <div className="as-stat">
          <CalendarDays size={13} />
          <span style={{ color: due.color, fontWeight: 700 }}>{due.text}</span>
        </div>
        <div className="as-stat">
          <Award size={13} />
          <span>Max: {asgn.maxMarks} marks</span>
        </div>
        <div className="as-stat">
          <Users size={13} />
          <span>{done}/{total} submitted</span>
        </div>
      </div>

      {/* Progress */}
      <div className="as-progress-wrap">
        <div className="as-progress-bar">
          <div
            className="as-progress-fill"
            style={{
              width: `${progressPct}%`,
              background: stat === "completed" ? "#37C871" : stat === "overdue" ? "#ef4444" : "#2D6BFF",
            }}
          />
        </div>
        <span className="as-progress-label">
          {reviewed} reviewed · {missing} missing
        </span>
      </div>

      {/* Footer */}
      <div className="as-card-footer">
        <span className="as-footer-txt">Created {asgn.createdDate}</span>
        <button className="as-view-submissions-btn" onClick={() => onView(asgn)}>
          View Submissions →
        </button>
      </div>
    </div>
  );
};

/* ── Submissions Panel ─────────────────────────────────────── */
const SubmissionsPanel = ({ asgn, onClose, onSave }) => {
  const [submissions, setSubmissions] = useState(
    (Array.isArray(asgn.submissions) ? asgn.submissions : []).map(s => ({ ...s }))
  );
  const [saved, setSaved] = useState(false);

  const updateSub = (idx, field, val) => {
    setSubmissions(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
    setSaved(false);
  };

  const markReviewed = (idx) => {
    setSubmissions(prev => {
      const next = [...prev];
      if (next[idx].status === "submitted") {
        next[idx] = { ...next[idx], status: "reviewed" };
      }
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    onSave({ ...asgn, submissions });
    setSaved(true);
  };

  const sc = subjectColor[asgn.subject] || subjectColor.Mathematics;
  const due = dueDateLabel(asgn.dueDate);

  return (
    <div className="as-overlay" onClick={onClose}>
      <div className="as-panel" onClick={e => e.stopPropagation()}>
        {/* Panel header */}
        <div className="as-panel-header">
          <div className="as-panel-title-row">
            <div className="as-panel-icon" style={{ background: sc.bg }}>
              <ClipboardList size={20} color={sc.text} />
            </div>
            <div>
              <h2 className="as-panel-title">{asgn.title}</h2>
              <p className="as-panel-sub">
                {asgn.subject} · {asgn.batch} · Max {asgn.maxMarks} marks ·&nbsp;
                <span style={{ color: due.color, fontWeight: 700 }}>{due.text}</span>
              </p>
            </div>
          </div>
          <button className="as-panel-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Summary strip */}
        <div className="as-panel-summary">
          {["reviewed", "submitted", "missing", "pending"].map(st => {
            const count = submissions.filter(s => s.status === st).length;
            if (!count) return null;
            const cfg = submissionStatus[st];
            const Icon = cfg.icon;
            return (
              <div key={st} className="as-summary-chip" style={{ color: cfg.color, background: cfg.bg }}>
                <Icon size={13} /> {count} {cfg.label}
              </div>
            );
          })}
        </div>

        {/* Submission rows */}
        <div className="as-panel-body">
          {submissions.map((sub, idx) => {
            const cfg  = submissionStatus[sub.status] || submissionStatus.pending;
            const Icon = cfg.icon;
            const pct  = sub.score != null ? Math.round((sub.score / asgn.maxMarks) * 100) : null;
            const gradeColor = pct == null ? "#64748b" : pct >= 80 ? "#27a55e" : pct >= 60 ? "#2D6BFF" : "#ea580c";

            return (
              <div key={sub.studentId} className="as-sub-row">
                {/* Student info */}
                <div className="as-sub-student">
                  <AvatarPlaceholder src={sub.avatar} name={sub.name} size={40} />
                  <div>
                    <p className="as-sub-name">{sub.name}</p>
                    <p className="as-sub-roll">{sub.rollNo}</p>
                  </div>
                </div>

                {/* Status */}
                <span className="as-sub-status" style={{ color: cfg.color, background: cfg.bg }}>
                  <Icon size={12} /> {cfg.label}
                </span>

                {/* Submitted on */}
                <div className="as-sub-date">
                  {sub.submittedOn
                    ? <><CalendarDays size={12} /> {sub.submittedOn}</>
                    : <span className="as-sub-na">—</span>}
                </div>

                {/* Score input */}
                <div className="as-sub-marks">
                  {sub.status === "missing" || sub.status === "pending" ? (
                    <span className="as-sub-na">—</span>
                  ) : (
                    <div className="as-marks-wrap">
                      <input
                        className="as-marks-input"
                        type="number"
                        min={0}
                        max={asgn.maxMarks}
                        placeholder="—"
                        value={sub.score ?? ""}
                        onChange={e => {
                          const v = e.target.value === "" ? null : Math.min(Number(e.target.value), asgn.maxMarks);
                          updateSub(idx, "score", v);
                        }}
                      />
                      <span className="as-marks-max">/ {asgn.maxMarks}</span>
                      {pct != null && (
                        <span className="as-pct-badge" style={{ color: gradeColor, background: `${gradeColor}18` }}>
                          {pct}%
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Mark reviewed */}
                <div className="as-sub-action">
                  {sub.status === "submitted" && (
                    <button className="as-mark-reviewed-btn" onClick={() => markReviewed(idx)}>
                      <Star size={13} /> Mark Reviewed
                    </button>
                  )}
                  {sub.status === "reviewed" && (
                    <span className="as-reviewed-done"><CheckCircle2 size={14} /> Done</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Save footer */}
        <div className="as-panel-footer">
          <button className="as-btn-cancel" onClick={onClose}>Close</button>
          <button className="as-btn-save" onClick={handleSave}>
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Marks</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Create / Edit Modal ───────────────────────────────────── */
const EMPTY_FORM = {
  title: "",
  subject: "Mathematics",
  batch: "Batch A",
  batchId: "b1",
  grade: "Grade 10",
  description: "",
  dueDate: "",
  maxMarks: 20,
  attachmentName: null,
};

const AssignmentModal = ({ mode, initial, onClose, onSave, batches = [], students = [] }) => {
  const [form, setForm] = useState(
    initial
      ? { ...initial }
      : { ...EMPTY_FORM, createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }
  );
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.dueDate)        e.dueDate = "Due date is required";
    if (!form.maxMarks || form.maxMarks < 1) e.maxMarks = "Enter valid marks";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const matchedStudents = students.length > 0
      ? students.filter(s => s.batchId === form.batchId || s.batch === form.batch)
      : BATCH_STUDENTS[form.batchId] || [];

    const skeleton = matchedStudents.length > 0 ? matchedStudents : (students.length > 0 ? students : BATCH_STUDENTS["b1"] || []);
    const existingSubs = initial?.submissions || [];

    const submissions = skeleton.map(st => {
      const stId = st.id || st.studentId;
      const existing = existingSubs.find(s => (s.studentId || s.id) === stId);
      return existing || {
        studentId: stId,
        name: st.name,
        rollNo: st.rollNo || "RN-001",
        avatar: st.avatar || null,
        submittedOn: null,
        score: null,
        status: "pending"
      };
    });

    onSave({
      ...form,
      id: initial?.id ?? generateId(),
      submissions,
      createdDate: initial?.createdDate ?? form.createdDate,
    });
  };

  return (
    <div className="as-overlay" onClick={onClose}>
      <div className="as-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="as-modal-header">
          <div className="as-modal-title-row">
            <div className="as-modal-icon">
              {mode === "create" ? <Plus size={20} /> : <Pencil size={20} />}
            </div>
            <h2 className="as-modal-title">
              {mode === "create" ? "Create Assignment" : "Edit Assignment"}
            </h2>
          </div>
          <button className="as-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="as-modal-body">
          {/* Title */}
          <div className="as-field">
            <label className="as-label">Title *</label>
            <input
              className={`as-input ${errors.title ? "as-input--error" : ""}`}
              placeholder="e.g. Chapter 6 – Triangles Worksheet"
              value={form.title}
              onChange={e => set("title", e.target.value)}
            />
            {errors.title && <span className="as-error">{errors.title}</span>}
          </div>

          {/* Subject / Batch / Grade */}
          <div className="as-field-row">
            <div className="as-field">
              <label className="as-label">Subject *</label>
              <input
                className="as-input"
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={e => set("subject", e.target.value)}
              />
            </div>
            <div className="as-field">
              <label className="as-label">Batch</label>
              <input
                className="as-input"
                placeholder="e.g. Batch A"
                value={form.batch}
                onChange={e => set("batch", e.target.value)}
              />
            </div>
            <div className="as-field">
              <label className="as-label">Grade</label>
              <input
                className="as-input"
                placeholder="e.g. Grade 10"
                value={form.grade}
                onChange={e => set("grade", e.target.value)}
              />
            </div>
          </div>

          {/* Due date + Max marks */}
          <div className="as-field-row">
            <div className="as-field">
              <label className="as-label">Due Date *</label>
              <input
                type="date"
                className={`as-input ${errors.dueDate ? "as-input--error" : ""}`}
                value={form.dueDate}
                onChange={e => set("dueDate", e.target.value)}
              />
              {errors.dueDate && <span className="as-error">{errors.dueDate}</span>}
            </div>
            <div className="as-field">
              <label className="as-label">Max Marks *</label>
              <input
                type="number"
                min={1}
                className={`as-input ${errors.maxMarks ? "as-input--error" : ""}`}
                value={form.maxMarks}
                onChange={e => set("maxMarks", Number(e.target.value))}
              />
              {errors.maxMarks && <span className="as-error">{errors.maxMarks}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="as-field">
            <label className="as-label">Description *</label>
            <textarea
              className={`as-textarea ${errors.description ? "as-input--error" : ""}`}
              placeholder="Instructions for the student…"
              rows={4}
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
            {errors.description && <span className="as-error">{errors.description}</span>}
          </div>

          {/* Optional attachment */}
          <div className="as-field">
            <label className="as-label">Attachment (optional)</label>
            <div
              className="as-file-drop"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                className="as-file-input"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) set("attachmentName", f.name);
                }}
              />
              {form.attachmentName ? (
                <div className="as-file-selected">
                  <FileText size={18} color="#2D6BFF" />
                  <span className="as-file-name">{form.attachmentName}</span>
                  <button
                    className="as-file-remove"
                    onClick={ev => { ev.stopPropagation(); set("attachmentName", null); }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="as-file-placeholder">
                  <Paperclip size={20} color="var(--muted-light)" />
                  <span>Click to attach a file (PDF, DOC, PPT)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="as-modal-footer">
          <button className="as-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="as-btn-save" onClick={handleSubmit}>
            {mode === "create"
              ? <><Plus size={15} /> Create Assignment</>
              : <><Pencil size={15} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Delete Modal ──────────────────────────────────────────── */
const DeleteModal = ({ asgn, onClose, onConfirm }) => (
  <div className="as-overlay" onClick={onClose}>
    <div className="as-delete-modal" onClick={e => e.stopPropagation()}>
      <div className="as-delete-icon"><Trash2 size={26} color="#ef4444" /></div>
      <h3 className="as-delete-title">Delete Assignment?</h3>
      <p className="as-delete-body">
        Are you sure you want to delete <strong>"{asgn.title}"</strong>?
        All submission data will be lost.
      </p>
      <div className="as-delete-actions">
        <button className="as-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="as-btn-delete" onClick={onConfirm}>
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  </div>
);

/* ══ Main Component ════════════════════════════════════════ */
const Assignments = ({ assignments: propAssignments, setAssignments: propSetAssignments, batches = [], students = [] }) => {
  const [localAssignments, setLocalAssignments] = useState(() => {
    try {
      const stored = localStorage.getItem("gw_assignments_v2");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return initialAssignments;
  });

  const assignments = propAssignments || localAssignments;
  const setAssignments = (updater) => {
    const next = typeof updater === "function" ? updater(assignments) : updater;
    if (propSetAssignments) {
      propSetAssignments(next);
    }
    setLocalAssignments(next);
    try {
      localStorage.setItem("gw_assignments_v2", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const [searchQ,     setSearchQ]       = useState("");
  const [filterSubject, setFilterSub]  = useState("All");
  const [filterBatch,   setFilterBatch]= useState("All");
  const [filterStatus,  setFilterStat] = useState("All");
  const [modal,         setModal]      = useState(null); // null | "create" | { mode:"edit", asgn }
  const [viewAsgn,      setViewAsgn]   = useState(null);
  const [deleteTarget,  setDeleteTarget]= useState(null);
  const [toast,         setToast]      = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = [...assignments];
    if (filterSubject !== "All") list = list.filter(a => a.subject === filterSubject);
    if (filterBatch !== "All")   list = list.filter(a => a.batch === filterBatch);
    if (filterStatus !== "All")  list = list.filter(a => assignmentStatus(a) === filterStatus);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        a => a.title.toLowerCase().includes(q) ||
             a.subject.toLowerCase().includes(q) ||
             a.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assignments, filterSubject, filterBatch, filterStatus, searchQ]);

  /* Group by subject */
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(a => { if (!map[a.subject]) map[a.subject] = []; map[a.subject].push(a); });
    return map;
  }, [filtered]);

  /* Summary stats */
  const totalSubmissions = assignments.reduce((s, a) => s + submissionCounts(a).done, 0);
  const pendingReview    = assignments.reduce((s, a) => s + submissionCounts(a).submitted, 0);
  const overdue          = assignments.filter(a => assignmentStatus(a) === "overdue").length;

  /* CRUD */
  const handleSave = async (data) => {
    if (modal === "create") {
      setAssignments(p => [data, ...p]);
      showToast("Assignment created successfully!");

      // Resolve logged in teacher name
      const loggedTeacherStr = localStorage.getItem("gw_logged_teacher");
      let teacherName = "Alice";
      if (loggedTeacherStr) {
        try {
          teacherName = JSON.parse(loggedTeacherStr).name;
        } catch (e) {}
      }

      // Insert notification for the student along with the current time
      try {
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        await supabase.from("notifications").insert({
          type: `assignment:${teacherName}`,
          message: `New Assignment: ${data.title} (${data.subject})`,
          time: currentTime,
        });
      } catch (err) {
        console.error("Failed to insert assignment notification:", err);
      }
    } else {
      setAssignments(p => p.map(a => a.id === data.id ? data : a));
      showToast("Assignment updated successfully!");
    }
    setModal(null);
  };

  const handleSubmissionSave = (updated) => {
    setAssignments(p => p.map(a => a.id === updated.id ? updated : a));
    setViewAsgn(updated);
    showToast("Marks saved successfully!");
  };

  const handleDelete = () => {
    setAssignments(p => p.filter(a => a.id !== deleteTarget.id));
    showToast(`"${deleteTarget.title}" deleted.`, "warning");
    setDeleteTarget(null);
  };

  const allBatches  = ["All", ...new Set(SUBJECTS.map(s => s.batch))];
  const anyFilter   = filterSubject !== "All" || filterBatch !== "All" || filterStatus !== "All" || searchQ;

  return (
    <div className="as-page">
      <Toast toast={toast} />

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="as-page-header">
        <div>
          <h1 className="as-page-title">Assignments</h1>
          <p className="as-page-sub">
            {assignments.length} assignments · {totalSubmissions} submissions · {pendingReview} pending review
            {overdue > 0 && <span className="as-overdue-badge"> · {overdue} overdue</span>}
          </p>
        </div>
        <button className="as-create-btn" onClick={() => setModal("create")}>
          <Plus size={17} /> Create Assignment
        </button>
      </div>

      {/* ── Stats bar ────────────────────────────────────── */}
      <div className="as-stats-row">
        {[
          { label: "Total Assignments", value: assignments.length,  color: "#2D6BFF", icon: ClipboardList },
          { label: "Total Submissions", value: totalSubmissions,    color: "#27a55e", icon: CheckCircle2  },
          { label: "Pending Review",    value: pendingReview,       color: "#f97316", icon: Clock3        },
          { label: "Overdue",           value: overdue,             color: "#ef4444", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="as-stat-card">
            <div className="as-stat-icon" style={{ background: `${color}18`, color }}><Icon size={20} /></div>
            <div>
              <p className="as-stat-value" style={{ color }}>{value}</p>
              <p className="as-stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ───────────────────────────────────── */}
      <div className="as-filter-bar">
        <div className="as-search-wrap">
          <Search size={15} className="as-search-icon" />
          <input
            className="as-search-input"
            placeholder="Search assignments…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>

        {[
          { value: filterSubject, onChange: setFilterSub,  options: ["All Subjects", ...SUBJECTS.map(s => s.label)], all: "All" },
          { value: filterBatch,  onChange: setFilterBatch, options: allBatches.map(b => b === "All" ? "All Batches" : b), all: "All" },
          { value: filterStatus, onChange: setFilterStat,  options: ["All Status", "active", "due-soon", "overdue", "completed"], all: "All" },
        ].map(({ value, onChange, options, all }, i) => (
          <div key={i} className="as-select-group">
            <div className="as-sel-wrap">
              <select
                className="as-filter-select"
                value={value}
                onChange={e => {
                  const v = e.target.value;
                  onChange(v.startsWith("All") ? "All" : v);
                }}
              >
                {options.map(o => <option key={o} value={o.startsWith("All") ? "All" : o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
              <ChevronDown size={13} className="as-sel-arrow" />
            </div>
          </div>
        ))}

        {anyFilter && (
          <button className="as-clear-btn" onClick={() => { setFilterSub("All"); setFilterBatch("All"); setFilterStat("All"); setSearchQ(""); }}>
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Assignment list ───────────────────────────────── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="as-empty">
          <ClipboardList size={48} color="var(--muted-light)" />
          <p className="as-empty-title">No assignments found</p>
          <p className="as-empty-sub">Try adjusting filters or create a new assignment.</p>
          <button className="as-create-btn" onClick={() => setModal("create")}>
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      ) : (
        <div className="as-subjects">
          {Object.entries(grouped).map(([subject, items]) => {
            const subInfo = SUBJECTS.find(s => s.label === subject);
            const sc = subjectColor[subject] || subjectColor.Mathematics;
            return (
              <div key={subject} className="as-subject-section">
                <div className="as-subject-header">
                  <div className="as-subject-icon" style={{ background: sc.bg, color: sc.text }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="as-subject-name" style={{ color: sc.text }}>{subject}</h2>
                    <p className="as-subject-meta">
                      {subInfo?.batch} · {subInfo?.grade} · {items.length} assignment{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="as-subject-divider" style={{ background: sc.border }} />
                </div>
                <div className="as-cards-grid">
                  {items.map(a => (
                    <AssignmentCard
                      key={a.id}
                      asgn={a}
                      onView={setViewAsgn}
                      onEdit={a => setModal({ mode: "edit", asgn: a })}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {modal === "create" && (
        <AssignmentModal mode="create" initial={null} onClose={() => setModal(null)} onSave={handleSave} batches={batches} students={students} />
      )}
      {modal?.mode === "edit" && (
        <AssignmentModal mode="edit" initial={modal.asgn} onClose={() => setModal(null)} onSave={handleSave} batches={batches} students={students} />
      )}
      {viewAsgn && (
        <SubmissionsPanel asgn={viewAsgn} onClose={() => setViewAsgn(null)} onSave={handleSubmissionSave} />
      )}
      {deleteTarget && (
        <DeleteModal asgn={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
    </div>
  );
};

export default Assignments;
