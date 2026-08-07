import { Users, GraduationCap, BookOpen, Layers, ArrowRight, Bell, PlusCircle, Calendar } from "lucide-react";

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

  const attendancePercent = scheduledCount > 0 
    ? Math.round(((completedCount + liveCount) / scheduledCount) * 100) 
    : 100;

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
            <h3>Today's Classes Snapshot</h3>
            <span className="card-date-badge">
              <Calendar size={14} />
              <span>Today</span>
            </span>
          </div>

          <div className="attendance-snapshot-body">
            <div className="snapshot-progress-section">
              <div className="circular-progress-wrapper">
                <svg className="circular-progress" viewBox="0 0 100 100">
                  <circle className="progress-bg" cx="50" cy="50" r="40" />
                  <circle 
                    className="progress-bar-svg" 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    style={{
                      strokeDasharray: 251.2,
                      strokeDashoffset: 251.2 - (251.2 * attendancePercent) / 100
                    }}
                  />
                </svg>
                <div className="progress-value">
                  <span className="percent">{attendancePercent}%</span>
                  <span className="label">Active/Conducted</span>
                </div>
              </div>

              <div className="snapshot-text-stats">
                <div className="stat-item">
                  <span className="stat-dot green"></span>
                  <span className="stat-label">Conducted/Live:</span>
                  <span className="stat-val">{completedCount + liveCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-dot blue"></span>
                  <span className="stat-label">Scheduled Classes:</span>
                  <span className="stat-val">{scheduledCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-dot orange"></span>
                  <span className="stat-label">Pending Class Start:</span>
                  <span className="stat-val">{scheduledCount - (completedCount + liveCount)}</span>
                </div>
              </div>
            </div>

            {/* List of today's classes */}
            <div className="today-class-minilist">
              <h4>Class Schedule Today</h4>
              {todayClasses.length === 0 ? (
                <p className="no-classes-text">No classes scheduled for today.</p>
              ) : (
                <div className="minilist-items">
                  {todayClasses.map(c => (
                    <div className="minilist-item" key={c.id}>
                      <div className="class-time-info">
                        <span className="time">{c.time.split(" - ")[0]}</span>
                        <span className={`status-badge ${c.status.toLowerCase().replace(" ", "-")}`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="class-subject-info">
                        <h5>{c.subject} - {c.title}</h5>
                        <p>Teacher: {c.teacher} | Student: {c.student}</p>
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
            <h3>Recent Activity & Notifications</h3>
            <Bell size={18} className="text-muted" />
          </div>
          
          <div className="activity-feed">
            {notifications.length === 0 ? (
              <p className="no-activity-text">No recent notifications available.</p>
            ) : (
              <div className="feed-items">
                {notifications.map(n => (
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
