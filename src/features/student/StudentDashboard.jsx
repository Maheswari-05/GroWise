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
  ChevronRight,
  Search,
  Calculator,
  FlaskConical,
  Play,
  Lock,
  HelpCircle,
  GraduationCap
} from "lucide-react";
import logo from "../../assets/logo.png";
import avatarImg from "../../assets/avatar.png";
import mathClassImg from "../../assets/math_class.png";
import physicsClassImg from "../../assets/physics_class.png";
import chemistryClassImg from "../../assets/chemistry_class.png";
import "./StudentDashboard.css";

const StudentDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const [historyFilter, setHistoryFilter] = useState("All Subjects");

  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("All Subjects");
  const [assignmentStatus, setAssignmentStatus] = useState("All Status");
  const [submittingId, setSubmittingId] = useState(null);
  const [activeDetailsAssignment, setActiveDetailsAssignment] = useState(null);

  const [testSearch, setTestSearch] = useState("");
  const [testSubject, setTestSubject] = useState("All Subjects");
  const [activeTestResult, setActiveTestResult] = useState(null);

  const [weeklyTests, setWeeklyTests] = useState([
    {
      id: 1,
      subject: "Mathematics",
      title: "Algebra Test",
      teacher: "Mr. Rajesh",
      date: "12 Jun 2026",
      status: "Published",
      marksObtained: 18,
      totalMarks: 20,
      percent: 90,
      questions: [
        { q: "Solve for x: 2x + 5 = 15", studentAnswer: "2x = 10 => x = 5", correctAnswer: "x = 5", isCorrect: true, marks: "5/5" },
        { q: "Find the roots of x^2 - 5x + 6 = 0", studentAnswer: "(x-2)(x-3) = 0 => x = 2, 3", correctAnswer: "x = 2, 3", isCorrect: true, marks: "5/5" },
        { q: "Solve the inequality: 3x - 4 < 5", studentAnswer: "3x < 9 => x < 3", correctAnswer: "x < 3", isCorrect: true, marks: "5/5" },
        { q: "Expand and simplify: (x + 3)(x - 3)", studentAnswer: "x^2 - 9", correctAnswer: "x^2 - 9", isCorrect: true, marks: "3/5" }
      ]
    },
    {
      id: 2,
      subject: "Physics",
      title: "Quantum Mechanics Test",
      teacher: "Mrs. Anita",
      date: "19 Jun 2026",
      status: "Published",
      marksObtained: 16,
      totalMarks: 20,
      percent: 80,
      questions: [
        { q: "What is the formula for Planck's relation?", studentAnswer: "E = hf", correctAnswer: "E = hν (or E = hf)", isCorrect: true, marks: "5/5" },
        { q: "State Heisenberg's Uncertainty Principle formula.", studentAnswer: "Δx * Δp >= h / (4π)", correctAnswer: "Δx * Δp >= ℏ / 2 (or h / 4π)", isCorrect: true, marks: "5/5" },
        { q: "Define the term 'Quantum entanglement'.", studentAnswer: "Spooky action at a distance.", correctAnswer: "A physical phenomenon that occurs when a pair or group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle cannot be described independently of the state of the others.", isCorrect: false, marks: "1/5" },
        { q: "Calculate the energy of a photon of wavelength 500 nm.", studentAnswer: "E = hc/λ = 3.97e-19 J", correctAnswer: "3.97 x 10^-19 Joules", isCorrect: true, marks: "5/5" }
      ]
    },
    {
      id: 3,
      subject: "Chemistry",
      title: "Aldehydes Test",
      teacher: "Mr. Kumar",
      date: "26 Jun 2026",
      status: "Result Pending",
      marksObtained: null,
      totalMarks: 20,
      percent: null,
      questions: []
    }
  ]);

  const filteredWeeklyTests = weeklyTests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(testSearch.toLowerCase()) ||
                          test.subject.toLowerCase().includes(testSearch.toLowerCase());
    const matchesSubject = testSubject === "All Subjects" || test.subject === testSubject;
    return matchesSearch && matchesSubject;
  });

  const [onlineClassSearch, setOnlineClassSearch] = useState("");
  const [onlineClassSubject, setOnlineClassSubject] = useState("All Subjects");
  const [onlineClassStatus, setOnlineClassStatus] = useState("All Status");

  const [onlineClasses, setOnlineClasses] = useState([
    {
      id: 1,
      subject: "Mathematics",
      title: "Mathematics - Algebra Revision",
      description: "Advanced Problem Solving Techniques",
      teacher: "Mr. Rajesh",
      date: "Today",
      time: "5:00 PM - 6:00 PM",
      status: "Live Now",
      image: mathClassImg
    },
    {
      id: 2,
      subject: "Physics",
      title: "Physics - Quantum Mechanics",
      description: "Understanding Quantum Mechanics",
      teacher: "Mrs. Anita",
      date: "24 Jun 2026",
      time: "4:00 PM - 5:00 PM",
      status: "Upcoming",
      image: physicsClassImg
    },
    {
      id: 3,
      subject: "Chemistry",
      title: "Chemistry - Organic Chemistry",
      description: "Introduction to Hydrocarbons",
      teacher: "Mr. Kumar",
      date: "18 Jun 2026",
      time: "3:00 PM - 4:00 PM",
      status: "Completed",
      image: chemistryClassImg
    }
  ]);

  const filteredOnlineClasses = onlineClasses.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(onlineClassSearch.toLowerCase()) ||
                          item.description.toLowerCase().includes(onlineClassSearch.toLowerCase()) ||
                          item.subject.toLowerCase().includes(onlineClassSearch.toLowerCase());
    const matchesSubject = onlineClassSubject === "All Subjects" || item.subject === onlineClassSubject;
    const matchesStatus = onlineClassStatus === "All Status" || item.status === onlineClassStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const [activePerformanceSubject, setActivePerformanceSubject] = useState("Mathematics");

  const [performanceData, setPerformanceData] = useState([
    {
      subject: "Mathematics",
      progress: 90,
      grade: "A",
      topicsCovered: [
        "Algebraic Equations",
        "Complex Numbers & Quadratic Formulations",
        "Matrices & Determinants",
        "Calculus & Functions"
      ],
      tests: [
        { name: "Maths-Algebra Test", score: "18 / 20 (90%)", status: "Passed", badgeClass: "passed" }
      ],
      assignments: [
        { name: "Algebra Worksheet", score: "18 / 20", status: "Evaluated", badgeClass: "evaluated" },
        { name: "Calculus Practice", score: "20 / 20", status: "Evaluated", badgeClass: "evaluated" }
      ]
    },
    {
      subject: "Physics",
      progress: 80,
      grade: "A-",
      topicsCovered: [
        "Newtonian Mechanics",
        "Electrostatics",
        "Thermal Dynamics",
        "Quantum Physics Fundamentals & Wave Optics"
      ],
      tests: [
        { name: "Physics-Quantum Mechanics Test", score: "16 / 20 (80%)", status: "Passed", badgeClass: "passed" }
      ],
      assignments: [
        { name: "Quantum Mechanics Homework", score: "18 / 20", status: "Evaluated", badgeClass: "evaluated" },
        { name: "Optics Assignment", score: "--", status: "Pending", badgeClass: "pending" }
      ]
    },
    {
      subject: "Chemistry",
      progress: 65,
      grade: "B",
      topicsCovered: [
        "Chemical Bonding & Periodic Properties",
        "Aldehydes, Ketones & Carboxylic Acids"
      ],
      tests: [
        { name: "Chemistry-Aldehydes Test", score: "Grading In Progress", status: "Result Pending", badgeClass: "pending" }
      ],
      assignments: [
        { name: "Organic Chemistry Revision", score: "Submitted", status: "Grading Pending", badgeClass: "submitted" },
        { name: "Hydrocarbons Worksheet", score: "Overdue", status: "Overdue", badgeClass: "overdue" }
      ]
    }
  ]);

  const [assignments, setAssignments] = useState([
    {
      id: 1,
      subject: "Mathematics",
      status: "Pending",
      title: "Algebra Worksheet",
      description: "Solve questions from Chapter 4 and upload your answers in PDF format.",
      assignedDate: "10 Jun 2026",
      dueDate: "17 Jun 2026"
    },
    {
      id: 2,
      subject: "Physics",
      status: "Evaluated",
      title: "Quantum Mechanics - Physics Assignment",
      score: "18 / 20",
      teacherRemarks: "Well done. Improve numerical calculations."
    },
    {
      id: 3,
      subject: "Chemistry",
      status: "Overdue",
      title: "Organic Chemistry Worksheet",
      missedDeadline: "15 Jun 2026"
    }
  ]);

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
                          item.subject.toLowerCase().includes(assignmentSearch.toLowerCase());
    const matchesSubject = assignmentSubject === "All Subjects" || item.subject === assignmentSubject;
    const matchesStatus = assignmentStatus === "All Status" || item.status === assignmentStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleSubmitAssignmentAction = (id, title) => {
    setSubmittingId(id);
    setTimeout(() => {
      setAssignments(prev => prev.map(item => item.id === id ? { ...item, status: "Submitted" } : item));
      setSubmittingId(null);
      alert(`Assignment "${title}" submitted successfully!`);
    }, 1500);
  };

  const handleViewAssignmentDetails = (asgn) => {
    setActiveDetailsAssignment(asgn);
  };

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
  
  const [notificationSearch, setNotificationSearch] = useState("");
  const [notificationFilter, setNotificationFilter] = useState("All");

  const [notificationsList, setNotificationsList] = useState([
    {
      id: 1,
      type: "study-material",
      title: "New Study Material: Physics Notes - Chapter 5",
      time: "10:30 AM",
      group: "TODAY",
      detail: "The comprehensive notes for quantum mechanics are now available for download. Please review them before tomorrow's lecture.",
      unread: true
    },
    {
      id: 2,
      type: "class-reminder",
      title: "Online Class Reminder: Physics starts at 4:00 PM",
      time: "3:30 PM",
      group: "TODAY",
      detail: "",
      unread: true
    },
    {
      id: 3,
      type: "assignment",
      title: "New Assignment: Mathematics Assignment 6",
      time: "4:15 PM",
      group: "YESTERDAY",
      detail: "Topic: Calculus - Integral Applications. Submission deadline: Friday, 6:00 PM.",
      unread: true
    },
    {
      id: 4,
      type: "test-results",
      title: "Weekly Test Results: Test 4 Published",
      time: "2 Days Ago",
      group: "EARLIER",
      detail: "Mathematics Unit Test - Calculus I. Your performance report is ready.",
      unread: false
    }
  ]);

  const filteredNotifications = notificationsList.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(notificationSearch.toLowerCase()) ||
                          notif.detail.toLowerCase().includes(notificationSearch.toLowerCase());
    const matchesFilter = notificationFilter === "All" || 
                          (notificationFilter === "Unread" && notif.unread);
    return matchesSearch && matchesFilter;
  });

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
                <span className="profile-id">Class 12 - PCM</span>
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
                      <div className="student-bars-wrapper">
                        {/* Physics — 89% */}
                        <div className="student-bar-column">
                          <div className="student-bar-track">
                            <div 
                              className="student-bar-fill blue-bar" 
                              style={{ height: "89%" }}
                              title="Physics: 89%"
                            >
                              <span className="student-bar-tooltip">89%</span>
                            </div>
                          </div>
                          <span className="student-bar-label">Physics</span>
                        </div>

                        {/* Chemistry — 80% */}
                        <div className="student-bar-column">
                          <div className="student-bar-track">
                            <div 
                              className="student-bar-fill orange-bar" 
                              style={{ height: "80%" }}
                              title="Chemistry: 80%"
                            >
                              <span className="student-bar-tooltip">80%</span>
                            </div>
                          </div>
                          <span className="student-bar-label">Chemistry</span>
                        </div>

                        {/* Mathematics — 90% */}
                        <div className="student-bar-column">
                          <div className="student-bar-track">
                            <div 
                              className="student-bar-fill green-bar" 
                              style={{ height: "90%" }}
                              title="Mathematics: 90%"
                            >
                              <span className="student-bar-tooltip">90%</span>
                            </div>
                          </div>
                          <span className="student-bar-label">Mathematics</span>
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

          {activeTab === "Assignments" && (
            <div className="assignments-view-container">
              {/* Header Description */}
              <section className="assignments-header-section">
                <h2>Assignments</h2>
                <p>View, submit, and track assignments for your enrolled subjects.</p>
              </section>

              {/* Filters Row */}
              <section className="assignments-filters-row">
                <div className="assignments-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                  />
                </div>
                <div className="assignments-dropdowns">
                  <select
                    value={assignmentSubject}
                    onChange={(e) => setAssignmentSubject(e.target.value)}
                    className="assignments-select-dropdown"
                  >
                    <option value="All Subjects">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                  <select
                    value={assignmentStatus}
                    onChange={(e) => setAssignmentStatus(e.target.value)}
                    className="assignments-select-dropdown"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Evaluated">Evaluated</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>
              </section>

              {/* Assignments List */}
              <section className="assignments-list-container">
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((asgn) => (
                    <div key={asgn.id} className="assignment-card">
                      <div className="assignment-card-header">
                        <div className="assignment-subject-info">
                          <span className={`status-badge ${asgn.status.toLowerCase()}`}>
                            {asgn.status}
                          </span>
                          <span className="assignment-subject-name">
                            {asgn.subject.toUpperCase()}
                          </span>
                        </div>
                        <div className="assignment-card-actions">
                          {asgn.status === "Pending" && (
                            <>
                              <button 
                                className="outline-btn"
                                onClick={() => handleViewAssignmentDetails(asgn)}
                              >
                                View Details
                              </button>
                              <button 
                                className="primary-solid-btn"
                                onClick={() => handleSubmitAssignmentAction(asgn.id, asgn.title)}
                                disabled={submittingId === asgn.id}
                              >
                                {submittingId === asgn.id ? (
                                  <span className="btn-spinner"></span>
                                ) : (
                                  "Submit Assignment"
                                )}
                              </button>
                            </>
                          )}
                          {asgn.status === "Evaluated" && (
                            <button 
                              className="outline-btn"
                              onClick={() => handleViewAssignmentDetails(asgn)}
                            >
                              View Submission
                            </button>
                          )}
                          {asgn.status === "Overdue" && (
                            <button 
                              className="primary-solid-btn"
                              onClick={() => handleSubmitAssignmentAction(asgn.id, asgn.title)}
                              disabled={submittingId === asgn.id}
                            >
                              {submittingId === asgn.id ? (
                                <span className="btn-spinner"></span>
                              ) : (
                                "Submit Late"
                              )}
                            </button>
                          )}
                          {asgn.status === "Submitted" && (
                            <button className="outline-btn" disabled>
                              Submitted
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="assignment-card-body">
                        <div className="assignment-title-row">
                          <h4>{asgn.title}</h4>
                          {asgn.score && (
                            <span className="assignment-score-badge">{asgn.score}</span>
                          )}
                        </div>
                        
                        {asgn.description && (
                          <p className="assignment-desc">{asgn.description}</p>
                        )}

                        {asgn.teacherRemarks && (
                          <div className="teacher-remarks-box">
                            <h5>TEACHER REMARKS</h5>
                            <p>"{asgn.teacherRemarks}"</p>
                          </div>
                        )}
                      </div>

                      <div className="assignment-card-footer">
                        {asgn.assignedDate && asgn.dueDate && (
                          <div className="assignment-dates-wrap">
                            <span className="date-item">
                              <CalendarDays size={14} className="date-icon" />
                              Assigned: {asgn.assignedDate}
                            </span>
                            <span className="date-item due">
                              <CalendarDays size={14} className="date-icon due-icon" />
                              Due: {asgn.dueDate}
                            </span>
                          </div>
                        )}
                        {asgn.missedDeadline && (
                          <span className="deadline-missed-alert">
                            <AlertTriangle size={14} className="warning-icon" />
                            Missed Deadline: {asgn.missedDeadline}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-assignments-card">
                    <p>No assignments found matching criteria.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "Weekly Tests" && (
            <div className="weekly-tests-view-container">
              <section className="tests-header-section">
                <h2>Weekly Tests</h2>
                <p>View your weekly test results and track your academic performance.</p>
              </section>

              <section className="tests-filters-row">
                <div className="tests-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search weekly tests..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                  />
                </div>
                <div className="tests-dropdowns">
                  <span className="filter-label">Filter by Subject:</span>
                  <select
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    className="tests-select-dropdown"
                  >
                    <option value="All Subjects">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
              </section>

              <section className="tests-list-container">
                {filteredWeeklyTests.length > 0 ? (
                  filteredWeeklyTests.map((test) => {
                    let IconComponent = BookOpen;
                    let iconClass = "chem-icon";
                    if (test.subject === "Mathematics") {
                      IconComponent = Calculator;
                      iconClass = "math-icon";
                    } else if (test.subject === "Physics") {
                      IconComponent = FlaskConical;
                      iconClass = "phys-icon";
                    }

                    const isPublished = test.status === "Published";

                    return (
                      <div key={test.id} className="test-card">
                        <div className="test-card-left">
                          <div className={`test-icon-wrap ${iconClass}`}>
                            <IconComponent size={22} />
                          </div>
                          <div className="test-info-wrap">
                            <div className="test-title-row">
                              <h4>
                                {test.subject} - {test.title}
                              </h4>
                              <span className={`test-badge ${test.status.replace(/\s+/g, "-").toLowerCase()}`}>
                                {test.status}
                              </span>
                            </div>
                            <div className="test-metadata">
                              <span className="meta-item">
                                <User size={14} className="meta-icon" />
                                {test.teacher}
                              </span>
                              <span className="meta-item">
                                <CalendarDays size={14} className="meta-icon" />
                                {test.date}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="test-card-right">
                          <div className="test-marks-section">
                            <div className="metrics-column divider-left">
                              <span className="metrics-label">MARKS</span>
                              <span className={`metrics-val ${isPublished ? "bold-blue" : "gray"}`}>
                                {isPublished ? `${test.marksObtained} ` : "-- "}
                                <span className="slash-total">/ {test.totalMarks}</span>
                              </span>
                            </div>
                            <div className="metrics-column">
                              <span className="metrics-label">PERCENT</span>
                              <span className={`metrics-val ${isPublished ? "bold-green" : "gray"}`}>
                                {isPublished ? `${test.percent}%` : "--%"}
                              </span>
                            </div>
                          </div>
                          <button
                            className="test-view-result-btn"
                            disabled={!isPublished}
                            onClick={() => setActiveTestResult(test)}
                          >
                            View Result
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-tests-card">
                    <p>No weekly tests found matching criteria.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "Online Classes" && (
            <div className="online-classes-view-container">
              <section className="classes-header-section">
                <h2>Online Classes</h2>
                <p>Join your scheduled classes on time</p>
              </section>

              <section className="classes-filters-row">
                <div className="classes-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search online classes..."
                    value={onlineClassSearch}
                    onChange={(e) => setOnlineClassSearch(e.target.value)}
                  />
                </div>
                <div className="classes-dropdowns">
                  <select
                    value={onlineClassSubject}
                    onChange={(e) => setOnlineClassSubject(e.target.value)}
                    className="classes-select-dropdown"
                  >
                    <option value="All Subjects">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                  <select
                    value={onlineClassStatus}
                    onChange={(e) => setOnlineClassStatus(e.target.value)}
                    className="classes-select-dropdown"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Live Now">Live Now</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </section>

              <section className="classes-list-container">
                {filteredOnlineClasses.length > 0 ? (
                  filteredOnlineClasses.map((cls) => {
                    const isLive = cls.status === "Live Now";
                    const isUpcoming = cls.status === "Upcoming";
                    const isCompleted = cls.status === "Completed";

                    return (
                      <div key={cls.id} className="class-card">
                        <div className="class-card-left">
                          <div className="class-image-wrap">
                            <img src={cls.image} alt={cls.title} className="class-image" />
                            {isLive && <span className="status-badge-overlay live">LIVE NOW</span>}
                            {isUpcoming && <span className="status-badge-overlay upcoming">UPCOMING</span>}
                            {isCompleted && <span className="status-badge-overlay completed">COMPLETED</span>}
                          </div>
                          <div className="class-info-wrap">
                            <h4>{cls.title}</h4>
                            <p className="class-desc">{cls.description}</p>
                            <div className="class-teacher-row">
                              <User size={16} className="teacher-icon" />
                              <span className="teacher-label">TEACHER</span>
                              <span className="teacher-name">{cls.teacher}</span>
                            </div>
                          </div>
                        </div>

                        <div className="class-card-right">
                          <div className="class-time-info">
                            <span className="date-val">{cls.date}</span>
                            <span className="time-val">{cls.time}</span>
                          </div>
                          <div className="class-actions">
                            {isLive && (
                              <button className="join-class-btn active" onClick={() => alert(`Joining ${cls.title}...`)}>
                                <Play size={16} className="btn-icon" /> Join Class
                              </button>
                            )}
                            {isUpcoming && (
                              <>
                                <button className="outline-btn" onClick={() => alert(`Details for ${cls.title}...`)}>
                                  View Details
                                </button>
                                <button className="join-class-btn locked" disabled>
                                  <Lock size={16} className="btn-icon" /> Join Class
                                </button>
                              </>
                            )}
                            {isCompleted && (
                              <button className="outline-btn" onClick={() => alert(`Details for ${cls.title}...`)}>
                                View Details
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-classes-card">
                    <p>No online classes found matching criteria.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="notifications-view-container">
              <section className="notifications-header-section">
                <h2>Notifications</h2>
                <p>Stay updated with your latest academic activities and announcements.</p>
              </section>

              <section className="notifications-filters-row">
                <div className="notifications-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={notificationSearch}
                    onChange={(e) => setNotificationSearch(e.target.value)}
                  />
                </div>
                <div className="notifications-dropdowns">
                  <select
                    value={notificationFilter}
                    onChange={(e) => setNotificationFilter(e.target.value)}
                    className="notifications-select-dropdown"
                  >
                    <option value="All">All</option>
                    <option value="Unread">Unread</option>
                  </select>
                </div>
              </section>

              <section className="notifications-list-container">
                {["TODAY", "YESTERDAY", "EARLIER"].map((groupName) => {
                  const groupItems = filteredNotifications.filter(item => item.group === groupName);
                  if (groupItems.length === 0) return null;

                  return (
                    <div key={groupName} className="notification-group-wrap">
                      <h4 className="group-heading">{groupName}</h4>
                      <div className="group-items-list">
                        {groupItems.map((notif) => {
                          let Icon = Bell;
                          let iconClass = "general";
                          if (notif.type === "study-material") {
                            Icon = BookOpen;
                            iconClass = "study";
                          } else if (notif.type === "class-reminder") {
                            Icon = Video;
                            iconClass = "class";
                          } else if (notif.type === "assignment") {
                            Icon = ClipboardList;
                            iconClass = "asgn";
                          } else if (notif.type === "test-results") {
                            Icon = HelpCircle;
                            iconClass = "test";
                          }

                          return (
                            <div key={notif.id} className={`notification-card-item ${notif.unread ? "unread" : ""}`}>
                              <div className="card-left">
                                <div className={`notif-icon-circle ${iconClass}`}>
                                  <Icon size={20} />
                                </div>
                                <div className="notif-content-text">
                                  <h4 className="notif-title">{notif.title}</h4>
                                  {notif.detail && <p className="notif-desc">{notif.detail}</p>}
                                </div>
                              </div>
                              <div className="card-right">
                                <span className="notif-time">{notif.time}</span>
                                {notif.unread && <span className="unread-blue-dot"></span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredNotifications.length === 0 && (
                  <div className="no-notifications-card">
                    <p>No notifications found matching criteria.</p>
                  </div>
                )}
              </section>

              <footer className="notifications-footer-row">
                <span className="notif-count-label">
                  Displaying {filteredNotifications.length} most recent notifications
                </span>
                <button className="notif-mark-read-btn" onClick={handleMarkAllRead}>
                  Mark all as read
                </button>
              </footer>
            </div>
          )}

          {activeTab === "Profile" && (
            <div className="profile-view-container">
              <section className="profile-header-section">
                <h2>My Profile</h2>
                <p>View and manage your personal and academic information.</p>
              </section>

              {/* Upper Profile Summary Card */}
              <section className="profile-header-card">
                <div className="profile-header-left">
                  <div className="profile-avatar-wrap">
                    <img src={avatarImg} alt="Sneha's Avatar" className="profile-card-avatar" />
                    <span className="status-dot-overlay active"></span>
                  </div>
                  <div className="profile-summary-info">
                    <div className="name-row">
                      <h3>Sneha</h3>
                      <span className="status-badge active">Active</span>
                    </div>
                    <p className="student-id-text">ID: STU-2026-089</p>
                  </div>
                </div>
              </section>

              {/* Two Column Layout for details */}
              <div className="profile-details-grid">
                {/* Column 1: Personal Information */}
                <div className="profile-info-card personal-info">
                  <div className="info-card-header">
                    <User size={20} className="header-icon" />
                    <h3>Personal Information</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-row-grid">
                      <div className="info-item">
                        <span className="info-label">FULL NAME</span>
                        <span className="info-value">Sneha</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">STUDENT ID</span>
                        <span className="info-value">STU-2026-089</span>
                      </div>
                      <div className="info-item full-width">
                        <span className="info-label">EMAIL ADDRESS</span>
                        <span className="info-value">sneha.edu@example.com</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">PHONE NUMBER</span>
                        <span className="info-value">+91 98765 43210</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">DATE OF BIRTH</span>
                        <span className="info-value">12 Oct 2008</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">GENDER</span>
                        <span className="info-value">Female</span>
                      </div>
                      <div className="info-item full-width">
                        <span className="info-label">HOME ADDRESS</span>
                        <span className="info-value">123, Academic Street, New Delhi, India</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Academic Details */}
                <div className="profile-info-card academic-details">
                  <div className="info-card-header">
                    <GraduationCap size={22} className="header-icon" />
                    <h3>Academic Details</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="academic-items">
                      <div className="info-item">
                        <span className="info-label">ADMISSION DATE</span>
                        <span className="info-value">15 May 2024</span>
                      </div>

                      <div className="academic-badges-section">
                        <span className="info-label">ASSIGNED TEACHERS</span>
                        <div className="badges-list">
                          <span className="teacher-badge">
                            <User size={12} /> Mr. Rajesh
                          </span>
                          <span className="teacher-badge">
                            <User size={12} /> Mrs. Anita
                          </span>
                          <span className="teacher-badge">
                            <User size={12} /> Mr. Kumar
                          </span>
                        </div>
                      </div>

                      <div className="academic-badges-section">
                        <span className="info-label">ENROLLED SUBJECTS</span>
                        <div className="badges-list subjects">
                          <span className="subject-badge math">
                            <Calculator size={14} /> Mathematics
                          </span>
                          <span className="subject-badge phys">
                            <FlaskConical size={14} /> Physics
                          </span>
                          <span className="subject-badge chem">
                            <BookOpen size={14} /> Chemistry
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Performance" && (
            <div className="performance-view-container">
              <section className="performance-header-section">
                <h2>Performance Overview</h2>
                <p>Track your subject-wise academic achievements, tests, and assignments.</p>
              </section>

              {/* Three Horizontal Cards */}
              <section className="performance-cards-list">
                {performanceData.map((data) => {
                  let Icon = BookOpen;
                  let colorClass = "chem";
                  if (data.subject === "Mathematics") {
                    Icon = Calculator;
                    colorClass = "math";
                  } else if (data.subject === "Physics") {
                    Icon = FlaskConical;
                    colorClass = "phys";
                  }

                  const isSelected = activePerformanceSubject === data.subject;

                  return (
                    <div
                      key={data.subject}
                      className={`performance-subject-card ${colorClass} ${isSelected ? "active" : ""}`}
                      onClick={() => setActivePerformanceSubject(data.subject)}
                    >
                      <div className="card-left-section">
                        <div className={`subject-icon-circle ${colorClass}`}>
                          <Icon size={22} />
                        </div>
                        <div className="subject-meta-text">
                          <h3>{data.subject}</h3>
                          <div className="progress-bar-row">
                            <div className="progress-bar-track">
                              <div
                                className={`progress-bar-fill ${colorClass}`}
                                style={{ width: `${data.progress}%` }}
                              ></div>
                            </div>
                            <span className="progress-pct-label">{data.progress}% Complete</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-right-section">
                        <span className="expand-indicator">
                          {isSelected ? "Active View" : "Click to view"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Selected Subject Details Panel */}
              {activePerformanceSubject && (() => {
                const selectedData = performanceData.find(d => d.subject === activePerformanceSubject);
                if (!selectedData) return null;

                return (
                  <div className="performance-details-panel">
                    <div className="panel-header">
                      <h3>{selectedData.subject} Detailed Summary</h3>
                    </div>
                    <div className="panel-body">
                      {/* Topics Covered */}
                      <div className="details-section-block">
                        <h4 className="section-title">Topics covered:</h4>
                        <div className="topics-list-wrap">
                          {selectedData.topicsCovered.map((topic, i) => (
                            <span key={i} className="topic-item-badge">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tests */}
                      <div className="details-section-block">
                        <h4 className="section-title">Tests:</h4>
                        <div className="details-table-list">
                          {selectedData.tests.map((test, i) => (
                            <div key={i} className="detail-item-row">
                              <span className="item-name">{test.name}</span>
                              <div className="item-status-wrap">
                                <span className="item-score">{test.score}</span>
                                <span className={`item-status-badge ${test.badgeClass}`}>
                                  {test.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assignments */}
                      <div className="details-section-block">
                        <h4 className="section-title">Assignments:</h4>
                        <div className="details-table-list">
                          {selectedData.assignments.map((asgn, i) => (
                            <div key={i} className="detail-item-row">
                              <span className="item-name">{asgn.name}</span>
                              <div className="item-status-wrap">
                                <span className="item-score">{asgn.score}</span>
                                <span className={`item-status-badge ${asgn.badgeClass}`}>
                                  {asgn.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab !== "Dashboard" && activeTab !== "Attendance" && activeTab !== "Study Materials" && activeTab !== "Assignments" && activeTab !== "Weekly Tests" && activeTab !== "Online Classes" && activeTab !== "Notifications" && activeTab !== "Profile" && activeTab !== "Performance" && (
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

      {/* Details Modal Overlay */}
      {activeDetailsAssignment && (
        <div className="custom-modal-overlay" onClick={() => setActiveDetailsAssignment(null)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assignment Details</h3>
              <button className="modal-close-btn" onClick={() => setActiveDetailsAssignment(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h4 className="modal-assignment-title">{activeDetailsAssignment.title}</h4>
              <div className="modal-meta-grid">
                <div>
                  <span className="meta-label">Subject</span>
                  <span className="meta-value">{activeDetailsAssignment.subject}</span>
                </div>
                <div>
                  <span className="meta-label">Status</span>
                  <span className={`status-badge ${activeDetailsAssignment.status.toLowerCase()}`}>
                    {activeDetailsAssignment.status}
                  </span>
                </div>
              </div>
              
              {activeDetailsAssignment.description && (
                <div className="modal-info-block">
                  <span className="meta-label">Description / Instructions</span>
                  <p className="modal-desc-text">{activeDetailsAssignment.description}</p>
                </div>
              )}

              {activeDetailsAssignment.score && (
                <div className="modal-info-block">
                  <span className="meta-label">Grade / Score</span>
                  <span className="modal-score-val">{activeDetailsAssignment.score}</span>
                </div>
              )}

              {activeDetailsAssignment.teacherRemarks && (
                <div className="modal-info-block remarks-block">
                  <span className="meta-label">Teacher Remarks</span>
                  <p className="modal-remarks-text">"{activeDetailsAssignment.teacherRemarks}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {activeTestResult && (
        <div className="custom-modal-overlay" onClick={() => setActiveTestResult(null)}>
          <div className="custom-modal-content test-result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Test Performance Report</h3>
              <button className="modal-close-btn" onClick={() => setActiveTestResult(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h4 className="modal-test-title">{activeTestResult.subject} - {activeTestResult.title}</h4>
              <div className="modal-meta-grid">
                <div>
                  <span className="meta-label">Teacher</span>
                  <span className="meta-value">{activeTestResult.teacher}</span>
                </div>
                <div>
                  <span className="meta-label">Date Taken</span>
                  <span className="meta-value">{activeTestResult.date}</span>
                </div>
                <div>
                  <span className="meta-label">Score</span>
                  <span className="meta-value score-accent">{activeTestResult.marksObtained} / {activeTestResult.totalMarks} ({activeTestResult.percent}%)</span>
                </div>
              </div>

              <div className="test-questions-report">
                <h5>Question-wise Breakdown</h5>
                <div className="questions-list">
                  {activeTestResult.questions.map((q, idx) => (
                    <div key={idx} className={`question-report-item ${q.isCorrect ? "correct" : "incorrect"}`}>
                      <div className="q-header">
                        <span className="q-number">Question {idx + 1}</span>
                        <span className={`q-status-badge ${q.isCorrect ? "correct" : "partial"}`}>
                          {q.marks} Marks
                        </span>
                      </div>
                      <p className="q-text">{q.q}</p>
                      <div className="answers-box">
                        <div className="answer-row">
                          <span className="ans-label">Your Answer:</span>
                          <span className="ans-val student">{q.studentAnswer}</span>
                        </div>
                        <div className="answer-row">
                          <span className="ans-label">Correct Answer:</span>
                          <span className="ans-val correct-ans">{q.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
