import { useState } from "react";
import { ArrowLeft, HelpCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import "./RoleSelector.css";

const RoleSelector = ({ onNavigate }) => {
  const [hoveredRole, setHoveredRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    
    // Navigate to appropriate login based on role
    setTimeout(() => {
      if (role === "admin") {
        onNavigate("admin-login");
      } else if (role === "teacher") {
        onNavigate("teacher-login");
      } else if (role === "student") {
        onNavigate("login");
      }
    }, 300);
  };

  return (
    <div className="role-selector-container">
      {/* Navbar Header */}
      <nav className="role-selector-navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button 
              className="navbar-back-btn" 
              onClick={() => onNavigate("landing")}
            >
              <ArrowLeft size={18} />
              <span>Back to Home</span>
            </button>
            <div className="navbar-logo">
              <img src={logo} alt="GroWise Logo" />
              <span className="navbar-logo-text">GroWise</span>
            </div>
          </div>
          <button className="navbar-help-btn" title="Need help?">
            <HelpCircle size={20} />
            <span>Need help?</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="role-selector-content">
        {/* Header */}
        <div className="role-selector-header">
          <h1>Welcome to <span className="gradient-text">GroWise</span></h1>
          <p>Choose your role to continue</p>
        </div>

        {/* Role Selection Cards */}
        <div className="role-cards-container">
          {/* Admin Card */}
          <div
            className={`role-card admin-card ${
              hoveredRole === "admin" ? "hovered" : ""
            } ${selectedRole === "admin" ? "selected" : ""}`}
            onMouseEnter={() => setHoveredRole("admin")}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => handleRoleSelect("admin")}
          >
            <div className="card-top-border admin-border"></div>
            <div className="card-content">
              <div className="role-card-icon-wrapper admin-icon-wrapper">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  {/* Shield with gear */}
                  <path d="M32 8L16 16V28C16 40 32 50 32 50C32 50 48 40 48 28V16L32 8Z" fill="#2563eb" fillOpacity="0.2" stroke="#2563eb" strokeWidth="2"/>
                  <circle cx="32" cy="28" r="6" fill="none" stroke="#2563eb" strokeWidth="2"/>
                  <circle cx="26" cy="22" r="1.5" fill="#2563eb"/>
                  <circle cx="38" cy="22" r="1.5" fill="#2563eb"/>
                  <circle cx="26" cy="34" r="1.5" fill="#2563eb"/>
                  <circle cx="38" cy="34" r="1.5" fill="#2563eb"/>
                </svg>
              </div>
              <h2 className="role-card-title">Administrator</h2>
              <p className="role-card-description">
                Manage the entire platform, users, and content
              </p>
              <button className="role-card-btn admin-btn">
                Admin Login
              </button>
            </div>
          </div>

          {/* Teacher Card */}
          <div
            className={`role-card teacher-card ${
              hoveredRole === "teacher" ? "hovered" : ""
            } ${selectedRole === "teacher" ? "selected" : ""}`}
            onMouseEnter={() => setHoveredRole("teacher")}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => handleRoleSelect("teacher")}
          >
            <div className="card-top-border teacher-border"></div>
            <div className="card-content">
              <div className="role-card-icon-wrapper teacher-icon-wrapper">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  {/* Teacher: Person with presentation/board */}
                  <circle cx="32" cy="18" r="6" fill="#10b981"/>
                  <path d="M24 28C24 24.13 27.58 21 32 21C36.42 21 40 24.13 40 28" fill="none" stroke="#10b981" strokeWidth="2"/>
                  <path d="M22 28V48C22 50.21 23.79 52 26 52H38C40.21 52 42 50.21 42 48V28" fill="none" stroke="#10b981" strokeWidth="2"/>
                  <rect x="26" y="32" width="12" height="14" fill="none" stroke="#10b981" strokeWidth="1.5"/>
                  <line x1="32" y1="32" x2="32" y2="46" stroke="#10b981" strokeWidth="1.5"/>
                  <line x1="26" y1="38" x2="38" y2="38" stroke="#10b981" strokeWidth="1"/>
                </svg>
              </div>
              <h2 className="role-card-title teacher-title">Teacher</h2>
              <p className="role-card-description">
                Create assignments, manage classes, and track student progress
              </p>
              <button className="role-card-btn teacher-btn">
                Teacher Login
              </button>
            </div>
          </div>

          {/* Student Card */}
          <div
            className={`role-card student-card ${
              hoveredRole === "student" ? "hovered" : ""
            } ${selectedRole === "student" ? "selected" : ""}`}
            onMouseEnter={() => setHoveredRole("student")}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => handleRoleSelect("student")}
          >
            <div className="card-top-border student-border"></div>
            <div className="card-content">
              <div className="role-card-icon-wrapper student-icon-wrapper">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  {/* Student: Graduation cap with book/diploma */}
                  <path d="M16 32L32 22L48 32V38C48 45.18 40.84 50 32 50C23.16 50 16 45.18 16 38V32Z" fill="none" stroke="#a855f7" strokeWidth="2"/>
                  <path d="M32 22V50" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="1,2" opacity="0.5"/>
                  <rect x="22" y="34" width="10" height="12" rx="1" fill="none" stroke="#a855f7" strokeWidth="1.5"/>
                  <line x1="24" y1="37" x2="30" y2="37" stroke="#a855f7" strokeWidth="1"/>
                  <line x1="24" y1="40" x2="30" y2="40" stroke="#a855f7" strokeWidth="1"/>
                  <line x1="24" y1="43" x2="30" y2="43" stroke="#a855f7" strokeWidth="1"/>
                </svg>
              </div>
              <h2 className="role-card-title student-title">Student</h2>
              <p className="role-card-description">
                Access your courses, submit assignments, and view grades
              </p>
              <button className="role-card-btn student-btn">
                Student Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
