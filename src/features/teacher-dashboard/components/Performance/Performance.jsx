import { useState } from "react";
import { BarChart3, TrendingUp, Download, Calendar, Users, Award, BookOpen, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import "./Performance.css";

const Performance = ({ weeklyTests, attendanceRecords, students, batches }) => {
  const [selectedBatch, setSelectedBatch] = useState("all");

  const handleExport = (type) => {
    alert(`Exporting performance report as ${type.toUpperCase()}...\nYour download will begin shortly.`);
    
    // Simulate file download
    const content = `GroWise Tuition Center - Performance Report\n` +
      `Batch: ${selectedBatch === "all" ? "All Batches" : batches.find(b => b.id === selectedBatch)?.name}\n` +
      `Export Date: ${new Date().toLocaleDateString()}\n\n` +
      `Key Metrics:\n` +
      `- Class Avg Attendance: 88.2%\n` +
      `- Weekly Test Average: 84.5%\n` +
      `- Assignment Score Average: 88.0%\n` +
      `- Assignment Submission Rate: 91.0%\n`;
      
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `GroWise_Performance_Report_${selectedBatch}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter students by batch
  const batchStudents = selectedBatch === "all" ? students : students.filter(s => s.batchId === selectedBatch);

  // Compute Overall Stats
  const avgAttendance = (batchStudents.reduce((acc, s) => acc + s.attendancePercent, 0) / batchStudents.length).toFixed(0);
  const avgScore = (batchStudents.reduce((acc, s) => acc + s.avgScore, 0) / batchStudents.length).toFixed(0);

  // Compute Subject Specific stats
  const mathStudents = students.filter(s => s.batchId === "b1");
  const scienceStudents = students.filter(s => s.batchId === "b2");
  
  const mathAvg = mathStudents.length > 0 ? (mathStudents.reduce((acc, s) => acc + s.avgScore, 0) / mathStudents.length).toFixed(0) : "0";
  const scienceAvg = scienceStudents.length > 0 ? (scienceStudents.reduce((acc, s) => acc + s.avgScore, 0) / scienceStudents.length).toFixed(0) : "0";

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
              <span className="subject-icon">📐</span>
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
              <span className="subject-icon">🔬</span>
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
                const avgBatchScore = (batchSt.reduce((acc, s) => acc + s.avgScore, 0) / batchSt.length).toFixed(0);
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
                const marks = Object.values(test.studentMarks)
                  .map(m => m.score)
                  .filter(s => s !== null && s !== "");
                
                const avgScoreText = marks.length > 0 
                  ? ((marks.reduce((acc, curr) => acc + curr, 0) / (marks.length * test.maxScore)) * 100).toFixed(0) + "%"
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
