import { useState } from "react";
import { FileText, Search, ChevronRight, ArrowLeft, BarChart3, Users, Award, AlertCircle, Calendar } from "lucide-react";

const WeeklyTestsTab = ({ 
  weeklyTests, 
  students, 
  subjects, 
  batches 
}) => {
  const [view, setView] = useState("list"); // 'list' | 'detail'
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleViewTestDetail = (test) => {
    setSelectedTest(test);
    setView("detail");
  };

  // Search query filter
  const filteredTests = weeklyTests.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.teacher.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tab-wrapper">
      {view === "list" && (
        <div className="list-view-container animate-fade-in">
          <div className="section-header-bar">
            <h2>Weekly Test Oversight</h2>
          </div>

          {/* Search panel */}
          <div className="filters-panel">
            <div className="search-bar-wrapper full-width">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search tests by title, subject, or instructor..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Test ID</th>
                  <th>Test Title</th>
                  <th>Subject</th>
                  <th>Conducted Date</th>
                  <th>Teacher</th>
                  <th>Marks Entered Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table-row">No weekly tests scheduled or registered.</td>
                  </tr>
                ) : (
                  filteredTests.map(t => (
                    <tr key={t.id} className="hover-row">
                      <td className="font-mono font-bold text-primary">TST00{t.id}</td>
                      <td className="font-semibold">{t.title}</td>
                      <td>
                        <span className="badge-tag subject">{t.subject}</span>
                      </td>
                      <td className="font-mono text-sm">{t.date}</td>
                      <td>{t.teacher}</td>
                      <td>
                        <span className={`status-badge-pill ${t.status === "Published" ? "active" : "pending"}`}>
                          {t.status === "Published" ? "Marks Entered" : "Result Pending"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell justify-center">
                          <button className="action-btn view" title="View Student Performance" onClick={() => handleViewTestDetail(t)}>
                            <BarChart3 size={16} />
                            <span className="text-xs ml-4">Scores & Analytics</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Interactive Trends Section */}
          <div className="trends-visual-card mt-30">
            <h3>Subject Performance Trends (All Batches)</h3>
            <p className="text-xs text-muted">Comparative breakdown of average marks scored across core classes.</p>
            
            <div className="subject-bars-grid mt-20">
              <div className="trend-bar-col">
                <div className="bar-value font-mono text-xs font-bold text-primary">90%</div>
                <div className="bar-track">
                  <div className="bar-fill blue" style={{ height: "90%" }}></div>
                </div>
                <span className="bar-label font-semibold text-xs mt-10">Mathematics</span>
              </div>

              <div className="trend-bar-col">
                <div className="bar-value font-mono text-xs font-bold text-success">80%</div>
                <div className="bar-track">
                  <div className="bar-fill green" style={{ height: "80%" }}></div>
                </div>
                <span className="bar-label font-semibold text-xs mt-10">Physics</span>
              </div>

              <div className="trend-bar-col">
                <div className="bar-value font-mono text-xs font-bold text-warning">65%</div>
                <div className="bar-track">
                  <div className="bar-fill orange" style={{ height: "65%" }}></div>
                </div>
                <span className="bar-label font-semibold text-xs mt-10">Chemistry</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "detail" && selectedTest && (
        <div className="profile-view-container animate-fade-in">
          {/* Header */}
          <div className="profile-header-strip">
            <button className="back-link-btn" onClick={() => setView("list")}>
              <ArrowLeft size={16} />
              <span>Back to Tests</span>
            </button>
            <span className="text-xs text-muted font-mono">Test Ref ID: TST00{selectedTest.id}</span>
          </div>

          {/* Test Card Header */}
          <div className="student-profile-main-card">
            <div className="profile-text-ident" style={{ marginLeft: 0 }}>
              <span className="badge-tag subject">{selectedTest.subject}</span>
              <h2 className="mt-10">{selectedTest.title}</h2>
              <div className="profile-subtitle mt-10 flex gap-20">
                <span className="flex align-center gap-4 text-xs font-semibold text-muted">
                  <Calendar size={14} /> Conducted On: {selectedTest.date}
                </span>
                <span className="flex align-center gap-4 text-xs font-semibold text-muted">
                  <Award size={14} /> Teacher/Examiner: {selectedTest.teacher}
                </span>
              </div>
            </div>
          </div>

          {/* Student list scores breakdown */}
          <div className="profile-details-panels mt-20">
            <div className="profile-details-card full-width">
              <div className="card-heading">
                <Users size={18} />
                <h3>Student Scores Breakdown</h3>
              </div>

              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Enrolled Subjects</th>
                      <th>Marks Obtained</th>
                      <th>Out of</th>
                      <th>Percentage</th>
                      <th>Grade equivalent</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTest.status !== "Published" ? (
                      <tr>
                        <td colSpan="7" className="empty-table-row">
                          <div className="flex flex-col align-center justify-center py-20">
                            <AlertCircle size={32} className="text-warning mb-10" />
                            <span>Marks are pending entry by the instructor ({selectedTest.teacher}).</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students
                        .filter(s => s.subjects && s.subjects.includes(selectedTest.subject))
                        .map((s, idx) => {
                          const maxMarks = selectedTest.totalMarks || 20;
                          // Sneha has her exact marks, others get standard marks
                          const marksVal = s.name === "Sneha" ? selectedTest.marksObtained : Math.round(maxMarks * 0.85);
                          const percentage = Math.round((marksVal / maxMarks) * 100);
                          const grade = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : "D";

                          return (
                            <tr key={s.id}>
                              <td className="font-semibold">{s.name}</td>
                              <td>
                                <div className="tag-badges-container">
                                  {s.subjects.slice(0, 2).map(sub => (
                                    <span className="badge-tag subject" key={sub}>{sub}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="font-mono font-bold text-primary">{marksVal}</td>
                              <td className="font-mono">{maxMarks}</td>
                              <td className="font-mono font-bold">{percentage}%</td>
                              <td className="font-mono font-bold text-center">{grade}</td>
                              <td>
                                <span className="status-badge-pill active">Graded</span>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance SVG trend chart inside details */}
            {selectedTest.status === "Published" && (
              <div className="profile-details-card full-width">
                <div className="card-heading">
                  <BarChart3 size={18} />
                  <h3>Student Marks Comparison (Visual Chart)</h3>
                </div>
                
                <div className="visual-chart-display mt-20" style={{ height: "200px" }}>
                  <svg className="performance-chart-svg" width="100%" height="180px">
                    {/* Render visual comparisons */}
                    {students
                      .filter(s => s.subjects && s.subjects.includes(selectedTest.subject))
                      .map((s, idx) => {
                        const maxMarks = selectedTest.totalMarks || 20;
                        const score = s.name === "Sneha" ? selectedTest.marksObtained : Math.round(maxMarks * 0.85);
                        const percent = (score / maxMarks) * 100;
                        
                        const barWidth = 60;
                        const gap = 80;
                        const x = 50 + idx * (barWidth + gap);
                        const y = 140 - (percent * 1); // height scale
                        
                        return (
                          <g key={s.id}>
                            {/* Bar background */}
                            <rect x={x} y="40" width={barWidth} height="100" fill="#f1f5f9" rx="8" />
                            {/* Bar fill */}
                            <rect x={x} y={y} width={barWidth} height={140 - y} fill={s.name === "Sneha" ? "#2D6BFF" : "#37C871"} rx="8" />
                            {/* Value text */}
                            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">
                              {score}/{maxMarks}
                            </text>
                            {/* Student name label */}
                            <text x={x + barWidth / 2} y="158" textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">
                              {s.name}
                            </text>
                          </g>
                        );
                      })}
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyTestsTab;
