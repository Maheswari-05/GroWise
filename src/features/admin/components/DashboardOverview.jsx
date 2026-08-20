import { Users, GraduationCap, BookOpen, Layers, ArrowRight, Bell, PlusCircle, Calendar, Clock, CheckCircle2, Video, AlertCircle, Monitor } from "lucide-react";

const DashboardOverview = ({ 
  students, 
  teachers, 
  subjects, 
  batches, 
  onlineClasses, 
  notifications, 
  onNavigateTab,
  onQuickAction
}) => {
  // Calculate today's classes statistics
  const todayClasses = onlineClasses.filter(c => c.date === "Today" || c.date === new Date().toLocaleDateString());
  const scheduledCount = todayClasses.length;
  const completedCount = todayClasses.filter(c => c.status === "Completed").length;
  const liveCount = todayClasses.filter(c => c.status === "Live Now").length;
  const pendingCount = scheduledCount - (completedCount + liveCount);

  const attendancePercent = scheduledCount > 0 
    ? Math.round(((completedCount + liveCount) / scheduledCount) * 100) 
    : 100;

  // Dynamic color based on percentage
  const getProgressColor = (pct) => {
    if (pct >= 80) return "#10b981";
    if (pct >= 50) return "#f59e0b";
    return "#ef4444";
  };
  const progressColor = getProgressColor(attendancePercent);

  return (
    <div className="admin-overview-container">
      {/* Welcome banner */}
      <section className="welcome-section">
        <h2>System Administration Overview</h2>
      </section>

      {/* Summary Cards Grid */}
      <section className="summary-cards-grid">
        <div className="summary-card" onClick={() => onNavigateTab("Students")}>
          <div className="card-icon-wrapper blue">
            <Users size={24} />
          </div>
          <div className="card-info">
            <h3>{students.length}</h3>
            <p>Total Students</p>
          </div>
          <ArrowRight className="card-arrow" size={16} />
        </div>

        <div className="summary-card" onClick={() => onNavigateTab("Teachers")}>
          <div className="card-icon-wrapper green">
            <GraduationCap size={24} />
          </div>
          <div className="card-info">
            <h3>{teachers.length}</h3>
            <p>Total Teachers</p>
          </div>
          <ArrowRight className="card-arrow" size={16} />
        </div>

        <div className="summary-card" onClick={() => onNavigateTab("Subjects")}>
          <div className="card-icon-wrapper purple">
            <BookOpen size={24} />
          </div>
          <div className="card-info">
            <h3>{subjects.length}</h3>
            <p>Total Subjects</p>
          </div>
          <ArrowRight className="card-arrow" size={16} />
        </div>

        <div className="summary-card" onClick={() => onNavigateTab("Batches")}>
          <div className="card-icon-wrapper orange">
            <Layers size={24} />
          </div>
          <div className="card-info">
            <h3>{batches.length}</h3>
            <p>Total Batches</p>
          </div>
          <ArrowRight className="card-arrow" size={16} />
        </div>
      </section>

      {/* Quick Action Buttons Section */}
      <section className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => onQuickAction("AddStudent")}>
            <PlusCircle size={18} />
            <span>Add Student</span>
          </button>
          <button className="quick-action-btn" onClick={() => onQuickAction("AddTeacher")}>
            <PlusCircle size={18} />
            <span>Add Teacher</span>
          </button>
          <button className="quick-action-btn" onClick={() => onQuickAction("AddSubject")}>
            <PlusCircle size={18} />
            <span>Add Subject</span>
          </button>
          <button className="quick-action-btn" onClick={() => onQuickAction("CreateBatch")}>
            <PlusCircle size={18} />
            <span>Create Batch</span>
          </button>
          
        </div>
      </section>

      {/* Two Column Layout: Snapshot & Activities */}
      <div className="overview-split-layout">
        {/* Left Column: Today's Class & Attendance Snapshot */}
        <section className="overview-left-card">
          <div className="card-header">
            <div className="card-header-title-group">
              <div className="header-icon-pill blue">
                <Monitor size={18} />
              </div>
              <div>
                <h3>Today's Classes Snapshot</h3>
                <span className="card-subtitle">Real-time session monitoring & activity</span>
              </div>
            </div>
            <div className="card-header-actions">
              {liveCount > 0 && (
                <span className="live-pulse-badge">
                  <span className="pulse-dot"></span>
                  {liveCount} Live Now
                </span>
              )}
              <span className="card-date-badge">
                <Calendar size={13} />
                <span>Today, {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </span>
            </div>
          </div>

          <div className="attendance-snapshot-body">
            {/* Top Stat Summary Banner */}
            <div className="snapshot-progress-section">
              <div className="circular-progress-wrapper">
                <svg className="circular-progress" viewBox="0 0 120 120">
                  <circle className="progress-bg" cx="60" cy="60" r="50" />
                  <circle 
                    className="progress-bar-svg" 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    style={{
                      strokeDasharray: 314.16,
                      strokeDashoffset: scheduledCount === 0 
                        ? 314.16 
                        : 314.16 - (314.16 * attendancePercent) / 100,
                      stroke: scheduledCount === 0 ? "#cbd5e1" : progressColor
                    }}
                  />
                </svg>
                <div className="progress-value">
                  <span className="percent" style={{ color: scheduledCount === 0 ? "#64748b" : "#0f172a" }}>
                    {scheduledCount === 0 ? "0%" : `${attendancePercent}%`}
                  </span>
                  <span className="label">
                    {scheduledCount === 0 ? "No Sessions" : "Completed"}
                  </span>
                </div>
              </div>

              <div className="snapshot-stats-grid">
                <div className="snapshot-metric-card green">
                  <div className="metric-icon-box">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{completedCount + liveCount}</span>
                    <span className="metric-label">Conducted / Live</span>
                  </div>
                </div>

                <div className="snapshot-metric-card blue">
                  <div className="metric-icon-box">
                    <Clock size={16} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{scheduledCount}</span>
                    <span className="metric-label">Scheduled Classes</span>
                  </div>
                </div>

                <div className="snapshot-metric-card amber">
                  <div className="metric-icon-box">
                    <AlertCircle size={16} />
                  </div>
                  <div className="metric-info">
                    <span className="metric-num">{Math.max(0, pendingCount)}</span>
                    <span className="metric-label">Pending Start</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List of today's classes */}
            <div className="today-class-minilist">
              <div className="minilist-header">
                <h4>Class Schedule Today</h4>
                <button 
                  className="minilist-action-link"
                  onClick={() => onNavigateTab("Classes")}
                >
                  Manage Classes <ArrowRight size={13} />
                </button>
              </div>

              {todayClasses.length === 0 ? (
                <div className="snapshot-empty-state">
                  <div className="empty-state-icon-wrap">
                    <Calendar size={28} />
                  </div>
                  <h5>No Classes Scheduled Today</h5>
                  <p>There are no active or upcoming classes assigned for today's roster.</p>
                  <button 
                    className="empty-action-btn"
                    onClick={() => onNavigateTab("Classes")}
                  >
                    <PlusCircle size={15} />
                    <span>Schedule / View Classes</span>
                  </button>
                </div>
              ) : (
                <div className="minilist-items">
                  {todayClasses.map(c => (
                    <div className="minilist-item" key={c.id}>
                      <div className="class-time-info">
                        <span className="time">
                          <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                          {c.time ? c.time.split(" - ")[0] : "TBD"}
                        </span>
                        <span className={`status-badge ${c.status ? c.status.toLowerCase().replace(/\s+/g, "-") : "upcoming"}`}>
                          {c.status || "Upcoming"}
                        </span>
                      </div>
                      <div className="class-subject-info">
                        <h5>{c.subject} &bull; {c.title}</h5>
                        <p>Teacher: <strong>{c.teacher}</strong> | Student: <strong>{c.student}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Recent Activity Feed */}
        <section className="overview-right-card">
          <div className="card-header">
            <div className="card-header-title-group">
              <div className="header-icon-pill purple">
                <Bell size={18} />
              </div>
              <div>
                <h3>Recent Activity</h3>
                <span className="card-subtitle">Live system event log</span>
              </div>
            </div>
            <span className="activity-count-badge">
              {notifications.length} updates
            </span>
          </div>
          
          <div className="activity-feed">
            {notifications.length === 0 ? (
              <div className="activity-empty-state">
                <Bell size={24} className="activity-empty-icon" />
                <p>No recent activity logs recorded.</p>
              </div>
            ) : (
              <div className="feed-items">
                {notifications.slice(0, 10).map(n => (
                  <div className={`feed-item ${n.type}`} key={n.id}>
                    <div className="feed-dot"></div>
                    <div className="feed-content">
                      <p className="feed-message">{n.message}</p>
                      <span className="feed-time">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardOverview;
