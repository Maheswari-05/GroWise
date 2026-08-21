import { useState } from "react";
import { Search, Plus, Filter, BookOpen, FlaskConical, User, Calendar, CheckCircle2, AlertCircle, TrendingUp, BarChart2, Check, X, ArrowLeft } from "lucide-react";
import "./WeeklyTests.css";

const WeeklyTests = ({ weeklyTests, setWeeklyTests, students, batches }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTestId, setActiveTestId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewAnalysisTestId, setViewAnalysisTestId] = useState(null);

  // Form state for new test
  const [newTestTitle, setNewTestTitle] = useState("");
  const [newTestSubject, setNewTestSubject] = useState("Mathematics");
  const [newTestBatch, setNewTestBatch] = useState("b1");
  const [newTestDate, setNewTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTestMaxScore, setNewTestMaxScore] = useState(20);

  // Edit marks temporary state
  const [tempMarks, setTempMarks] = useState({}); // studentId -> score
  const [tempRemarks, setTempRemarks] = useState({}); // studentId -> remark

  const activeTest = weeklyTests.find((t) => t.id === activeTestId);
  const analysisTest = weeklyTests.find((t) => t.id === viewAnalysisTestId);

  // Filter tests
  const filteredTests = (weeklyTests || []).filter((test) => {
    if (!test) return false;
    const title = test.title || test.name || "";
    const matchesSearch = title.toLowerCase().includes((searchQuery || "").toLowerCase());
    const matchesBatch = selectedBatch === "all" || test.batchId === selectedBatch;
    const matchesSubject = selectedSubject === "all" || test.subject === selectedSubject;
    return matchesSearch && matchesBatch && matchesSubject;
  });

  const handleOpenMarksEntry = (test) => {
    if (!test) return;
    setActiveTestId(test.id);
    setViewAnalysisTestId(null);
    // Initialize temporary marks editing state
    const initialMarks = {};
    const initialRemarks = {};
    const batchStudents = (students || []).filter((s) => s && s.batchId === test.batchId);
    batchStudents.forEach((student) => {
      initialMarks[student.id] = test.studentMarks?.[student.id]?.score ?? "";
      initialRemarks[student.id] = test.studentMarks?.[student.id]?.remarks ?? "";
    });
    setTempMarks(initialMarks);
    setTempRemarks(initialRemarks);
  };

  const handleSaveMarks = (publish = false) => {
    if (!activeTest) return;

    const updatedMarks = { ...(activeTest.studentMarks || {}) };
    const batchStudents = (students || []).filter((s) => s && s.batchId === activeTest.batchId);

    batchStudents.forEach((student) => {
      const scoreVal = tempMarks[student.id];
      updatedMarks[student.id] = {
        score: scoreVal === "" || scoreVal === null || scoreVal === undefined ? null : Number(scoreVal),
        remarks: tempRemarks[student.id] || ""
      };
    });

    const updatedTests = (weeklyTests || []).map((t) => {
      if (t.id === activeTest.id) {
        return {
          ...t,
          studentMarks: updatedMarks,
          status: publish ? "Published" : t.status === "Published" ? "Published" : "Result Pending"
        };
      }
      return t;
    });

    setWeeklyTests(updatedTests);
    setActiveTestId(null);
  };

  const handleCreateTest = (e) => {
    e.preventDefault();
    if (!newTestTitle.trim()) return;

    const newTest = {
      id: "t" + ((weeklyTests || []).length + 1),
      title: newTestTitle,
      subject: newTestSubject,
      batchId: newTestBatch,
      date: newTestDate,
      maxScore: Number(newTestMaxScore) || 20,
      status: "Result Pending",
      studentMarks: {}
    };

    // Initialize empty marks for students in the batch
    const batchStudents = (students || []).filter((s) => s && s.batchId === newTestBatch);
    batchStudents.forEach((student) => {
      newTest.studentMarks[student.id] = { score: null, remarks: "" };
    });

    setWeeklyTests([newTest, ...(weeklyTests || [])]);
    setShowCreateModal(false);
    setNewTestTitle("");
  };

  // Get test stats for analysis
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
    
    // Pass mark is 50%
    const passed = marksArray.filter((s) => Number(s) >= maxScore * 0.5).length;
    const passRate = ((passed / marksArray.length) * 100).toFixed(0);

    return {
      avgScore,
      highestScore,
      passRate,
      totalGraded: marksArray.length
    };
  };

  return (
    <div className="weekly-tests-container">
      {/* 1. Details/Marks Entry View */}
      {activeTest && (
        <div className="wt-marks-entry-panel">
          <div className="wt-panel-header">
            <button className="wt-back-btn" onClick={() => setActiveTestId(null)}>
              <ArrowLeft size={16} /> Back to tests
            </button>
            <div className="wt-panel-title-area">
              <h2>Enter/Edit Marks</h2>
              <p>{activeTest.title} · {batches.find(b => b.id === activeTest.batchId)?.name} · Max Marks: {activeTest.maxScore}</p>
            </div>
          </div>

          <div className="wt-student-marks-list">
            <table className="wt-marks-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Marks Obtained (Max: {activeTest.maxScore})</th>
                  <th>Percentage</th>
                  <th>Teacher Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students
                  .filter((s) => s.batchId === activeTest.batchId)
                  .map((student) => {
                    const score = tempMarks[student.id] ?? "";
                    const percentage = score !== "" && !isNaN(score)
                      ? ((Number(score) / activeTest.maxScore) * 100).toFixed(0) + "%"
                      : "-";

                    return (
                      <tr key={student.id}>
                        <td className="wt-col-roll">{student.rollNo}</td>
                        <td className="wt-col-name">{student.name}</td>
                        <td className="wt-col-input">
                          <input
                            type="number"
                            min="0"
                            max={activeTest.maxScore}
                            value={score}
                            placeholder="Enter marks"
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
                            placeholder="Add student feedback"
                            className="wt-remarks-input"
                            onChange={(e) => setTempRemarks({ ...tempRemarks, [student.id]: e.target.value })}
                          />
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="wt-panel-actions">
            <button className="wt-btn-secondary" onClick={() => setActiveTestId(null)}>
              Cancel
            </button>
            <button className="wt-btn-outline" onClick={() => handleSaveMarks(false)}>
              Save as Draft
            </button>
            <button className="wt-btn-primary" onClick={() => handleSaveMarks(true)}>
              Publish Results
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
              <p>{analysisTest.title} · {batches.find(b => b.id === analysisTest.batchId)?.name}</p>
            </div>
          </div>

          {(() => {
            const stats = getTestStats(analysisTest);
            return (
              <div className="wt-analysis-content">
                <div className="wt-analysis-stats-grid">
                  <div className="wt-analysis-stat-card">
                    <span className="wt-stat-label">Class Average</span>
                    <h3 className="wt-stat-value">{stats.avgScore} <span className="wt-stat-slash">/ {analysisTest.maxScore}</span></h3>
                    <p className="wt-stat-sub">Based on {stats.totalGraded} students</p>
                  </div>
                  <div className="wt-analysis-stat-card">
                    <span className="wt-stat-label">Highest Score</span>
                    <h3 className="wt-stat-value text-green">{stats.highestScore} <span className="wt-stat-slash">/ {analysisTest.maxScore}</span></h3>
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
                        <th>Marks</th>
                        <th>Percentage</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .filter((s) => s.batchId === analysisTest.batchId)
                        .map((student) => {
                          const record = analysisTest.studentMarks[student.id];
                          const score = record?.score;
                          const percentVal = score !== null ? (score / analysisTest.maxScore) * 100 : null;
                          const isPass = percentVal !== null ? percentVal >= 50 : false;

                          return (
                            <tr key={student.id}>
                              <td>{student.rollNo}</td>
                              <td>{student.name}</td>
                              <td>{score !== null ? `${score} / ${analysisTest.maxScore}` : "Not Graded"}</td>
                              <td>{percentVal !== null ? `${percentVal.toFixed(0)}%` : "-"}</td>
                              <td>
                                {score !== null ? (
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

      {/* 3. Main Tests List View */}
      {!activeTest && !analysisTest && (
        <>
          {/* Header Action Bar */}
          <div className="wt-action-bar">
            {/* Search & Filters */}
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
                      <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                    ))}
                  </select>
                </div>

                <div className="wt-filter-item">
                  <BookOpen size={14} />
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="all">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Create Test Button */}
            <button className="wt-create-btn" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Weekly Test
            </button>
          </div>

          {/* Test Cards List */}
          <div className="wt-cards-list">
            {filteredTests.length === 0 ? (
              <div className="wt-empty-state">
                <AlertCircle size={48} />
                <p>No weekly tests found. Create a new test or adjust filters.</p>
              </div>
            ) : (
              filteredTests.map((test) => {
                const batch = batches.find((b) => b.id === test.batchId);
                const isPublished = test.status === "Published";
                const stats = getTestStats(test);

                return (
                  <div key={test.id} className="wt-card">
                    {/* Left: Icon & Info */}
                    <div className="wt-card-left">
                      <div className="wt-card-icon-box">
                        <span className="wt-card-icon">{test.subject === "Mathematics" ? <BookOpen size={18} /> : <FlaskConical size={18} />}</span>
                      </div>
                      <div className="wt-card-details">
                        <div className="wt-card-title-row">
                          <h3 className="wt-card-title">{test.title}</h3>
                          <span className={`wt-badge ${isPublished ? "wt-badge-published" : "wt-badge-pending"}`}>
                            {test.status}
                          </span>
                        </div>
                        <div className="wt-card-meta">
                          <span><User size={14} /> {batch?.name || "Batch"} ({batch?.grade || "All Grades"})</span>
                          <span><Calendar size={14} /> {test.date ? (isNaN(new Date(test.date).getTime()) ? test.date : new Date(test.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })) : "Upcoming"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics & Operations */}
                    <div className="wt-card-right">
                      {isPublished ? (
                        <div className="wt-card-stats-block">
                          <div className="wt-card-stat">
                            <span className="wt-stat-label">CLASS AVG</span>
                            <span className="wt-stat-value text-blue">{stats.avgScore} <span className="wt-stat-max">/{test.maxScore}</span></span>
                          </div>
                          <div className="wt-card-stat">
                            <span className="wt-stat-label">PASS RATE</span>
                            <span className="wt-stat-value text-green">{stats.passRate}%</span>
                          </div>
                        </div>
                      ) : (
                        <div className="wt-card-pending-block">
                          <AlertCircle size={16} />
                          <span>Marks Pending Entry</span>
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

      {/* 4. Create Weekly Test Modal */}
      {showCreateModal && (
        <div className="wt-modal-overlay">
          <div className="wt-modal">
            <div className="wt-modal-header">
              <h3>Create Weekly Test</h3>
              <button className="wt-modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTest}>
              <div className="wt-form-group">
                <label>Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Trigonometry Test"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                />
              </div>

              <div className="wt-form-row">
                <div className="wt-form-group">
                  <label>Subject</label>
                  <select value={newTestSubject} onChange={(e) => setNewTestSubject(e.target.value)}>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div className="wt-form-group">
                  <label>Batch</label>
                  <select value={newTestBatch} onChange={(e) => setNewTestBatch(e.target.value)}>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="wt-form-row">
                <div className="wt-form-group">
                  <label>Test Date</label>
                  <input
                    type="date"
                    required
                    value={newTestDate}
                    onChange={(e) => setNewTestDate(e.target.value)}
                  />
                </div>

                <div className="wt-form-group">
                  <label>Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTestMaxScore}
                    onChange={(e) => setNewTestMaxScore(e.target.value)}
                  />
                </div>
              </div>

              <div className="wt-modal-footer">
                <button type="button" className="wt-btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="wt-btn-primary">
                  Create Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTests;
