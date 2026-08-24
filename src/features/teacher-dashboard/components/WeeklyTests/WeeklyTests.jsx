import { useState, useRef, useEffect } from "react";
import {
  Search, Plus, Filter, BookOpen, FlaskConical, User, Calendar,
  CheckCircle2, AlertCircle, TrendingUp, BarChart2, Check, X,
  ArrowLeft, Upload, FileText, Eye, Download, Loader2, Pencil, Trash2, ClipboardList, Paperclip
} from "lucide-react";
import * as adminService from "../../../../services/adminService";
import supabase from "../../../../lib/supabase";
import "./WeeklyTests.css";

const WeeklyTests = ({ weeklyTests, setWeeklyTests, students, batches }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTestId, setActiveTestId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewAnalysisTestId, setViewAnalysisTestId] = useState(null);

  // Marks entry state
  const [tempMarks, setTempMarks] = useState({});
  const [tempRemarks, setTempRemarks] = useState({});
  const [publishingMarks, setPublishingMarks] = useState(false);
  const [wtToast, setWtToast] = useState(null); // { message, type }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const showWtToast = (message, type = "success") => {
    setWtToast({ message, type });
    setTimeout(() => setWtToast(null), 3000);
  };

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

  useEffect(() => {
    if (!activeTestId) return;
    const testObj = weeklyTests.find(t => t.id === activeTestId);
    if (!testObj) return;

    setViewAnalysisTestId(null);
    const initialMarks = {};
    const initialRemarks = {};
    const batchStudents = (students || []).filter((s) => s && String(s.batchId || s.batch_id || "") === String(testObj.batchId));
    batchStudents.forEach((student) => {
      initialMarks[student.id] = testObj.studentMarks?.[student.id]?.score ?? "";
      initialRemarks[student.id] = testObj.studentMarks?.[student.id]?.remarks ?? "";
    });
    setTempMarks(initialMarks);
    setTempRemarks(initialRemarks);
  }, [activeTestId, weeklyTests, students]);

  const handleOpenMarksEntry = (test) => {
    if (!test) return;
    setActiveTestId(test.id);
  };

  const handleSaveMarks = async (publish = false) => {
    if (!activeTest) return;
    setPublishingMarks(true);

    try {
      const updatedMarks = { ...(activeTest.studentMarks || {}) };
      const batchStudents = (students || []).filter((s) => s && String(s.batchId || s.batch_id || "") === String(activeTest.batchId));

      batchStudents.forEach((student) => {
        const scoreVal = tempMarks[student.id];
        const existingMark = updatedMarks[student.id] || {};
        updatedMarks[student.id] = {
          ...existingMark,
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
      } catch { }

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
              const currentTime = new Date().toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
              await supabase.from("notifications").insert({
                type: `test-result:${student.id}`,
                message: `Your result for "${activeTest.title}" has been published: ${mark.score}/${activeTest.maxScore} (${pct}%). ${mark.remarks ? "Remarks: " + mark.remarks : ""}`,
                time: currentTime
              });
            } catch (_) { }
          }
        }
      }

      setActiveTestId(null);
    } finally {
      setPublishingMarks(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    if (!newTestTitle.trim()) return;
    setUploading(true);

    try {
      let testPdfUrl = null;

      // Upload PDF if selected
      if (testPdfFile) {
        const safeName = testPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `papers/${Date.now()}_${safeName}`;
        testPdfUrl = await adminService.uploadTestFile(testPdfFile, path);
      }

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
      } catch { }

      // Dispatch Notification
      try {
        const loggedTeacherStr = localStorage.getItem("gw_logged_teacher");
        let teacherName = "Teacher";
        if (loggedTeacherStr) {
          try { teacherName = JSON.parse(loggedTeacherStr).name; } catch (e) { }
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
    } finally {
      setUploading(false);
    }
  };

  // Handle student submission upload from teacher's marks entry (teacher can see submitted files)
  // Student-side upload is handled in StudentDashboard

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
    (students || []).filter((s) => s && String(s.batchId || s.batch_id || "") === String(batchId));

  return (
    <div className="weekly-tests-container">
      {/* In-app toast */}
      {wtToast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          background: wtToast.type === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${wtToast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: wtToast.type === "error" ? "#dc2626" : "#16a34a",
          borderRadius: "10px", padding: "12px 20px", fontWeight: 600,
          fontSize: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", gap: "10px", maxWidth: "360px"
        }}>
          {wtToast.type === "error" ? "❌" : "✅"} {wtToast.message}
        </div>
      )}

      {/* Confirm delete dialog */}
      {confirmDeleteId && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9998,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: "14px", padding: "28px 32px",
            maxWidth: "380px", width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: "17px" }}>Delete Weekly Test?</h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 22px" }}>
              This action cannot be undone. The test and all associated marks will be permanently removed.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{ padding: "9px 22px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#374151", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ padding: "9px 22px", borderRadius: "8px", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Marks Entry Panel */}
      {activeTest && (
        <div className="wt-marks-entry-panel">
          <div className="wt-panel-header">
            <button className="wt-back-btn" onClick={() => setActiveTestId(null)}>
              <ArrowLeft size={16} /> Back to tests
            </button>
            <div className="wt-panel-title-area">
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ClipboardList size={22} />
                {activeTest.title}
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                {batches.find((b) => String(b.id) === String(activeTest.batchId))?.name || "Batch"}
                &nbsp;·&nbsp;Max Marks: {activeTest.maxScore}
                &nbsp;·&nbsp;
                <strong style={{ color: getSubmissionCount(activeTest) > 0 ? "#2563eb" : "#94a3b8" }}>
                  {getSubmissionCount(activeTest)} of {getBatchStudents(activeTest.batchId).length} submitted
                </strong>
              </p>
              {activeTest.testPdfUrl && (
                <button
                  onClick={() => {
                    const url = activeTest.testPdfUrl;
                    if (url.startsWith("data:")) {
                      const byteStr = atob(url.split(",")[1]);
                      const mime = url.split(",")[0].split(":")[1].split(";")[0];
                      const arr = new Uint8Array(byteStr.length);
                      for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
                      const blob = new Blob([arr], { type: mime });
                      const blobUrl = URL.createObjectURL(blob);
                      window.open(blobUrl, "_blank");
                      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                    } else {
                      window.open(url, "_blank");
                    }
                  }}
                  className="wt-pdf-link"
                  style={{ cursor: "pointer", background: "none", border: "none", padding: 0, display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "4px" }}
                >
                  <FileText size={14} /> View Question Paper (PDF)
                </button>
              )}
            </div>
          </div>

          <div className="wt-student-marks-list">
            <table className="wt-marks-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Submission</th>
                  <th>Marks (/{activeTest.maxScore})</th>
                  <th>%</th>
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
                  const submissionUrl = activeTest.studentMarks?.[student.id]?.submissionUrl;

                  return (
                    <tr
                      key={student.id}
                      style={{
                        background: hasSubmitted ? "#f0fdf4" : "transparent",
                        borderLeft: hasSubmitted ? "3px solid #22c55e" : "3px solid transparent",
                        transition: "background 0.2s"
                      }}
                    >
                      <td className="wt-col-name">
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 600 }}>{student.name}</span>
                          {hasSubmitted && submittedAt && (
                            <span style={{ fontSize: "11px", color: "#16a34a" }}>
                              Submitted {new Date(submittedAt).toLocaleString("en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true })}
                            </span>
                          )}
                          {!hasSubmitted && (
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Not yet submitted</span>
                          )}
                        </div>
                      </td>
                      <td className="wt-col-submission">
                        {submissionUrl ? (
                          <button
                            className="wt-view-submission-btn"
                            title="View student submission"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              cursor: "pointer", background: "#eff6ff",
                              border: "1px solid #bfdbfe", borderRadius: "8px",
                              padding: "6px 12px", color: "#2563eb", fontSize: "12px",
                              fontWeight: 600, transition: "all 0.2s"
                            }}
                            onClick={() => {
                              if (submissionUrl.startsWith("data:")) {
                                const byteStr = atob(submissionUrl.split(",")[1]);
                                const mime = submissionUrl.split(",")[0].split(":")[1].split(";")[0];
                                const arr = new Uint8Array(byteStr.length);
                                for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
                                const blob = new Blob([arr], { type: mime });
                                const url = URL.createObjectURL(blob);
                                window.open(url, "_blank");
                                setTimeout(() => URL.revokeObjectURL(url), 10000);
                              } else {
                                window.open(submissionUrl, "_blank");
                              }
                            }}
                          >
                            <Eye size={13} /> View Answer PDF
                          </button>
                        ) : (
                          <span className="wt-no-submission" style={{ color: "#94a3b8", fontSize: "12px" }}>
                            — Not submitted
                          </span>
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
                    <td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>
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
                  <div
                    key={test.id}
                    className="wt-card"
                    onClick={() => handleOpenMarksEntry(test)}
                    style={{ cursor: "pointer", transition: "box-shadow 0.2s, transform 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.13)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
                  >
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
                              <FileText size={13} /> Test Paper
                            </a>
                          )}
                          {/* Submission count pill — prominent */}
                          <span
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                              background: submissionCount > 0 ? "#eff6ff" : "#f1f5f9",
                              color: submissionCount > 0 ? "#2563eb" : "#94a3b8",
                              border: `1px solid ${submissionCount > 0 ? "#bfdbfe" : "#e2e8f0"}`
                            }}
                          >
                            {submissionCount > 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {submissionCount}/{totalStudents} submitted
                          </span>
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
                        <button
                          className="wt-btn-secondary"
                          onClick={(e) => { e.stopPropagation(); handleOpenMarksEntry(test); }}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
                        >
                          <Eye size={14} /> {isPublished ? "View & Edit Grades" : "View Submissions & Grade"}
                        </button>
                        <button
                          className="wt-btn-delete"
                          onClick={(e) => { e.stopPropagation(); handleDeleteTest(test.id); }}
                          style={{
                            background: "#fee2e2",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s"
                          }}
                          title="Delete test"
                        >
                          <Trash2 size={14} />
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
