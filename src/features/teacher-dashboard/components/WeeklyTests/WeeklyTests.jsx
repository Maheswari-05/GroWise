import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Filter, BookOpen, FlaskConical, User, Calendar,
  CheckCircle2, AlertCircle, TrendingUp, BarChart2, Check, X,
  ArrowLeft, Upload, FileText, Eye, Download, Loader2, Pencil, Trash2, Paperclip
} from "lucide-react";
import * as adminService from "../../../../services/adminService";
import supabase from "../../../../lib/supabase";
import "./WeeklyTests.css";

// Filter weekly tests to only this teacher's own tests.
const filterTestsByTeacher = (tests) => {
  const loggedId = localStorage.getItem("gw_logged_teacher_id") || "";
  let name = "";
  let email = "";
  try {
    const raw = localStorage.getItem("gw_logged_teacher");
    if (raw) {
      const obj = JSON.parse(raw);
      name = obj.name || "";
      email = obj.email || "";
    }
  } catch (e) {}
  const norm = (v) => String(v || "").trim().toLowerCase();
  const ids = new Set([norm(loggedId)]);
  const names = new Set([norm(name), norm(email)].filter(Boolean));

  const list = Array.isArray(tests) ? tests : [];
  if (names.size === 0 && ids.size === 0) return list;

  return list.filter((t) => {
    if (!t) return false;
    const tId = norm(t.teacherId || t.teacher_id);
    if (tId && Array.from(ids).some((i) => i && i === tId)) return true;
    const tTeacher = norm(t.teacher);
    if (!tTeacher) return false;
    return Array.from(names).some((n) => n && (tTeacher === n || tTeacher.includes(n) || n.includes(tTeacher)));
  });
};

/* ── Delete Confirmation Modal ─────────────────────────────────────── */
const DeleteTestModal = ({ test, onClose, onConfirm }) => (
  <div className="wt-modal-overlay" onClick={onClose}>
    <div className="wt-modal" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
      <div className="wt-modal-header" style={{ borderBottom: "none", paddingBottom: "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ef4444" }}>
          <Trash2 size={24} />
          <h3 style={{ margin: 0, color: "#0f172a" }}>Delete Weekly Test?</h3>
        </div>
        <button className="wt-modal-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div style={{ padding: "16px 20px", color: "#475569", fontSize: "14px" }}>
        Are you sure you want to delete <strong>"{test.title}"</strong>? This action cannot be undone.
      </div>
      <div className="wt-modal-footer">
        <button type="button" className="wt-btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="wt-btn-primary"
          style={{ background: "#ef4444", borderColor: "#ef4444" }}
          onClick={onConfirm}
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  </div>
);

/* ── Create / Edit Test Modal ─────────────────────────────────────── */
const TestModal = ({ mode, initial, batches = [], onClose, onSave, subjects = [] }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [subject, setSubject] = useState(initial?.subject || subjects[0] || "Mathematics");
  const [batchId, setBatchId] = useState(initial?.batchId || batches[0]?.id || "");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split("T")[0]);
  const [maxScore, setMaxScore] = useState(initial?.maxScore || 20);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const pdfInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setUploading(true);

    try {
      let testPdfUrl = initial?.testPdfUrl || null;

      if (pdfFile) {
        // Read file as Data URL first
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result || null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(pdfFile);
        });

        testPdfUrl = dataUrl;

        // Also try storage upload
        try {
          const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          const path = `papers/${Date.now()}_${safeName}`;
          const uploadedUrl = await adminService.uploadTestFile(pdfFile, path);
          if (uploadedUrl) testPdfUrl = uploadedUrl;
        } catch (e) {}
      }

      await onSave({
        ...initial,
        title,
        subject,
        batchId,
        date,
        maxScore: Number(maxScore) || 20,
        testPdfUrl,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="wt-modal-overlay" onClick={onClose}>
      <div className="wt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wt-modal-header">
          <h3>{mode === "create" ? "Create Weekly Test" : "Edit Weekly Test"}</h3>
          <button className="wt-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="wt-form-group">
            <label>Test Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Trigonometry Test"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="wt-form-row">
            <div className="wt-form-group">
              <label>Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {subjects.length > 0
                  ? subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))
                  : ["Mathematics", "Science", "Physics", "Chemistry", "Biology", "English", "Social Studies"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
              </select>
            </div>

            <div className="wt-form-group">
              <label>Batch *</label>
              <select value={batchId} onChange={(e) => setBatchId(e.target.value)}>
                {batches.map((b) => (
                  <option key={b.id || b.name} value={b.id || b.name}>
                    {b.name} {b.grade ? `(${b.grade})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="wt-form-row">
            <div className="wt-form-group">
              <label>Test Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="wt-form-group">
              <label>Max Marks *</label>
              <input
                type="number"
                min="1"
                required
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </div>
          </div>

          {/* PDF Upload */}
          <div className="wt-form-group">
            <label>Upload Test Paper (PDF) <span className="wt-optional-tag">{mode === "edit" ? "replace optional" : "optional"}</span></label>
            <div
              className={`wt-pdf-upload-zone ${pdfFile || initial?.testPdfUrl ? "has-file" : ""}`}
              onClick={() => pdfInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type === "application/pdf") setPdfFile(file);
              }}
            >
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => setPdfFile(e.target.files[0] || null)}
              />
              {pdfFile ? (
                <div className="wt-pdf-file-info">
                  <FileText size={24} />
                  <span>{pdfFile.name}</span>
                  <button
                    type="button"
                    className="wt-pdf-remove-btn"
                    onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : initial?.testPdfUrl ? (
                <div className="wt-pdf-file-info">
                  <FileText size={24} color="#2D6BFF" />
                  <span>Attached Test Paper PDF</span>
                  <small style={{ color: "#2D6BFF" }}>Click to replace</small>
                </div>
              ) : (
                <div className="wt-pdf-upload-placeholder">
                  <Upload size={28} />
                  <span>Click or drag & drop a PDF here</span>
                  <small>Students will be able to download this test paper</small>
                </div>
              )}
            </div>
          </div>

          <div className="wt-modal-footer">
            <button type="button" className="wt-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="wt-btn-primary" disabled={uploading}>
              {uploading ? (
                <><Loader2 size={14} className="wt-spin" /> Saving...</>
              ) : mode === "create" ? (
                "Create Test"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main WeeklyTests Component ─────────────────────────────────────── */
const WeeklyTests = ({ weeklyTests = [], setWeeklyTests, students = [], batches = [], viewTestId = null, setViewTestId, subjects = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTestId, setActiveTestId] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null | "create" | { mode: "edit", test }
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Marks entry state
  const [tempMarks, setTempMarks] = useState({});
  const [tempRemarks, setTempRemarks] = useState({});
  const [publishingMarks, setPublishingMarks] = useState(false);

  const activeTest = (weeklyTests || []).find((t) => String(t?.id) === String(activeTestId));

  // Filter tests
  const filteredTests = (weeklyTests || []).filter((test) => {
    if (!test) return false;
    const title = test.title || test.name || "";
    const matchesSearch = title.toLowerCase().includes((searchQuery || "").toLowerCase());
    const matchesBatch = selectedBatch === "all" || String(test.batchId) === String(selectedBatch);
    const matchesSubject = selectedSubject === "all" || test.subject === selectedSubject;
    return matchesSearch && matchesBatch && matchesSubject;
  });

  // Automatically open marks/submissions entry if navigating from a notification
  useEffect(() => {
    if (viewTestId) {
      const target = (weeklyTests || []).find((t) => String(t.id) === String(viewTestId));
      if (target) {
        handleOpenMarksEntry(target);
        if (setViewTestId) setViewTestId(null);
      }
    }
  }, [viewTestId, weeklyTests]);

  // Real-time synchronization
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const dbTests = await adminService.fetchWeeklyTests();
        const myTests = filterTestsByTeacher(dbTests);
        if (isMounted && Array.isArray(myTests) && myTests.length > 0) {
          setWeeklyTests(myTests);
        }
      } catch (e) {}
    };
    fetchLatest();

    // NOTE: realtime updates for 'weekly_tests' are handled by the parent
    // TeacherDashboard subscription (pushed via setWeeklyTests). Removing this
    // duplicate subscription avoids re-downloading the whole table (which holds
    // large studentMarks JSON) on every change, inflating egress.
    return () => {
      isMounted = false;
    };
  }, [setWeeklyTests]);

  const handleOpenPdf = (url, fileName = "submission.pdf") => {
    if (!url) return;
    if (url.startsWith("data:")) {
      try {
        const parts = url.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
        const byteStr = atob(parts[1]);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
        const blob = new Blob([arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = fileName;
          a.target = "_blank";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      } catch (e) {
        console.error("Error opening data URL:", e);
        window.open(url, "_blank");
      }
    } else {
      window.open(url, "_blank");
    }
  };

  const handleOpenMarksEntry = async (test) => {
    if (!test) return;
    setActiveTestId(test.id);

    try {
      const freshTests = await adminService.fetchWeeklyTests();
      const myTests = filterTestsByTeacher(freshTests);
      if (Array.isArray(myTests)) {
        setWeeklyTests(myTests);
        const freshTest = myTests.find((t) => String(t.id) === String(test.id)) || test;
        const initialMarks = {};
        const initialRemarks = {};
        const batchStudents = getBatchStudents(test.batchId);
        batchStudents.forEach((student) => {
          const allMarks = freshTest.studentMarks || freshTest.student_marks || {};
          const record =
            allMarks[student.id] ||
            allMarks[String(student.id)] ||
            allMarks[student.student_id] ||
            allMarks[student.name] ||
            allMarks[student.email] ||
            {};
          initialMarks[student.id] = record.score ?? "";
          initialRemarks[student.id] = record.remarks ?? "";
        });
        setTempMarks(initialMarks);
        setTempRemarks(initialRemarks);
        return;
      }
    } catch (e) {}

    const initialMarks = {};
    const initialRemarks = {};
    const batchStudents = getBatchStudents(test.batchId);
    batchStudents.forEach((student) => {
      const allMarks = test.studentMarks || test.student_marks || {};
      const record =
        allMarks[student.id] ||
        allMarks[String(student.id)] ||
        allMarks[student.student_id] ||
        allMarks[student.name] ||
        allMarks[student.email] ||
        {};
      initialMarks[student.id] = record.score ?? "";
      initialRemarks[student.id] = record.remarks ?? "";
    });
    setTempMarks(initialMarks);
    setTempRemarks(initialRemarks);
  };

  const handleSaveMarks = async (publish = false) => {
    if (!activeTest) return;
    setPublishingMarks(true);

    try {
      const updatedMarks = { ...(activeTest.studentMarks || activeTest.student_marks || {}) };
      const batchStudents = getBatchStudents(activeTest.batchId);

      batchStudents.forEach((student) => {
        const scoreVal = tempMarks[student.id];
        const numScore = scoreVal === "" || scoreVal === null || scoreVal === undefined ? null : Number(scoreVal);
        const remarkText = tempRemarks[student.id] || "";

        // Find existing record in updatedMarks to preserve submissionUrl
        const existingRecord =
          updatedMarks[student.id] ||
          updatedMarks[String(student.id)] ||
          updatedMarks[student.student_id] ||
          updatedMarks[student.name] ||
          updatedMarks[student.email] ||
          Object.values(updatedMarks).find((m) => m && (m.studentName === student.name || m.submissionUrl)) ||
          {};

        const markRecord = {
          ...existingRecord,
          score: numScore,
          remarks: remarkText,
          studentName: student.name || existingRecord.studentName,
        };

        updatedMarks[student.id] = markRecord;
        if (student.student_id) updatedMarks[student.student_id] = markRecord;
        if (student.name) updatedMarks[student.name] = markRecord;
        if (student.email) updatedMarks[student.email] = markRecord;
      });

      const newStatus = publish
        ? "Published"
        : activeTest.status === "Published"
        ? "Published"
        : "Result Pending";

      const updatedTests = (weeklyTests || []).map((t) =>
        t.id === activeTest.id
          ? { ...t, studentMarks: updatedMarks, student_marks: updatedMarks, status: newStatus }
          : t
      );
      setWeeklyTests(updatedTests);

      // Persist to Supabase and localStorage
      try {
        localStorage.setItem("gw_weeklytests_v4", JSON.stringify(updatedTests));
      } catch {}

      await adminService.updateWeeklyTest(activeTest.id, {
        studentMarks: updatedMarks,
        status: newStatus,
      });

      // Send notifications to each student when publishing
      if (publish) {
        const maxScore = activeTest.maxScore || 20;
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        for (const student of batchStudents) {
          const mark = updatedMarks[student.id];
          if (mark && mark.score !== null && mark.score !== undefined) {
            const pct = Math.round((Number(mark.score) / maxScore) * 100);
            const notifMsg = `Your result for "${activeTest.title}" (${activeTest.subject || "Weekly Test"}) has been published: ${mark.score}/${maxScore} (${pct}%). ${mark.remarks ? "Remarks: " + mark.remarks : ""}`;
            try {
              const notifsToInsert = [
                {
                  type: `test-result:${student.id}`,
                  message: notifMsg,
                  time: currentTime,
                  recipient_type: "student",
                  recipient: `student:${student.id}`,
                }
              ];
              if (student.student_id && student.student_id !== student.id) {
                notifsToInsert.push({
                  type: `test-result:${student.student_id}`,
                  message: notifMsg,
                  time: currentTime,
                  recipient_type: "student",
                  recipient: `student:${student.student_id}`,
                });
              }
              await supabase.from("notifications").insert(notifsToInsert);
            } catch (err) {
              console.error("Failed to insert test result notification:", err);
            }
          }
        }
      }

      setActiveTestId(null);
    } finally {
      setPublishingMarks(false);
    }
  };

  const handleSaveTest = async (testData) => {
    if (modalMode === "create") {
      const batchStudents = (students || []).filter(
        (s) => s && String(s.batchId) === String(testData.batchId)
      );

      const studentMarks = {};
      batchStudents.forEach((s) => {
        studentMarks[s.id] = { score: null, remarks: "", submissionUrl: null };
      });

      // Resolve the logged-in teacher's identity so the created test is not
      // filtered out as "someone else's" test on the next refetch.
      let teacherId = localStorage.getItem("gw_logged_teacher_id") || "";
      let teacherName = "";
      let teacherEmail = "";
      try {
        const raw = localStorage.getItem("gw_logged_teacher");
        if (raw) {
          const obj = JSON.parse(raw);
          teacherName = obj.name || "";
          teacherEmail = obj.email || "";
        }
      } catch (e) {}
      if (!teacherName) teacherName = teacherId;

      const newTestData = {
        ...testData,
        status: "Result Pending",
        studentMarks,
        teacher: teacherName,
        teacherId,
        teacherEmail,
      };

      const saved = await adminService.addWeeklyTest(newTestData);
      const newTest = saved
        ? { ...newTestData, id: saved.id }
        : { ...newTestData, id: "t" + Date.now() };

      const nextTests = [newTest, ...(weeklyTests || [])];
      setWeeklyTests(nextTests);

      try {
        localStorage.setItem("gw_weeklytests_v4", JSON.stringify(nextTests));
      } catch {}

      // Dispatch Notification
      try {
        const loggedTeacherStr = localStorage.getItem("gw_logged_teacher");
        let teacherName = "Teacher";
        if (loggedTeacherStr) {
          try { teacherName = JSON.parse(loggedTeacherStr).name; } catch (e) {}
        }
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        await supabase.from("notifications").insert([
          {
            type: "weekly-test",
            message: `New Test Scheduled: ${testData.title} (${testData.subject})`,
            time: currentTime,
            recipient_type: "student",
            recipient: "all",
          },
          {
            type: "batch",
            message: `New Weekly Test "${testData.title}" (${testData.subject}) uploaded for ${testData.subject}.`,
            time: currentTime,
            recipient_type: "student",
            recipient: "all",
          }
        ]);
      } catch (err) {
        console.error("Failed to insert test notification:", err);
      }
    } else if (modalMode?.mode === "edit") {
      const updatedTests = (weeklyTests || []).map((t) =>
        t.id === testData.id ? { ...t, ...testData } : t
      );
      setWeeklyTests(updatedTests);

      try {
        localStorage.setItem("gw_weeklytests_v4", JSON.stringify(updatedTests));
      } catch {}

      await adminService.updateWeeklyTest(testData.id, testData);
    }
    setModalMode(null);
  };

  const handleDeleteTest = async () => {
    if (!deleteTarget) return;
    const nextTests = (weeklyTests || []).filter((t) => t.id !== deleteTarget.id);
    setWeeklyTests(nextTests);

    try {
      localStorage.setItem("gw_weeklytests_v4", JSON.stringify(nextTests));
    } catch {}

    await adminService.deleteWeeklyTest(deleteTarget.id);
    setDeleteTarget(null);
  };

  const getSubmissionCount = (test) => {
    if (!test) return 0;
    const allMarks = test.studentMarks || test.student_marks || {};
    return Object.values(allMarks).filter((m) => m && (m.submissionUrl || m.attachmentUrl)).length;
  };

  const getBatchStudents = (batchId) => {
    if (!batchId) return students || [];
    const bStr = String(batchId).trim().toLowerCase();
    const matched = (students || []).filter((s) => {
      if (!s) return false;
      const sBatchId = String(s.batchId || s.batch_id || s.batch || "").trim().toLowerCase();
      const sBatchName = String(s.batchName || "").trim().toLowerCase();
      return sBatchId === bStr || sBatchName === bStr;
    });
    return matched.length > 0 ? matched : (students || []);
  };

  return (
    <div className="weekly-tests-container">
      {/* 1. Marks Entry Panel */}
      {activeTest && (
        <div className="wt-marks-entry-panel">
          <div className="wt-panel-header">
            <button className="wt-back-btn" onClick={() => setActiveTestId(null)}>
              <ArrowLeft size={16} /> Back to tests
            </button>
            <div className="wt-panel-title-area">
              <h2>Enter / Edit Marks</h2>
              <p>
                {activeTest.title} ·{" "}
                {batches.find((b) => String(b.id) === String(activeTest.batchId))?.name || "Batch"} · Max Marks: {activeTest.maxScore}
              </p>
            </div>
          </div>

          <div className="wt-student-marks-list">
            <table className="wt-marks-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Answer Sheet</th>
                  <th>Marks (/{activeTest.maxScore})</th>
                  <th>Percentage</th>
                  <th>Remarks / Feedback</th>
                </tr>
              </thead>
              <tbody>
                {getBatchStudents(activeTest.batchId).map((student) => {
                  const score = tempMarks[student.id] ?? "";
                  const percentage =
                    score !== "" && !isNaN(score)
                      ? ((Number(score) / activeTest.maxScore) * 100).toFixed(0) + "%"
                      : "-";

                  const allMarks = activeTest.studentMarks || activeTest.student_marks || {};

                  // Find submission record with robust multi-field lookup
                  let studentRecord =
                    allMarks[student.id] ||
                    allMarks[String(student.id)] ||
                    allMarks[student.student_id] ||
                    allMarks[student.studentId] ||
                    allMarks[student.name] ||
                    allMarks[student.email] ||
                    allMarks[student.rollNo];

                  if (!studentRecord || (!studentRecord.submissionUrl && !studentRecord.attachmentUrl)) {
                    const foundEntry = Object.entries(allMarks).find(([k, v]) => {
                      if (!v) return false;
                      const kLow = String(k).toLowerCase().trim();
                      const sName = String(student.name || "").toLowerCase().trim();
                      const sEmail = String(student.email || "").toLowerCase().trim();
                      const sId = String(student.id || "").toLowerCase().trim();
                      const sId2 = String(student.student_id || "").toLowerCase().trim();

                      return (
                        (sId && kLow === sId) ||
                        (sId2 && kLow === sId2) ||
                        (sName && (kLow === sName || (v.studentName && v.studentName.toLowerCase().trim() === sName))) ||
                        (sEmail && kLow === sEmail)
                      );
                    });
                    if (foundEntry) studentRecord = foundEntry[1];
                  }

                  // Fallback: if only 1 student in batch and there is a submission in allMarks
                  if (!studentRecord || (!studentRecord.submissionUrl && !studentRecord.attachmentUrl)) {
                    const anySub = Object.values(allMarks).find((m) => m && (m.submissionUrl || m.attachmentUrl));
                    if (anySub) studentRecord = anySub;
                  }

                  const submissionUrl = studentRecord?.submissionUrl || studentRecord?.attachmentUrl;
                  const submissionName = studentRecord?.fileName || `${student.name}_Answer_Sheet.pdf`;

                  return (
                    <tr key={student.id}>
                      <td className="wt-col-roll">{student.rollNo || "-"}</td>
                      <td className="wt-col-name">{student.name}</td>
                      <td className="wt-col-submission">
                        {submissionUrl ? (
                          <button
                            type="button"
                            className="wt-view-submission-btn"
                            style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "#eff6ff",
                              border: "1px solid #bfdbfe",
                              borderRadius: "8px",
                              padding: "6px 12px",
                              color: "#2563eb",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                            onClick={() => handleOpenPdf(submissionUrl, submissionName)}
                          >
                            <Eye size={14} /> View PDF
                          </button>
                        ) : (
                          <span className="wt-no-submission">Not Submitted</span>
                        )}
                      </td>
                      <td className="wt-col-input">
                        <input
                          type="number"
                          min="0"
                          max={activeTest.maxScore}
                          value={score}
                          placeholder="—"
                          className="wt-marks-input"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || (Number(val) >= 0 && Number(val) <= activeTest.maxScore)) {
                              setTempMarks({ ...tempMarks, [student.id]: val });
                            }
                          }}
                        />
                      </td>
                      <td className="wt-col-percent">{percentage}</td>
                      <td className="wt-col-remarks">
                        <input
                          type="text"
                          value={tempRemarks[student.id] ?? ""}
                          placeholder="Add feedback / remarks"
                          className="wt-remarks-input"
                          onChange={(e) =>
                            setTempRemarks({ ...tempRemarks, [student.id]: e.target.value })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
                {getBatchStudents(activeTest.batchId).length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
                      No students found in this batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="wt-panel-actions">
            <button className="wt-btn-secondary" onClick={() => setActiveTestId(null)} disabled={publishingMarks}>
              Cancel
            </button>
            <button className="wt-btn-outline" onClick={() => handleSaveMarks(false)} disabled={publishingMarks}>
              {publishingMarks ? <Loader2 size={14} className="wt-spin" /> : null} Save as Draft
            </button>
            <button className="wt-btn-primary" onClick={() => handleSaveMarks(true)} disabled={publishingMarks}>
              {publishingMarks ? <Loader2 size={14} className="wt-spin" /> : <Check size={14} />}
              {publishingMarks ? " Publishing..." : " Publish Results"}
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Tests List */}
      {!activeTest && (
        <>
          <div className="wt-action-bar">
            <div className="wt-filters-container">
              <div className="wt-search-box">
                <Search size={16} className="wt-search-icon" />
                <input
                  type="text"
                  placeholder="Search weekly tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="wt-filter-dropdowns">
                <div className="wt-filter-item">
                  <Filter size={14} />
                  <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                    <option value="all">All Batches</option>
                    {batches.map((b) => (
                      <option key={b.id || b.name} value={b.id || b.name}>
                        {b.name} {b.grade ? `(${b.grade})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="wt-filter-item">
                  <BookOpen size={14} />
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="all">All Subjects</option>
                    {[...new Set((weeklyTests || []).map((t) => t.subject).filter(Boolean))].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button className="wt-create-btn" onClick={() => setModalMode("create")}>
              <Plus size={16} /> Create Weekly Test
            </button>
          </div>

          <div className="wt-cards-list">
            {filteredTests.length === 0 ? (
              <div className="wt-empty-state">
                <AlertCircle size={48} />
                <p>No weekly tests found. Create a new test to get started.</p>
              </div>
            ) : (
              filteredTests.map((test) => {
                const batch = batches.find((b) => String(b.id) === String(test.batchId) || b.name === test.batchId);
                const isPublished = test.status === "Published";
                const submissionCount = getSubmissionCount(test);
                const totalStudents = getBatchStudents(test.batchId).length;

                let dateDisplay = "Upcoming";
                if (test.date) {
                  const d = new Date(test.date);
                  dateDisplay = isNaN(d.getTime())
                    ? test.date
                    : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                }

                const allMarks = test.studentMarks || test.student_marks || {};
                const firstSub = Object.values(allMarks).find((m) => m && (m.submissionUrl || m.attachmentUrl));
                const firstSubUrl = firstSub?.submissionUrl || firstSub?.attachmentUrl;

                return (
                  <div key={test.id} className="wt-card">
                    <div className="wt-card-left">
                      <div className="wt-card-icon-box">
                        <span className="wt-card-icon">
                          {test.subject === "Mathematics" ? <BookOpen size={18} /> : <FlaskConical size={18} />}
                        </span>
                      </div>
                      <div className="wt-card-details">
                        <div className="wt-card-title-row">
                          <h3 className="wt-card-title">{test.title}</h3>
                          <span className={`wt-badge ${isPublished ? "wt-badge-published" : "wt-badge-pending"}`}>
                            {test.status}
                          </span>
                        </div>

                        <div className="wt-card-meta" style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                          <span><User size={14} /> {batch?.name || test.batchId || "Batch"} {batch?.grade ? `(${batch.grade})` : ""}</span>
                          <span><Calendar size={14} /> {dateDisplay}</span>
                          {test.testPdfUrl && (
                            <button
                              type="button"
                              onClick={() => handleOpenPdf(test.testPdfUrl, `${test.title}_Paper.pdf`)}
                              className="wt-paper-link"
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#2563eb", display: "inline-flex", alignItems: "center", gap: "4px", padding: 0 }}
                            >
                              <FileText size={13} /> Test Paper (PDF)
                            </button>
                          )}
                          {firstSubUrl && (
                            <button
                              type="button"
                              onClick={() => handleOpenPdf(firstSubUrl, firstSub?.fileName || `${test.title}_Answer_Sheet.pdf`)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#059669", display: "inline-flex", alignItems: "center", gap: "4px", padding: 0, fontWeight: 600 }}
                            >
                              <Eye size={13} /> Student Answer (PDF)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="wt-card-right">
                      <div className="wt-card-pending-block">
                        {isPublished ? (
                          <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "13px" }}>✓ Results Published</span>
                        ) : (
                          <>
                            <AlertCircle size={16} />
                            <span>Marks Pending</span>
                          </>
                        )}
                      </div>

                      <div className="wt-card-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {firstSubUrl && (
                          <button
                            type="button"
                            className="wt-btn-secondary"
                            onClick={() => handleOpenPdf(firstSubUrl, firstSub?.fileName || `${test.title}_Answer.pdf`)}
                            title="View Student's Submitted Answer PDF"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              background: "#ecfdf5",
                              color: "#059669",
                              borderColor: "#a7f3d0",
                              fontWeight: 600,
                            }}
                          >
                            <Eye size={14} /> View Student PDF
                          </button>
                        )}
                        <button className="wt-btn-primary" onClick={() => handleOpenMarksEntry(test)}>
                          {isPublished ? "Edit Marks" : "Enter Marks"}
                        </button>
                        <button
                          className="wt-btn-secondary"
                          onClick={() => setModalMode({ mode: "edit", test })}
                          title="Edit Test Details"
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          className="wt-btn-secondary"
                          style={{ color: "#ef4444", borderColor: "#fecaca", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          onClick={() => setDeleteTarget(test)}
                          title="Delete Test"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 4. Create / Edit Test Modal */}
      {modalMode === "create" && (
        <TestModal
          mode="create"
          initial={null}
          batches={batches}
          subjects={subjects}
          onClose={() => setModalMode(null)}
          onSave={handleSaveTest}
        />
      )}

      {modalMode?.mode === "edit" && (
        <TestModal
          mode="edit"
          initial={modalMode.test}
          batches={batches}
          subjects={subjects}
          onClose={() => setModalMode(null)}
          onSave={handleSaveTest}
        />
      )}

      {/* 5. Delete Test Modal */}
      {deleteTarget && (
        <DeleteTestModal
          test={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteTest}
        />
      )}
    </div>
  );
};

export default WeeklyTests;
