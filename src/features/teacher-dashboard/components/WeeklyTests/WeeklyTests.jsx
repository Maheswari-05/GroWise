import { useState, useRef } from "react";
import {
  Search, Plus, Filter, BookOpen, FlaskConical, User, Calendar,
  CheckCircle2, AlertCircle, TrendingUp, BarChart2, Check, X,
  ArrowLeft, Upload, FileText, Eye, Download, Loader2, Pencil, Trash2, Paperclip
} from "lucide-react";
import * as adminService from "../../../../services/adminService";
import supabase from "../../../../lib/supabase";
import "./WeeklyTests.css";

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
const TestModal = ({ mode, initial, batches = [], onClose, onSave }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [subject, setSubject] = useState(initial?.subject || "Mathematics");
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
        const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `papers/${Date.now()}_${safeName}`;
        const uploadedUrl = await adminService.uploadTestFile(pdfFile, path);
        if (uploadedUrl) testPdfUrl = uploadedUrl;
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
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Social Studies">Social Studies</option>
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
const WeeklyTests = ({ weeklyTests = [], setWeeklyTests, students = [], batches = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTestId, setActiveTestId] = useState(null);
  const [modalMode, setModalMode] = useState(null); // null | "create" | { mode: "edit", test }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewAnalysisTestId, setViewAnalysisTestId] = useState(null);

  // Marks entry state
  const [tempMarks, setTempMarks] = useState({});
  const [tempRemarks, setTempRemarks] = useState({});
  const [publishingMarks, setPublishingMarks] = useState(false);

  const activeTest = weeklyTests.find((t) => t.id === activeTestId);
  const analysisTest = weeklyTests.find((t) => t.id === viewAnalysisTestId);

  // Filter tests
  const filteredTests = (weeklyTests || []).filter((test) => {
    if (!test) return false;
    const title = test.title || test.name || "";
    const matchesSearch = title.toLowerCase().includes((searchQuery || "").toLowerCase());
    const matchesBatch = selectedBatch === "all" || String(test.batchId) === String(selectedBatch);
    const matchesSubject = selectedSubject === "all" || test.subject === selectedSubject;
    return matchesSearch && matchesBatch && matchesSubject;
  });

  const handleOpenMarksEntry = (test) => {
    if (!test) return;
    setActiveTestId(test.id);
    setViewAnalysisTestId(null);
    const initialMarks = {};
    const initialRemarks = {};
    const batchStudents = (students || []).filter((s) => s && String(s.batchId) === String(test.batchId));
    batchStudents.forEach((student) => {
      initialMarks[student.id] = test.studentMarks?.[student.id]?.score ?? "";
      initialRemarks[student.id] = test.studentMarks?.[student.id]?.remarks ?? "";
    });
    setTempMarks(initialMarks);
    setTempRemarks(initialRemarks);
  };

  const handleSaveMarks = async (publish = false) => {
    if (!activeTest) return;
    setPublishingMarks(true);

    try {
      const updatedMarks = { ...(activeTest.studentMarks || {}) };
      const batchStudents = (students || []).filter((s) => s && String(s.batchId) === String(activeTest.batchId));

      batchStudents.forEach((student) => {
        const scoreVal = tempMarks[student.id];
        updatedMarks[student.id] = {
          ...(updatedMarks[student.id] || {}),
          score: scoreVal === "" || scoreVal === null || scoreVal === undefined ? null : Number(scoreVal),
          remarks: tempRemarks[student.id] || "",
        };
      });

      const newStatus = publish
        ? "Published"
        : activeTest.status === "Published"
        ? "Published"
        : "Result Pending";

      const updatedTests = (weeklyTests || []).map((t) =>
        t.id === activeTest.id
          ? { ...t, studentMarks: updatedMarks, status: newStatus }
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
        for (const student of batchStudents) {
          const mark = updatedMarks[student.id];
          if (mark && mark.score !== null) {
            const pct = Math.round((mark.score / activeTest.maxScore) * 100);
            try {
              await adminService.addNotification({
                studentId: student.id,
                type: "test-result",
                text: `Your result for "${activeTest.title}" has been published: ${mark.score}/${activeTest.maxScore} (${pct}%). ${mark.remarks ? "Remarks: " + mark.remarks : ""}`,
                read: false,
              });
            } catch (_) {}
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

      const newTestData = {
        ...testData,
        status: "Result Pending",
        studentMarks,
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
            type: `weekly-test:${teacherName}`,
            message: `New Test Scheduled: ${testData.title} (${testData.subject})`,
            time: currentTime,
          },
          {
            type: "batch",
            message: `New Weekly Test "${testData.title}" uploaded for ${testData.subject}.`,
            time: currentTime,
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

  const getTestStats = (test) => {
    if (!test || !test.studentMarks) return { avgScore: 0, highestScore: 0, passRate: 0, totalGraded: 0 };
    const marksArray = Object.values(test.studentMarks || {})
      .map((m) => m?.score)
      .filter((s) => s !== null && s !== undefined && s !== "" && !isNaN(s));

    if (marksArray.length === 0) return { avgScore: 0, highestScore: 0, passRate: 0, totalGraded: 0 };

    const maxScore = test.maxScore || 20;
    const total = marksArray.reduce((acc, curr) => acc + Number(curr), 0);
    const avgScore = (total / marksArray.length).toFixed(1);
    const highestScore = Math.max(...marksArray.map(Number));
    const passed = marksArray.filter((s) => Number(s) >= maxScore * 0.5).length;
    const passRate = ((passed / marksArray.length) * 100).toFixed(0);

    return { avgScore, highestScore, passRate, totalGraded: marksArray.length };
  };

  const getSubmissionCount = (test) => {
    if (!test?.studentMarks) return 0;
    return Object.values(test.studentMarks).filter((m) => m?.submissionUrl).length;
  };

  const getBatchStudents = (batchId) =>
    (students || []).filter((s) => s && String(s.batchId) === String(batchId));

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
                {batches.find((b) => String(b.id) === String(activeTest.batchId))?.name || "Batch"} ·
                Max Marks: {activeTest.maxScore}
              </p>
              {activeTest.testPdfUrl && (
                <a
                  href={activeTest.testPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wt-pdf-link"
                >
                  <FileText size={14} /> View Test Paper (PDF)
                </a>
              )}
            </div>
          </div>

          <div className="wt-student-marks-list">
            <table className="wt-marks-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Submission</th>
                  <th>Marks (Max: {activeTest.maxScore})</th>
                  <th>%</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {getBatchStudents(activeTest.batchId).map((student) => {
                  const score = tempMarks[student.id] ?? "";
                  const percentage =
                    score !== "" && !isNaN(score)
                      ? ((Number(score) / activeTest.maxScore) * 100).toFixed(0) + "%"
                      : "-";
                  const allStudentMarks = activeTest.studentMarks || activeTest.student_marks || {};
                  const studentRecord =
                    allStudentMarks[student.id] ||
                    allStudentMarks[student.name] ||
                    allStudentMarks[student.email] ||
                    Object.values(allStudentMarks).find((m) => m && m.submissionUrl);
                  const submissionUrl = studentRecord?.submissionUrl;

                  return (
                    <tr key={student.id}>
                      <td className="wt-col-roll">{student.rollNo || "-"}</td>
                      <td className="wt-col-name">{student.name}</td>
                      <td className="wt-col-submission">
                        {submissionUrl ? (
                          <a
                            href={submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="wt-view-submission-btn"
                            title="View student submission"
                          >
                            <Eye size={14} /> View File
                          </a>
                        ) : (
                          <span className="wt-no-submission">Not submitted</span>
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
                          placeholder="Add feedback"
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

      {/* 2. Analysis View */}
      {analysisTest && (
        <div className="wt-analysis-panel">
          <div className="wt-panel-header">
            <button className="wt-back-btn" onClick={() => setViewAnalysisTestId(null)}>
              <ArrowLeft size={16} /> Back to tests
            </button>
            <div className="wt-panel-title-area">
              <h2>Test Analysis & Insights</h2>
              <p>
                {analysisTest.title} ·{" "}
                {batches.find((b) => String(b.id) === String(analysisTest.batchId))?.name || "Batch"}
              </p>
            </div>
          </div>

          {(() => {
            const stats = getTestStats(analysisTest);
            return (
              <div className="wt-analysis-content">
                <div className="wt-analysis-stats-grid">
                  <div className="wt-analysis-stat-card">
                    <span className="wt-stat-label">Class Average</span>
                    <h3 className="wt-stat-value">
                      {stats.avgScore} <span className="wt-stat-slash">/ {analysisTest.maxScore}</span>
                    </h3>
                    <p className="wt-stat-sub">Based on {stats.totalGraded} students</p>
                  </div>
                  <div className="wt-analysis-stat-card">
                    <span className="wt-stat-label">Highest Score</span>
                    <h3 className="wt-stat-value text-green">
                      {stats.highestScore} <span className="wt-stat-slash">/ {analysisTest.maxScore}</span>
                    </h3>
                    <p className="wt-stat-sub">Top mark in class</p>
                  </div>
                  <div className="wt-analysis-stat-card">
                    <span className="wt-stat-label">Pass Percentage</span>
                    <h3 className="wt-stat-value text-blue">{stats.passRate}%</h3>
                    <p className="wt-stat-sub">Min passing score: 50%</p>
                  </div>
                </div>

                <div className="wt-analysis-students-breakdown">
                  <h3>Marks Summary Breakdown</h3>
                  <table className="wt-analysis-table">
                    <thead>
                      <tr>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Submission</th>
                        <th>Marks</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getBatchStudents(analysisTest.batchId).map((student) => {
                        const record = analysisTest.studentMarks?.[student.id];
                        const score = record?.score;
                        const percentVal = score !== null && score !== undefined ? (score / analysisTest.maxScore) * 100 : null;
                        const isPass = percentVal !== null ? percentVal >= 50 : false;

                        return (
                          <tr key={student.id}>
                            <td>{student.rollNo || "-"}</td>
                            <td>{student.name}</td>
                            <td>
                              {record?.submissionUrl ? (
                                <a href={record.submissionUrl} target="_blank" rel="noopener noreferrer" className="wt-view-submission-btn">
                                  <Eye size={14} /> View
                                </a>
                              ) : (
                                <span className="wt-no-submission">—</span>
                              )}
                            </td>
                            <td>{score !== null && score !== undefined ? `${score} / ${analysisTest.maxScore}` : "Not Graded"}</td>
                            <td>{percentVal !== null ? `${percentVal.toFixed(0)}%` : "-"}</td>
                            <td>
                              {score !== null && score !== undefined ? (
                                <span className={`wt-badge ${isPass ? "wt-badge-published" : "wt-badge-pending"}`}>
                                  {isPass ? "Pass" : "Fail"}
                                </span>
                              ) : (
                                <span className="wt-badge-pending">Pending</span>
                              )}
                            </td>
                            <td className="wt-analysis-remark-text">{record?.remarks || "No remarks"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. Main Tests List */}
      {!activeTest && !analysisTest && (
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
                const stats = getTestStats(test);
                const submissionCount = getSubmissionCount(test);
                const totalStudents = getBatchStudents(test.batchId).length;

                let dateDisplay = "Upcoming";
                if (test.date) {
                  const d = new Date(test.date);
                  dateDisplay = isNaN(d.getTime())
                    ? test.date
                    : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                }

                return (
                  <div key={test.id} className="wt-card">
                    <div className="wt-card-left">
                      <div className="wt-card-icon-box">
                        <span className="wt-card-icon">
                          {test.subject === "Mathematics" ? <BookOpen size={18} /> : <FlaskConical size={18} />}
                        </span>
                      </div>
                      <div className="wt-card-details">
                        <div className="wt-card-title-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h3 className="wt-card-title">{test.title}</h3>
                            <span className={`wt-badge ${isPublished ? "wt-badge-published" : "wt-badge-pending"}`}>
                              {test.status}
                            </span>
                          </div>
                          {/* Card Action Buttons (Eye, Pencil, Trash2) like Assignments section */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              className="wt-btn-secondary"
                              style={{ padding: "5px 8px", fontSize: "12px" }}
                              onClick={() => handleOpenMarksEntry(test)}
                              title="View Submissions & Enter Marks"
                            >
                              <Eye size={14} /> View / Marks
                            </button>
                            <button
                              className="wt-btn-secondary"
                              style={{ padding: "5px 8px", fontSize: "12px" }}
                              onClick={() => setModalMode({ mode: "edit", test })}
                              title="Edit Test"
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              className="wt-btn-secondary"
                              style={{ padding: "5px 8px", fontSize: "12px", color: "#ef4444", borderColor: "#fecaca" }}
                              onClick={() => setDeleteTarget(test)}
                              title="Delete Test"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="wt-card-meta">
                          <span><User size={14} /> {batch?.name || test.batchId || "Batch"} {batch?.grade ? `(${batch.grade})` : ""}</span>
                          <span><Calendar size={14} /> {dateDisplay}</span>
                          {test.testPdfUrl && (
                            <a href={test.testPdfUrl} target="_blank" rel="noopener noreferrer" className="wt-paper-link">
                              <FileText size={13} /> Test Paper (PDF)
                            </a>
                          )}
                          {totalStudents > 0 && (
                            <span className="wt-submission-badge">
                              {submissionCount}/{totalStudents} submitted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="wt-card-right">
                      {isPublished ? (
                        <div className="wt-card-stats-block">
                          <div className="wt-card-stat">
                            <span className="wt-stat-label">CLASS AVG</span>
                            <span className="wt-stat-value text-blue">
                              {stats.avgScore} <span className="wt-stat-max">/{test.maxScore}</span>
                            </span>
                          </div>
                          <div className="wt-card-stat">
                            <span className="wt-stat-label">PASS RATE</span>
                            <span className="wt-stat-value text-green">{stats.passRate}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="wt-card-pending-block">
                          <AlertCircle size={16} />
                          <span>Marks Pending</span>
                        </div>
                      )}

                      <div className="wt-card-actions">
                        <button className="wt-btn-secondary" onClick={() => handleOpenMarksEntry(test)}>
                          {isPublished ? "Edit Marks" : "Enter Marks"}
                        </button>
                        {isPublished && (
                          <button className="wt-btn-primary" onClick={() => setViewAnalysisTestId(test.id)}>
                            <BarChart2 size={14} /> Analysis
                          </button>
                        )}
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
          onClose={() => setModalMode(null)}
          onSave={handleSaveTest}
        />
      )}

      {modalMode?.mode === "edit" && (
        <TestModal
          mode="edit"
          initial={modalMode.test}
          batches={batches}
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
