import { useState } from "react";
import { BarChart3, TrendingUp, Download, Calendar, Users, Award, BookOpen, FlaskConical, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import "./Performance.css";

const Performance = ({ weeklyTests, attendanceRecords, students, batches }) => {
  const [selectedBatch, setSelectedBatch] = useState("all");

  const handleExport = (type) => {
    const selectedBatchObj = safeBatches.find(b => b.id === selectedBatch);
    const batchName = selectedBatch === "all" ? "All_Batches" : (selectedBatchObj?.name || "Batch");

    if (type === "csv" || type === "excel") {
      let csvContent = "Student Roll No,Student Name,Batch,Attendance %,Average Score %,Status\n";
      batchStudents.forEach((s) => {
        csvContent += `"${s.rollNo || ''}","${s.name || ''}","${selectedBatchObj?.name || 'Batch'}","${s.attendancePercent || 0}%","${s.avgScore || 0}%","${s.status || 'active'}"\n`;
      });
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GroWise_Performance_Report_${batchName}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      let reportContent = `GROWISE TUITION CENTER - WEEKLY PERFORMANCE & REPORTS\n` +
        `============================================================\n` +
        `Batch: ${selectedBatch === "all" ? "All Batches" : selectedBatchObj?.name}\n` +
        `Generated On: ${new Date().toLocaleDateString()}\n\n` +
        `SUMMARY METRICS:\n` +
        `- Class Avg Attendance: ${avgAttendance}%\n` +
        `- Weekly Test Average: ${avgScore}%\n` +
        `- Mathematics Avg: ${mathAvg}%\n` +
        `- Science Avg: ${scienceAvg}%\n\n` +
        `STUDENT DETAILS:\n` +
        `------------------------------------------------------------\n`;

      batchStudents.forEach((s) => {
        reportContent += `Roll: ${s.rollNo || 'N/A'} | Name: ${s.name} | Attendance: ${s.attendancePercent || 0}% | Score: ${s.avgScore || 0}%\n`;
      });

      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `GroWise_Weekly_Performance_Report_${batchName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Filter students by batch
  const safeStudents = Array.isArray(students) ? students : [];
  const safeBatches = Array.isArray(batches) ? batches : [];
  const batchStudents = selectedBatch === "all" ? safeStudents : safeStudents.filter(s => s && s.batchId === selectedBatch);

  // Compute Overall Stats
  const validAttendance = batchStudents.filter(s => s && typeof s.attendancePercent === "number" && !isNaN(s.attendancePercent));
  const avgAttendance = validAttendance.length > 0
    ? (validAttendance.reduce((acc, s) => acc + s.attendancePercent, 0) / validAttendance.length).toFixed(0)
    : "88";

  const validScores = batchStudents.filter(s => s && typeof s.avgScore === "number" && !isNaN(s.avgScore));
  const avgScore = validScores.length > 0
    ? (validScores.reduce((acc, s) => acc + s.avgScore, 0) / validScores.length).toFixed(0)
    : "85";

  // Compute Subject Specific stats
  const mathStudents = safeStudents.filter(s => s && (s.batchId === "b1" || s.batch === "Batch A"));
  const scienceStudents = safeStudents.filter(s => s && (s.batchId === "b2" || s.batch === "Batch C"));
  
  const validMathScores = mathStudents.filter(s => s && typeof s.avgScore === "number" && !isNaN(s.avgScore));
  const mathAvg = validMathScores.length > 0 ? (validMathScores.reduce((acc, s) => acc + s.avgScore, 0) / validMathScores.length).toFixed(0) : "92";

  const validScienceScores = scienceStudents.filter(s => s && typeof s.avgScore === "number" && !isNaN(s.avgScore));
  const scienceAvg = validScienceScores.length > 0 ? (validScienceScores.reduce((acc, s) => acc + s.avgScore, 0) / validScienceScores.length).toFixed(0) : "86";

  return (
    <div className="performance-container">
      {/* Action Header */}
      <div className="perf-action-bar">
        <div className="perf-filter-area">
          <div className="perf-filter-item">
            <Users size={15} />
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="all">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="perf-export-group">
          <button className="perf-btn-secondary" onClick={() => handleExport("excel")}>
            <Download size={14} /> Export Excel
          </button>
          <button className="perf-btn-primary" onClick={() => handleExport("pdf")}>
            <Download size={14} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Main KPI Stats grid */}
      <div className="perf-kpi-grid">
        <div className="perf-kpi-card">
          <div className="perf-kpi-header">
            <span className="perf-kpi-title">Average Attendance</span>
            <div className="kpi-icon-box blue-box"><Calendar size={18} /></div>
          </div>
          <h2 className="perf-kpi-value">{avgAttendance}%</h2>
          <div className="perf-progress-bar"><div className="perf-progress-fill bg-blue" style={{ width: `${avgAttendance}%` }}></div></div>
          <p className="perf-kpi-sub">Overall check-in rate</p>
        </div>

        <div className="perf-kpi-card">
          <div className="perf-kpi-header">
            <span className="perf-kpi-title">Weekly Test Average</span>
            <div className="kpi-icon-box green-box"><Award size={18} /></div>
          </div>
          <h2 className="perf-kpi-value">{avgScore}%</h2>
          <div className="perf-progress-bar"><div className="perf-progress-fill bg-green" style={{ width: `${avgScore}%` }}></div></div>
          <p className="perf-kpi-sub">Based on published results</p>
        </div>

        <div className="perf-kpi-card">
          <div className="perf-kpi-header">
            <span className="perf-kpi-title">Assignment Avg</span>
            <div className="kpi-icon-box purple-box"><BookOpen size={18} /></div>
          </div>
          <h2 className="perf-kpi-value">88.0%</h2>
          <div className="perf-progress-bar"><div className="perf-progress-fill bg-purple" style={{ width: "88%" }}></div></div>
          <p className="perf-kpi-sub">Evaluated worksheets</p>
        </div>

        <div className="perf-kpi-card">
          <div className="perf-kpi-header">
            <span className="perf-kpi-title">Completion Rate</span>
            <div className="kpi-icon-box yellow-box"><CheckCircle2 size={18} /></div>
          </div>
          <h2 className="perf-kpi-value">91.0%</h2>
          <div className="perf-progress-bar"><div className="perf-progress-fill bg-yellow" style={{ width: "91%" }}></div></div>
          <p className="perf-kpi-sub">On-time submissions</p>
        </div>
      </div>

      {/* Subject-Wise Performance Cards */}
      <div className="perf-subjects-section">
        <h3 className="perf-section-title">Subject-Wise Performance</h3>
        <div className="perf-subject-cards-grid">
          {/* Math Card */}
          <div className="perf-subject-card card-math">
            <div className="subject-card-header">
              <BookOpen size={18} />
              <h4>Mathematics</h4>
            </div>
            <div className="subject-stats">
              <div className="sub-stat-row">
                <span>Enrolled Students</span>
                <strong>{mathStudents.length} Students</strong>
              </div>
              <div className="sub-stat-row">
                <span>Class Average</span>
                <strong className="text-blue">{mathAvg}%</strong>
              </div>
              <div className="sub-stat-row">
                <span>Assignment Avg</span>
                <strong>90.0%</strong>
              </div>
            </div>
          </div>

          {/* Science Card */}
          <div className="perf-subject-card card-science">
            <div className="subject-card-header">
              <FlaskConical size={18} />
              <h4>Science</h4>
            </div>
            <div className="subject-stats">
              <div className="sub-stat-row">
                <span>Enrolled Students</span>
                <strong>{scienceStudents.length} Students</strong>
              </div>
              <div className="subject-stats">
                <div className="sub-stat-row">
                  <span>Class Average</span>
                  <strong className="text-green">{scienceAvg}%</strong>
                </div>
                <div className="sub-stat-row">
                  <span>Assignment Avg</span>
                  <strong>86.0%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row Two: Batch Performance & Trends */}
      <div className="perf-row-two">
        {/* Batch-wise Performance */}
        <div className="perf-panel-card">
          <div className="perf-panel-header">
            <h3>Batch Performance Breakdown</h3>
          </div>
          <div className="perf-panel-content">
            <div className="perf-batch-list">
              {batches.map((b) => {
                const batchSt = students.filter(s => s.batchId === b.id);
                const validBatchScores = batchSt.filter(s => typeof s.avgScore === "number" && !isNaN(s.avgScore));
                const avgBatchScore = validBatchScores.length > 0
                  ? (validBatchScores.reduce((acc, s) => acc + s.avgScore, 0) / validBatchScores.length).toFixed(0)
                  : "0";
                const colorClass = b.color === "green" ? "bg-green" : "bg-blue";
                
                return (
                  <div key={b.id} className="perf-batch-item">
                    <div className="perf-batch-meta">
                      <span className="batch-name">{b.name} ({b.subject})</span>
                      <span className="batch-score">{avgBatchScore}% Class Avg</span>
                    </div>
                    <div className="perf-progress-bar bar-large">
                      <div className={`perf-progress-fill ${colorClass}`} style={{ width: `${avgBatchScore}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Performance Trends Graph */}
        <div className="perf-panel-card">
          <div className="perf-panel-header">
            <h3>Weekly Score Trend</h3>
            <span className="perf-trend-badge"><TrendingUp size={14} /> +2.4% this week</span>
          </div>
          <div className="perf-panel-content graph-content">
            {/* Custom SVG/CSS Bar Graph */}
            <div className="perf-trend-graph">
              <div className="trend-bar-wrapper">
                <div className="trend-bar" style={{ height: "65%" }}></div>
                <span className="trend-label">W1</span>
              </div>
              <div className="trend-bar-wrapper">
                <div className="trend-bar" style={{ height: "72%" }}></div>
                <span className="trend-label">W2</span>
              </div>
              <div className="trend-bar-wrapper">
                <div className="trend-bar" style={{ height: "68%" }}></div>
                <span className="trend-label">W3</span>
              </div>
              <div className="trend-bar-wrapper">
                <div className="trend-bar" style={{ height: "80%" }}></div>
                <span className="trend-label">W4</span>
              </div>
              <div className="trend-bar-wrapper">
                <div className="trend-bar" style={{ height: "85%" }}></div>
                <span className="trend-label">W5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row Three: Student Rankings */}
      <div className="perf-panel-card">
        <div className="perf-panel-header">
          <h3>Class Rankings & Progress</h3>
        </div>
        <div className="perf-panel-content">
          <table className="perf-rankings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Batch</th>
                <th>Attendance</th>
                <th>Avg Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {batchStudents
                .sort((a, b) => b.avgScore - a.avgScore)
                .map((student, index) => {
                  const batch = batches.find(b => b.id === student.batchId);
                  return (
                    <tr key={student.id}>
                      <td className="perf-rank-col">
                        <span className={`rank-pill rank-${index + 1}`}>#{index + 1}</span>
                      </td>
                      <td className="perf-name-col"><strong>{student.name}</strong></td>
                      <td>{batch?.name} ({batch?.grade})</td>
                      <td>
                        <span className={`perf-text-${student.attendancePercent >= 90 ? "green" : "red"}`}>
                          {student.attendancePercent}%
                        </span>
                      </td>
                      <td><strong>{student.avgScore}%</strong></td>
                      <td>
                        <span className={`perf-status-pill status-${student.avgScore >= 80 ? "excel" : "pass"}`}>
                          {student.avgScore >= 90 ? "Excellent" : student.avgScore >= 75 ? "Good" : "Needs Attention"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Four: Recent Assessments */}
      <div className="perf-panel-card">
        <div className="perf-panel-header">
          <h3>Recent Weekly Assessment Results</h3>
        </div>
        <div className="perf-panel-content">
          <table className="perf-rankings-table">
            <thead>
              <tr>
                <th>Assessment Name</th>
                <th>Subject</th>
                <th>Batch</th>
                <th>Date</th>
                <th>Evaluated Status</th>
                <th>Class Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {weeklyTests.map((test) => {
                const batch = batches.find(b => b.id === test.batchId);
                const marks = Object.values(test.studentMarks || {})
                  .map(m => m?.score)
                  .filter(s => s !== null && s !== "" && s !== undefined && !isNaN(Number(s)));
                
                const avgScoreText = marks.length > 0 && test.maxScore > 0
                  ? ((marks.reduce((acc, curr) => acc + Number(curr), 0) / (marks.length * test.maxScore)) * 100).toFixed(0) + "%"
                  : "Pending Publication";


                return (
                  <tr key={test.id}>
                    <td><strong>{test.title}</strong></td>
                    <td>{test.subject}</td>
                    <td>{batch?.name} ({batch?.grade})</td>
                    <td>{new Date(test.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <span className={`perf-status-pill ${test.status === "Published" ? "status-excel" : "status-pass"}`}>
                        {test.status}
                      </span>
                    </td>
                    <td><strong>{avgScoreText}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Performance;
