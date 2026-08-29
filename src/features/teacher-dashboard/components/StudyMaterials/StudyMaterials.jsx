import { useState, useMemo, useRef } from "react";
import {
  Search,
  Upload,
  Download,
  Pencil,
  Trash2,
  X,
  FileText,
  FileSpreadsheet,
  Presentation,
  BookOpen,
  Filter,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FolderOpen,
  Calendar,
  HardDrive,
} from "lucide-react";
import { initialMaterials, SUBJECTS, generateId } from "./materialsData";
import supabase from "../../../../lib/supabase";
import { useEffect } from "react";
import "./StudyMaterials.css";

/* ── File type config ──────────────────────────────────────── */
const FILE_TYPES = {
  pdf:   { label: "PDF",   icon: FileText,        color: "#ef4444", bg: "rgba(239,68,68,0.10)"  },
  doc:   { label: "DOC",   icon: FileSpreadsheet, color: "#2D6BFF", bg: "rgba(45,107,255,0.10)" },
  ppt:   { label: "PPT",   icon: Presentation,    color: "#f97316", bg: "rgba(249,115,22,0.10)" },
  other: { label: "FILE",  icon: BookOpen,        color: "#8b5cf6", bg: "rgba(139,92,246,0.10)" },
};

const fileTypeOf = (name = "") => {
  const ext = name.split(".").pop().toLowerCase();
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  return "other";
};

const subjectColorMap = {
  Mathematics: { text: "#2D6BFF", bg: "rgba(45,107,255,0.08)",  border: "rgba(45,107,255,0.18)" },
  Science:     { text: "#27a55e", bg: "rgba(55,200,113,0.08)", border: "rgba(55,200,113,0.18)" },
};

/* ── Toast ─────────────────────────────────────────────────── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div className={`sm-toast ${isSuccess ? "sm-toast--success" : "sm-toast--warning"}`}>
      {isSuccess ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
      <span>{toast.message}</span>
    </div>
  );
};

/* ── Material Card ─────────────────────────────────────────── */
const MaterialCard = ({ material, onEdit, onDelete, onDownload }) => {
  const ft = FILE_TYPES[material.fileType] || FILE_TYPES.other;
  const FtIcon = ft.icon;
  const sc = subjectColorMap[material.subject] || subjectColorMap.Mathematics;

  return (
    <div className="sm-card">
      {/* File type badge */}
      <div className="sm-card-top">
        <div className="sm-file-icon-wrap" style={{ background: ft.bg }}>
          <FtIcon size={26} color={ft.color} />
          <span className="sm-file-badge" style={{ background: ft.color }}>
            {ft.label}
          </span>
        </div>
        <div className="sm-card-actions">
          <button
            className="sm-action-btn sm-action-btn--download"
            onClick={() => onDownload(material)}
            title="Download"
          >
            <Download size={15} />
          </button>
          <button
            className="sm-action-btn sm-action-btn--edit"
            onClick={() => onEdit(material)}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="sm-action-btn sm-action-btn--delete"
            onClick={() => onDelete(material)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Title & description */}
      <h3 className="sm-card-title">{material.title}</h3>
      <p className="sm-card-desc">{material.description}</p>

      {/* Meta */}
      <div className="sm-card-meta">
        <span
          className="sm-subject-chip"
          style={{ color: sc.text, background: sc.bg, borderColor: sc.border }}
        >
          {material.subject}
        </span>
        <span className="sm-meta-dot" />
        <span className="sm-meta-text">{material.batch}</span>
        <span className="sm-meta-dot" />
        <span className="sm-meta-text">{material.grade}</span>
      </div>

      {/* Footer */}
      <div className="sm-card-footer">
        <span className="sm-footer-item"><Calendar size={13} /> {material.uploadDate}</span>
        <span className="sm-footer-item"><HardDrive size={13} /> {material.fileSize}</span>
        <span className="sm-footer-item"><Download size={13} /> {material.downloads} downloads</span>
      </div>
    </div>
  );
};

/* ── Upload / Edit Modal ───────────────────────────────────── */
const EMPTY_FORM = {
  title: "",
  subject: "Mathematics",
  batch: "Batch A",
  grade: "Grade 10",
  description: "",
  fileName: "",
  fileSize: "",
  fileType: "pdf",
};

const MaterialModal = ({ mode, initial, onClose, onSave, batches = [], students = [] }) => {
  const [form, setForm] = useState(() => {
    if (initial) return { ...initial };
    const firstBatch = batches[0];
    return {
      ...EMPTY_FORM,
      batchId: firstBatch ? firstBatch.id || firstBatch.name : "b1",
      batch: firstBatch ? firstBatch.name : "Batch A",
      grade: firstBatch ? firstBatch.grade || "Grade 10" : "Grade 10",
      subject: firstBatch && firstBatch.subject ? firstBatch.subject : "Mathematics",
    };
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeKb = file.size / 1024;
    const sizeStr =
      sizeKb >= 1024
        ? `${(sizeKb / 1024).toFixed(1)} MB`
        : `${Math.round(sizeKb)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((f) => ({
        ...f,
        fileName: file.name,
        fileSize: sizeStr,
        fileType: fileTypeOf(file.name),
        fileUrl: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.batch.trim()) e.batch = "Batch is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (mode === "upload" && !form.fileName) e.file = "Please select a file";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    onSave({
      ...form,
      uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      downloads: initial?.downloads ?? 0,
      id: initial?.id ?? generateId(),
    }).finally(() => setSaving(false));
  };

  return (
    <div className="sm-overlay" onClick={onClose}>
      <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="sm-modal-header">
          <div className="sm-modal-title-row">
            <div className="sm-modal-icon">
              {mode === "upload" ? <Upload size={20} /> : <Pencil size={20} />}
            </div>
            <h2 className="sm-modal-title">
              {mode === "upload" ? "Upload New Material" : "Edit Material"}
            </h2>
          </div>
          <button className="sm-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="sm-modal-body">
          {/* Title */}
          <div className="sm-field">
            <label className="sm-label">Title *</label>
            <input
              className={`sm-input ${errors.title ? "sm-input--error" : ""}`}
              placeholder="e.g. Chapter 5 – Trigonometry Notes"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {errors.title && <span className="sm-error">{errors.title}</span>}
          </div>

          {/* Subject, Batch & Grade Inputs */}
          <div className="sm-field-row">
            <div className="sm-field">
              <label className="sm-label">Subject *</label>
              <input
                className={`sm-input ${errors.subject ? "sm-input--error" : ""}`}
                placeholder="e.g. Mathematics, Science..."
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              />
              {errors.subject && <span className="sm-error">{errors.subject}</span>}
            </div>
            <div className="sm-field">
              <label className="sm-label">Batch *</label>
              {batches && batches.length > 0 ? (
                <select
                  className="sm-input"
                  value={form.batchId || form.batch}
                  onChange={(e) => {
                    const bId = e.target.value;
                    const bObj = batches.find((b) => String(b.id) === bId || b.name === bId);
                    setForm((f) => ({
                      ...f,
                      batchId: bId,
                      batch: bObj ? bObj.name : bId,
                      grade: bObj ? bObj.grade || "Grade 10" : f.grade,
                      subject: bObj && bObj.subject ? bObj.subject : f.subject,
                    }));
                  }}
                >
                  {batches.map((b) => (
                    <option key={b.id || b.name} value={b.id || b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={`sm-input ${errors.batch ? "sm-input--error" : ""}`}
                  placeholder="e.g. Batch A"
                  value={form.batch}
                  onChange={(e) => set("batch", e.target.value)}
                />
              )}
              {errors.batch && <span className="sm-error">{errors.batch}</span>}
            </div>
            <div className="sm-field">
              <label className="sm-label">Grade</label>
              <input
                className="sm-input"
                placeholder="e.g. Grade 10"
                value={form.grade || "Grade 10"}
                onChange={(e) => set("grade", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="sm-field">
            <label className="sm-label">Description *</label>
            <textarea
              className={`sm-textarea ${errors.description ? "sm-input--error" : ""}`}
              placeholder="Brief description of the material…"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
            {errors.description && <span className="sm-error">{errors.description}</span>}
          </div>

          {/* File Upload Drop Area */}
          <div className="sm-field">
            <label className="sm-label">
              {mode === "upload" ? "File *" : "Replace File (optional)"}
            </label>
            <div
              className={`sm-file-drop ${errors.file ? "sm-file-drop--error" : ""}`}
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
                className="sm-file-input"
                onChange={handleFileChange}
              />
              {form.fileName ? (
                <div className="sm-file-selected" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileText size={22} color="#2D6BFF" />
                    <div>
                      <div className="sm-file-name" style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{form.fileName}</div>
                      <div className="sm-file-size" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{form.fileSize}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px" }}
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setForm((f) => ({ ...f, fileName: "", fileSize: "", fileType: "pdf", fileUrl: null }));
                    }}
                    title="Remove File"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="sm-file-placeholder">
                  <Upload size={24} color="#2D6BFF" />
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", margin: "4px 0" }}>Click to browse or drag & drop</p>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>PDF, DOC, PPT, XLS, ZIP — max 50 MB</span>
                </div>
              )}
            </div>
            {errors.file && <span className="sm-error">{errors.file}</span>}
          </div>
        </div>

        {/* Footer */}
        <div className="sm-modal-footer">
          <button className="sm-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="sm-btn-save" onClick={handleSubmit} disabled={saving}
            style={{ opacity: saving ? 0.75 : 1, cursor: saving ? "wait" : "pointer" }}>
            {saving
              ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginRight: 6 }} />Uploading…</>
              : mode === "upload" ? <><Upload size={15} /> Upload Material</> : <><Pencil size={15} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Delete Confirm Modal ──────────────────────────────────── */
const DeleteModal = ({ material, onClose, onConfirm }) => (
  <div className="sm-overlay" onClick={onClose}>
    <div className="sm-delete-modal" onClick={(e) => e.stopPropagation()}>
      <div className="sm-delete-icon">
        <Trash2 size={26} color="#ef4444" />
      </div>
      <h3 className="sm-delete-title">Delete Material?</h3>
      <p className="sm-delete-body">
        Are you sure you want to delete <strong>"{material.title}"</strong>?
        This action cannot be undone.
      </p>
      <div className="sm-delete-actions">
        <button className="sm-btn-cancel" onClick={onClose}>Cancel</button>
        <button className="sm-btn-delete" onClick={onConfirm}>
          <Trash2 size={15} /> Delete
        </button>
      </div>
    </div>
  </div>
);

/* ── Main Component ────────────────────────────────────────── */
const StudyMaterials = ({ materials: propMaterials, setMaterials: propSetMaterials, batches = [], students = [] }) => {
  const [localMaterials, setLocalMaterials] = useState(() => {
    try {
      const stored = localStorage.getItem("gw_materials_v2");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return initialMaterials;
  });

  const materials = propMaterials && propMaterials.length > 0 ? propMaterials : localMaterials;

  const setMaterials = (newMaterials) => {
    const next = typeof newMaterials === "function" ? newMaterials(materials) : newMaterials;
    if (propSetMaterials) {
      propSetMaterials(next);
    }
    setLocalMaterials(next);
    try {
      localStorage.setItem("gw_materials_v2", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch materials dynamically from Supabase & realtime sync
  useEffect(() => {
    let isMounted = true;
    const loadMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from("materials")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && isMounted) {
          const parsed = data.map((row) => {
            try {
              if (row.title && typeof row.title === "string" && row.title.startsWith("{")) {
                const parsedTitle = JSON.parse(row.title);
                return {
                  id: row.id,
                  subject: row.subject,
                  teacher: row.teacher,
                  flagged: row.flagged,
                  created_at: row.created_at,
                  ...parsedTitle,
                };
              }
            } catch (e) {}
            return {
              id: row.id,
              title: row.title,
              subject: row.subject,
              teacher: row.teacher,
              flagged: row.flagged,
              uploadDate: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              fileType: "pdf",
              fileName: row.title,
              fileSize: "1.2 MB",
              description: "Course study material.",
              batch: "All Batches",
              grade: "All Grades",
              downloads: 0,
            };
          });

          if (parsed.length > 0) {
            setMaterials(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
      }
    };

    loadMaterials();

    const materialsChannel = supabase
      .channel("teacher-materials-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "materials" }, () => {
        loadMaterials();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(materialsChannel);
    };
  }, []);

  const saveMaterials = (newMaterials) => {
    setMaterials(newMaterials);
  };

  const [searchQ, setSearchQ]           = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterBatch, setFilterBatch]   = useState("All");
  const [filterType, setFilterType]     = useState("All");
  const [modal, setModal]               = useState(null); // null | "upload" | { mode:"edit", material }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* Filtered + searched list */
  const filtered = useMemo(() => {
    let list = [...materials];
    if (filterSubject !== "All") list = list.filter((m) => m.subject === filterSubject);
    if (filterBatch !== "All")   list = list.filter((m) => m.batch === filterBatch);
    if (filterType !== "All")    list = list.filter((m) => m.fileType === filterType);
    if (searchQ.trim()) {
      const q = searchQ.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [materials, filterSubject, filterBatch, filterType, searchQ]);

  /* Group by subject */
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((m) => {
      if (!map[m.subject]) map[m.subject] = [];
      map[m.subject].push(m);
    });
    return map;
  }, [filtered]);

  /* CRUD handlers */
  const handleSave = async (data) => {
    // Resolve logged-in teacher name
    let teacherName = "Teacher";
    try {
      const raw = localStorage.getItem("gw_logged_teacher");
      if (raw) teacherName = JSON.parse(raw).name || teacherName;
    } catch (e) {}

    // Strip base64 fileUrl — never store it in the DB row (too large).
    // Keep it in local state only for the current session.
    const sessionFileUrl = data.fileUrl || null;

    // Generate a UUID client-side — required because the table's id column
    // has no DEFAULT gen_random_uuid() and must not be null.
    const newId = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

    const dbPayload = {
      id: newId,
      title: JSON.stringify({
        title:       data.title,
        description: data.description,
        fileName:    data.fileName,
        fileSize:    data.fileSize,
        fileType:    data.fileType,
        fileUrl:     null,            // never store base64 in DB
        batch:       data.batch,
        grade:       data.grade,
        uploadDate:  data.uploadDate,
        downloads:   data.downloads ?? 0,
      }),
      subject: data.subject,
      teacher: teacherName,
      flagged: false,
    };

    if (modal === "upload") {
      // ── INSERT ──────────────────────────────────────────────
      const { data: inserted, error: insertError } = await supabase
        .from("materials")
        .insert(dbPayload)
        .select()
        .single();

      if (insertError) {
        console.error("Materials insert error:", insertError);
        showToast(`Upload failed: ${insertError.message}`, "warning");
        setModal(null);
        return;
      }

      // Build local object from the saved row + keep session file URL
      const newMaterial = {
        id:          inserted.id,
        subject:     inserted.subject,
        teacher:     inserted.teacher,
        flagged:     inserted.flagged,
        created_at:  inserted.created_at,
        ...data,                       // spread form data (title, desc, etc.)
        fileUrl:     sessionFileUrl,   // restore base64 for in-session download
      };

      // Update teacher list immediately (no extra round-trip needed)
      setMaterials([newMaterial, ...materials]);
      showToast("Material uploaded successfully!");

      // Notifications (fire-and-forget — never block the upload)
      const currentTime = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      const notifMsg = `New Study Material: "${data.title}" uploaded for ${data.batch || "your batch"} (${data.subject}).`;

      supabase.from("notifications").insert([
        { type: `study-material:${teacherName}`, message: notifMsg, time: currentTime },
        { type: "batch",                          message: notifMsg, time: currentTime },
      ]).catch(() => {});

      try {
        const existing = JSON.parse(localStorage.getItem("gw_notifications_v3") || "[]");
        localStorage.setItem("gw_notifications_v3", JSON.stringify([{
          id: `notif_${Date.now()}`, type: "study-material",
          title: "New Study Material Uploaded", message: notifMsg,
          time: "Just now", date: new Date().toISOString(),
          read: false, batch: data.batch, subject: data.subject,
        }, ...existing]));
      } catch (e) {}

    } else {
      // ── UPDATE ──────────────────────────────────────────────
      const { error: updateError } = await supabase
        .from("materials")
        .update(dbPayload)
        .eq("id", data.id);

      if (updateError) {
        console.error("Materials update error:", updateError);
        showToast(`Update failed: ${updateError.message}`, "warning");
        setModal(null);
        return;
      }
        showToast(`Update failed: ${updateError.message}`, "warning");
        setModal(null);
        return;
      saveMaterials(materials.map((m) =>
        m.id === data.id ? { ...data, fileUrl: sessionFileUrl } : m
      ));
      showToast("Material updated successfully!");
    }

    setModal(null);
  };

  const handleDelete = async () => {
    saveMaterials(materials.filter((m) => m.id !== deleteTarget.id));
    showToast(`"${deleteTarget.title}" deleted.`, "warning");

    try {
      await supabase
        .from("materials")
        .delete()
        .eq("id", deleteTarget.id);
    } catch (err) {
      console.error("Failed to delete material from DB:", err);
    }

    setDeleteTarget(null);
  };

  const handleDownload = (material) => {
    saveMaterials(materials.map((m) => (m.id === material.id ? { ...m, downloads: (m.downloads || 0) + 1 } : m)));

    // Create a downloadable anchor link
    const link = document.createElement("a");
    if (material.fileUrl) {
      link.href = material.fileUrl;
    } else {
      const content = `GroWise Study Material\n\nTitle: ${material.title}\nSubject: ${material.subject}\nBatch: ${material.batch}\nGrade: ${material.grade}\nDescription: ${material.description}\nUpload Date: ${material.uploadDate}`;
      const blob = new Blob([content], { type: "application/pdf" });
      link.href = URL.createObjectURL(blob);
    }
    link.download = material.fileName || `${material.title || "material"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloaded "${material.fileName || material.title}"`);
  };

  const allSubjects = ["All", ...new Set(materials.map((m) => m.subject).filter(Boolean))];
  const allBatches = ["All", ...new Set(materials.map((m) => m.batch).filter(Boolean))];

  return (
    <div className="sm-page">
      {/* ── Toast ─────────────────────────────────────────── */}
      <Toast toast={toast} />

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="sm-page-header">
        <div>
          <h1 className="sm-page-title">Study Materials</h1>
          <p className="sm-page-sub">
            {materials.length} materials across {allSubjects.length - 1 || 1} subject{allSubjects.length - 1 !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="sm-upload-btn" onClick={() => setModal("upload")}>
          <Plus size={17} />
          Upload Material
        </button>
      </div>

      {/* ── Filter Bar ───────────────────────────────────── */}
      <div className="sm-filter-bar">
        {/* Search */}
        <div className="sm-search-wrap">
          <Search size={15} className="sm-search-icon" />
          <input
            className="sm-search-input"
            placeholder="Search by title or subject…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
          />
        </div>

        {/* Subject filter */}
        <div className="sm-filter-group">
          <Filter size={14} className="sm-filter-icon" />
          <div className="sm-select-wrap">
            <select
              className="sm-filter-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              {allSubjects.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Subjects" : s}</option>
              ))}
            </select>
            <ChevronDown size={13} className="sm-select-arrow" />
          </div>
        </div>

        {/* Batch filter */}
        <div className="sm-filter-group">
          <div className="sm-select-wrap">
            <select
              className="sm-filter-select"
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
            >
              {allBatches.map((b) => (
                <option key={b} value={b}>{b === "All" ? "All Batches" : b}</option>
              ))}
            </select>
            <ChevronDown size={13} className="sm-select-arrow" />
          </div>
        </div>

        {/* File type filter */}
        <div className="sm-filter-group">
          <div className="sm-select-wrap">
            <select
              className="sm-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="pdf">PDF</option>
              <option value="doc">DOC</option>
              <option value="ppt">PPT</option>
            </select>
            <ChevronDown size={13} className="sm-select-arrow" />
          </div>
        </div>

        {/* Active filter chips */}
        {(filterSubject !== "All" || filterBatch !== "All" || filterType !== "All" || searchQ) && (
          <button
            className="sm-clear-filters"
            onClick={() => { setFilterSubject("All"); setFilterBatch("All"); setFilterType("All"); setSearchQ(""); }}
          >
            <X size={13} /> Clear Filters
          </button>
        )}
      </div>

      {/* ── Material Grid (grouped by subject) ───────────── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="sm-empty">
          <FolderOpen size={48} color="var(--muted-light)" />
          <p className="sm-empty-title">No materials found</p>
          <p className="sm-empty-sub">Try adjusting your filters or upload a new material.</p>
          <button className="sm-upload-btn" onClick={() => setModal("upload")}>
           Upload Material
           <Plus size={16} />
          </button>
        </div>
      ) : (
        <div className="sm-subjects">
          {Object.entries(grouped).map(([subject, items]) => {
            const subInfo = SUBJECTS.find((s) => s.label === subject);
            const sc = subjectColorMap[subject] || subjectColorMap.Mathematics;
            return (
              <div key={subject} className="sm-subject-section">
                {/* Subject heading */}
                <div className="sm-subject-header">
                  <div className="sm-subject-icon" style={{ background: sc.bg, color: sc.text }}>
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h2 className="sm-subject-name" style={{ color: sc.text }}>{subject}</h2>
                    <p className="sm-subject-meta">
                      {subInfo?.batch} · {subInfo?.grade} · {items.length} material{items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="sm-subject-divider" style={{ background: sc.border }} />
                </div>

                {/* Cards grid */}
                <div className="sm-cards-grid">
                  {items.map((m) => (
                    <MaterialCard
                      key={m.id}
                      material={m}
                      onEdit={(mat) => setModal({ mode: "edit", material: mat })}
                      onDelete={(mat) => setDeleteTarget(mat)}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {modal === "upload" && (
        <MaterialModal
          mode="upload"
          initial={null}
          onClose={() => setModal(null)}
          onSave={handleSave}
          batches={batches}
          students={students}
        />
      )}
      {modal?.mode === "edit" && (
        <MaterialModal
          mode="edit"
          initial={modal.material}
          onClose={() => setModal(null)}
          onSave={handleSave}
          batches={batches}
          students={students}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          material={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default StudyMaterials;
