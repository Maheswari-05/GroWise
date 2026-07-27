import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ClipboardList,
  FileText,
  Tv,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Video,
  CheckCircle,
  AlertTriangle,
  Award,
  Download,
  FileCheck,
  ChevronRight
} from "lucide-react";
import logo from "../../assets/logo.png";
import avatarImg from "../../assets/courses/human4.jpg";
import "./StudentDashboard.css";

const StudentDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const [historyFilter, setHistoryFilter] = useState("All Subjects");

  const attendanceHistory = [
    { date: "Oct 06, 2023", subject: "Mathematics", teacher: "Alan Turing", batch: "Morning B1", time: "09:00 - 10:30", status: "Present" },
    { date: "Oct 05, 2023", subject: "Physics", teacher: "Richard Feynman", batch: "Morning B1", time: "11:00 - 12:30", status: "Present" },
    { date: "Oct 03, 2023", subject: "Chemistry", teacher: "Marie Curie", batch: "Evening C2", time: "16:00 - 17:30", status: "Absent" },
    { date: "Oct 02, 2023", subject: "Chemistry", teacher: "Marie Curie", batch: "Evening C2", time: "16:00 - 17:30", status: "Present" },
    { date: "Oct 01, 2023", subject: "Mathematics", teacher: "Alan Turing", batch: "Morning B1", time: "09:00 - 10:30", status: "Present" },
  ];

  const filteredHistory = attendanceHistory.filter((record) => {
    return historyFilter === "All Subjects" || record.subject === historyFilter;
  });
  
  const [notificationsList, setNotificationsList] = useState([
    {
      id: 1,
      title: "Physics Notes Uploaded",
      time: "2 hours ago",
      detail: "Unit 4: Optics",
      unread: true,
    },
    {
      id: 2,
      title: "Math Assignment Due",
      time: "5 hours ago",
      detail: "Probability",
      unread: true,
    },
    {
      id: 3,
      title: "Weekly Test Result",
      time: "Yesterday",
      detail: "Scored 89/100",
      unread: true,
    },
    {
      id: 4,
      title: "Online Class Link",
      time: "1 day ago",
      detail: "Chemistry revision",
      unread: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadNotifications(false);
  };

  const handleDownloadFile = (fileName) => {
    setDownloadProgress(fileName);
    setTimeout(() => {
      setDownloadProgress(null);
      alert(`Successfully downloaded ${fileName}`);
    }, 1200);
  };

  // Close sidebar on tab change (mobile)
  const selectTab = (tabName) => {
    setActiveTab(tabName);
    setSidebarOpen(false);
  };

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Attendance", icon: CalendarDays },
    { name: "Study Materials", icon: BookOpen },
    { name: "Assignments", icon: ClipboardList },
    { name: "Weekly Tests", icon: FileText },
    { name: "Online Classes", icon: Tv },
    { name: "Performance", icon: BarChart3 },
    { name: "Notifications", icon: Bell },
    { name: "Profile", icon: User },
  ];

  return (
    <div className="dashboard-container">
      {/* ── Sidebar ── */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => onNavigate("landing")}>
            <img src={logo} alt="GroWise Logo" />
            <span className="logo-text">GroWise</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <li key={item.name}>
                  <button
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => selectTab(item.name)}
                  >
                    <IconComponent size={20} className="nav-icon" />
                    <span>{item.name}</span>
                    {item.name === "Notifications" && unreadNotifications && (
                      <span className="nav-badge-dot"></span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => onNavigate("landing")}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* ── Main Layout ── */}
      <div className="dashboard-main">
        {/* ── Header ── */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1>{activeTab}</h1>
          </div>

          <div className="header-right">
            {/* Notification Bell */}
            <button 
              className="notification-bell-btn" 
              onClick={() => selectTab("Notifications")}
              aria-label="View notifications"
            >
              <Bell size={22} />
              {unreadNotifications && <span className="bell-badge-dot"></span>}
            </button>

            {/* Profile Info */}
            <div className="header-profile" onClick={() => selectTab("Profile")}>
              <div className="profile-details">
                <span className="profile-name">Sneha</span>
                <span className="profile-id">Student ID: #TC890</span>
              </div>
              <img src={avatarImg} alt="Sneha's Avatar" className="profile-avatar" />
            </div>
          </div>
        </header>

        {/* ── Main Content Area (Scrollable) ── */}
        <main className="dashboard-content">
          {activeTab === "Dashboard" && (
            <div className="dashboard-dashboard-view">
              {/* Welcome Section */}
              <section className="welcome-section">
                <h2>Good Morning, Sneha 👋</h2>
                <p>Welcome back! Here's your academic progress today.</p>
              </section>

              {/* Summary Cards Grid */}
              <section className="summary-cards-grid">
                {/* Card 1: Next Live Class (Solid Color Accent) */}
                <div className="summary-card live-class-card">
                  <div className="card-top">
                    <span className="card-badge">NEXT LIVE CLASS</span>
                    <span className="badge-icon-wrap">
                      <Video size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <h3>Physics: Quantum Mechanics</h3>
                    <p>Today, 4:00 PM</p>
                  </div>
                  <button className="join-class-btn" onClick={() => alert("Joining Live Class...")}>
                    Join Class
                  </button>
                </div>

                {/* Card 2: Attendance */}
                <div className="summary-card clickable-card" onClick={() => selectTab("Attendance")}>
                  <div className="card-top">
                    <span className="card-badge gray">ATTENDANCE</span>
                    <span className="badge-icon-wrap green">
                      <CheckCircle size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">92%</span>
                    </div>
                    <p className="card-subtitle">46 Days Present</p>
                  </div>
                </div>

                {/* Card 3: Assignments */}
                <div className="summary-card">
                  <div className="card-top">
                    <span className="card-badge gray">ASSIGNMENTS</span>
                    <span className="badge-icon-wrap orange">
                      <AlertTriangle size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">2 <span className="value-unit">Pending</span></span>
                    </div>
                    <p className="card-subtitle">8 Recently Submitted</p>
                  </div>
                </div>

                {/* Card 4: Weekly Test */}
                <div className="summary-card">
                  <div className="card-top">
                    <span className="card-badge gray">WEEKLY TEST</span>
                    <span className="badge-icon-wrap blue">
                      <Award size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">89 <span className="value-divider">/ 100</span></span>
                    </div>
                    <p className="card-subtitle">Latest: Mathematics</p>
                  </div>
                </div>
              </section>

              {/* Two Column Layout (Chart and Notifications) */}
              <div className="dashboard-split-row">
                {/* Custom HTML/CSS Vertical Bar Chart Card */}
                <section className="chart-card-wrapper">
                  <div className="card-header">
                    <h3>Performance Overview</h3>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <span className="legend-dot green"></span>
                        <span>Math</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot blue"></span>
                        <span>Physics</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot orange"></span>
                        <span>Chemistry</span>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container">
                    {/* Y Axis Gridlines */}
                    <div className="chart-y-axis-labels">
                      <span>100%</span>
                      <span>80%</span>
                      <span>60%</span>
                      <span>40%</span>
                      <span>20%</span>
                      <span>0%</span>
                    </div>

                    <div className="chart-bars-area">
                      {/* Gridline bars */}
                      <div className="chart-gridlines">
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                      </div>

                      {/* Actual bars */}
                      <div className="bars-wrapper">
                        {/* Physics — 89% */}
                        <div className="bar-column">
                          <div className="bar-track">
                            <div 
                              className="bar-fill blue-bar" 
                              style={{ height: "89%" }}
                              title="Physics: 89%"
                            >
                              <span className="bar-tooltip">89%</span>
                            </div>
                          </div>
                          <span className="bar-label">Physics</span>
                        </div>

                        {/* Chemistry — 80% */}
                        <div className="bar-column">
                          <div className="bar-track">
                            <div 
                              className="bar-fill orange-bar" 
                              style={{ height: "80%" }}
                              title="Chemistry: 80%"
                            >
                              <span className="bar-tooltip">80%</span>
                            </div>
                          </div>
                          <span className="bar-label">Chemistry</span>
                        </div>

                        {/* Mathematics — 90% */}
                        <div className="bar-column">
                          <div className="bar-track">
                            <div 
                              className="bar-fill green-bar" 
                              style={{ height: "90%" }}
                              title="Mathematics: 90%"
                            >
                              <span className="bar-tooltip">90%</span>
                            </div>
                          </div>
                          <span className="bar-label">Mathematics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Notifications Panel */}
                <section className="notifications-panel-card">
                  <div className="card-header">
                    <h3>Notifications</h3>
                    <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  </div>

                  <div className="notifications-list">
                    {notificationsList.map((notif) => (
                      <div key={notif.id} className={`notification-item ${notif.unread ? "unread" : ""}`}>
                        {notif.unread && <span className="unread-marker"></span>}
                        <div className="notification-content">
                          <p className="notification-title">{notif.title}</p>
                          <p className="notification-details">
                            {notif.time} &bull; {notif.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Study Materials Section */}
              <section className="study-materials-section-card">
                <div className="card-header">
                  <h3>Study Materials</h3>
                  <button className="view-all-btn" onClick={() => selectTab("Study Materials")}>
                    View All
                  </button>
                </div>

                <div className="materials-list">
                  {/* File 1: Physics */}
                  <div className="material-item">
                    <div className="material-left">
                      <div className="file-icon-wrap pdf">
                        <span className="file-icon-text">PDF</span>
                      </div>
                      <div className="material-info">
                        <h4>Physics Notes Unit 4.pdf</h4>
                        <p>Added: Oct 24, 2023 &bull; 4.2 MB</p>
                      </div>
                    </div>
                    <button 
                      className="download-icon-btn" 
                      onClick={() => handleDownloadFile("Physics Notes Unit 4.pdf")}
                      disabled={downloadProgress !== null}
                      aria-label="Download Physics Notes Unit 4.pdf"
                    >
                      {downloadProgress === "Physics Notes Unit 4.pdf" ? (
                        <span className="download-spinner"></span>
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>

                  {/* File 2: Mathematics */}
                  <div className="material-item">
                    <div className="material-left">
                      <div className="file-icon-wrap doc">
                        <span className="file-icon-text">DOC</span>
                      </div>
                      <div className="material-info">
                        <h4>Mathematics Practice Sheet.pdf</h4>
                        <p>Added: Oct 22, 2023 &bull; 1.8 MB</p>
                      </div>
                    </div>
                    <button 
                      className="download-icon-btn" 
                      onClick={() => handleDownloadFile("Mathematics Practice Sheet.pdf")}
                      disabled={downloadProgress !== null}
                      aria-label="Download Mathematics Practice Sheet.pdf"
                    >
                      {downloadProgress === "Mathematics Practice Sheet.pdf" ? (
                        <span className="download-spinner"></span>
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>

                  {/* File 3: Chemistry */}
                  <div className="material-item">
                    <div className="material-left">
                      <div className="file-icon-wrap chem">
                        <span className="file-icon-text">PDF</span>
                      </div>
                      <div className="material-info">
                        <h4>Chemistry Revision.pdf</h4>
                        <p>Added: Oct 20, 2023 &bull; 5.1 MB</p>
                      </div>
                    </div>
                    <button 
                      className="download-icon-btn" 
                      onClick={() => handleDownloadFile("Chemistry Revision.pdf")}
                      disabled={downloadProgress !== null}
                      aria-label="Download Chemistry Revision.pdf"
                    >
                      {downloadProgress === "Chemistry Revision.pdf" ? (
                        <span className="download-spinner"></span>
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "Attendance" && (
            <div className="attendance-view-container">
              {/* Header section */}
              <section className="attendance-header-section">
                <h2>Attendance Overview</h2>
                <p>Track your attendance here!</p>
              </section>

              {/* Summary Cards Row (3 Cards) */}
              <section className="attendance-summary-cards">
                {/* Card 1: Overall Attendance */}
                <div className="attendance-summary-card">
                  <div className="attendance-card-info">
                    <span className="card-badge gray">OVERALL ATTENDANCE</span>
                    <span className="attendance-large-val">92%</span>
                    <span className="attendance-badge-text green">Excellent Attendance</span>
                  </div>
                  <div className="circular-progress-wrapper">
                    <svg className="circular-svg" viewBox="0 0 36 36">
                      <path
                        className="circle-bg"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle-fill-bar"
                        strokeDasharray="92, 100"
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="circle-text">92%</div>
                  </div>
                </div>

                {/* Card 2: Classes Attended */}
                <div className="attendance-summary-card">
                  <div className="attendance-card-info">
                    <span className="card-badge gray">CLASSES ATTENDED</span>
                    <span className="attendance-large-val">46</span>
                    <span className="attendance-badge-subtitle">Out of 50 classes</span>
                  </div>
                  <div className="attendance-card-icon-wrap blue-icon">
                    <CheckCircle size={24} />
                  </div>
                </div>

                {/* Card 3: Enrolled Subjects */}
                <div className="attendance-summary-card">
                  <div className="attendance-card-info">
                    <span className="card-badge gray">ENROLLED SUBJECTS</span>
                    <span className="attendance-large-val">3</span>
                    <span className="attendance-badge-subtitle">Math, Phys, Chem</span>
                  </div>
                  <div className="attendance-card-icon-wrap indigo-icon">
                    <BookOpen size={24} />
                  </div>
                </div>
              </section>

              {/* Subject-wise Attendance */}
              <section className="subject-attendance-section">
                <h3 className="section-title">Subject-wise Attendance</h3>
                <div className="subject-cards-grid">
                  {/* Mathematics */}
                  <div className="subject-attendance-card">
                    <div className="subject-card-top">
                      <div className="subject-icon-box math-box">
                        <BookOpen size={20} />
                      </div>
                      <div className="subject-title-details">
                        <h4>Mathematics</h4>
                        <p>Prof. Alan Turing</p>
                      </div>
                      <span className="subject-pct-val math-pct">95%</span>
                    </div>
                    <div className="subject-progress-track">
                      <div className="subject-progress-fill math-fill" style={{ width: "95%" }}></div>
                    </div>
                    <div className="subject-card-bottom">
                      <span>Present: 19 Sessions</span>
                      <span>Total: 20</span>
                    </div>
                  </div>

                  {/* Physics */}
                  <div className="subject-attendance-card">
                    <div className="subject-card-top">
                      <div className="subject-icon-box phys-box">
                        <Award size={20} />
                      </div>
                      <div className="subject-title-details">
                        <h4>Physics</h4>
                        <p>Dr. Richard Feynman</p>
                      </div>
                      <span className="subject-pct-val phys-pct">90%</span>
                    </div>
                    <div className="subject-progress-track">
                      <div className="subject-progress-fill phys-fill" style={{ width: "90%" }}></div>
                    </div>
                    <div className="subject-card-bottom">
                      <span>Present: 18 Sessions</span>
                      <span>Total: 20</span>
                    </div>
                  </div>

                  {/* Chemistry */}
                  <div className="subject-attendance-card">
                    <div className="subject-card-top">
                      <div className="subject-icon-box chem-box">
                        <ClipboardList size={20} />
                      </div>
                      <div className="subject-title-details">
                        <h4>Chemistry</h4>
                        <p>Dr. Marie Curie</p>
                      </div>
                      <span className="subject-pct-val chem-pct">85%</span>
                    </div>
                    <div className="subject-progress-track">
                      <div className="subject-progress-fill chem-fill" style={{ width: "85%" }}></div>
                    </div>
                    <div className="subject-card-bottom">
                      <span>Present: 17 Sessions</span>
                      <span>Total: 20</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Attendance History Card */}
              <section className="attendance-history-card">
                <div className="history-card-header">
                  <h3>Attendance History</h3>
                  <div className="history-filters">
                    <select
                      value={historyFilter}
                      onChange={(e) => setHistoryFilter(e.target.value)}
                      className="history-select-dropdown"
                    >
                      <option value="All Subjects">All Subjects</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                    </select>
                  </div>
                </div>

                <div className="history-table-container">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>SUBJECT</th>
                        <th>TEACHER</th>
                        <th>BATCH</th>
                        <th>TIME</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.length > 0 ? (
                        filteredHistory.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.date}</td>
                            <td className="subject-cell">{row.subject}</td>
                            <td>{row.teacher}</td>
                            <td>{row.batch}</td>
                            <td>{row.time}</td>
                            <td>
                              <span className={`status-badge ${row.status.toLowerCase()}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="no-records-cell">
                            No attendance records found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="history-pagination">
                  <button className="pag-btn" disabled>Previous</button>
                  <button className="pag-btn" disabled>Next</button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "Study Materials" && (
            <div className="study-materials-view-container">
              <section className="study-materials-section-card">
                <div className="card-header">
                  <h3>Study Materials</h3>
                  <button className="view-all-btn" onClick={() => setActiveTab("Dashboard")}>
                    Back to Dashboard
                  </button>
                </div>

                <div className="materials-list">
                  {/* File 1: Physics */}
                  <div className="material-item">
                    <div className="material-left">
                      <div className="file-icon-wrap pdf">
                        <span className="file-icon-text">PDF</span>
                      </div>
                      <div className="material-info">
                        <h4>Physics Notes Unit 4.pdf</h4>
                        <p>Added: Oct 24, 2023 &bull; 4.2 MB</p>
                      </div>
                    </div>
                    <button 
                      className="download-icon-btn" 
                      onClick={() => handleDownloadFile("Physics Notes Unit 4.pdf")}
                      disabled={downloadProgress !== null}
                      aria-label="Download Physics Notes Unit 4.pdf"
                    >
                      {downloadProgress === "Physics Notes Unit 4.pdf" ? (
                        <span className="download-spinner"></span>
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>

                  {/* File 2: Mathematics */}
                  <div className="material-item">
                    <div className="material-left">
                      <div className="file-icon-wrap doc">
                        <span className="file-icon-text">DOC</span>
                      </div>
                      <div className="material-info">
                        <h4>Mathematics Practice Sheet.pdf</h4>
                        <p>Added: Oct 22, 2023 &bull; 1.8 MB</p>
                      </div>
                    </div>
                    <button 
                      className="download-icon-btn" 
                      onClick={() => handleDownloadFile("Mathematics Practice Sheet.pdf")}
                      disabled={downloadProgress !== null}
                      aria-label="Download Mathematics Practice Sheet.pdf"
                    >
                      {downloadProgress === "Mathematics Practice Sheet.pdf" ? (
                        <span className="download-spinner"></span>
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>

                  {/* File 3: Chemistry */}
                  <div className="material-item">
                    <div className="material-left">
                      <div className="file-icon-wrap chem">
                        <span className="file-icon-text">PDF</span>
                      </div>
                      <div className="material-info">
                        <h4>Chemistry Revision.pdf</h4>
                        <p>Added: Oct 20, 2023 &bull; 5.1 MB</p>
                      </div>
                    </div>
                    <button 
                      className="download-icon-btn" 
                      onClick={() => handleDownloadFile("Chemistry Revision.pdf")}
                      disabled={downloadProgress !== null}
                      aria-label="Download Chemistry Revision.pdf"
                    >
                      {downloadProgress === "Chemistry Revision.pdf" ? (
                        <span className="download-spinner"></span>
                      ) : (
                        <Download size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab !== "Dashboard" && activeTab !== "Attendance" && activeTab !== "Study Materials" && (
            <div className="placeholder-view-card">
              <div className="placeholder-content">
                <div className="placeholder-icon-wrap">
                  {activeTab === "Attendance" && <CalendarDays size={48} />}
                  {activeTab === "Study Materials" && <BookOpen size={48} />}
                  {activeTab === "Assignments" && <ClipboardList size={48} />}
                  {activeTab === "Weekly Tests" && <FileText size={48} />}
                  {activeTab === "Online Classes" && <Tv size={48} />}
                  {activeTab === "Performance" && <BarChart3 size={48} />}
                  {activeTab === "Notifications" && <Bell size={48} />}
                  {activeTab === "Profile" && <User size={48} />}
                </div>
                <h2>{activeTab} Section</h2>
                <p>This module is currently being finalized. In this section, you will be able to review, access, and manage all your student {activeTab.toLowerCase()} reports.</p>
                <button className="placeholder-back-btn" onClick={() => setActiveTab("Dashboard")}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
