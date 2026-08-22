import { useState } from "react";
import { HelpCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import adminIcon from "../../assets/roleselection/admin.png";
import teacherIcon from "../../assets/roleselection/teacher.png";
import studentIcon from "../../assets/roleselection/student.png";
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
          <div className="navbar-logo" onClick={() => onNavigate("landing")}>
            <img src={logo} alt="GroWise Logo" />
            <span className="navbar-logo-text">GroWise</span>
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
                <img src={adminIcon} alt="Administrator" className="role-icon-img" />
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
                <img src={teacherIcon} alt="Teacher" className="role-icon-img" />
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
                <img src={studentIcon} alt="Student" className="role-icon-img" />
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
