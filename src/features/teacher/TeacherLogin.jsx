import { useState } from "react";
import { ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";
import supabase from "../../lib/supabase";
import "./TeacherLogin.css";

// Read teachers from the same localStorage store the admin panel uses
const getStoredTeachers = () => {
  try {
    const stored = localStorage.getItem("gw_teachers_v2");
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
};

const TeacherLogin = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const teachers = getStoredTeachers();
        const matched = teachers.find(
          (t) =>
            t.email?.toLowerCase().trim() === email.toLowerCase().trim() &&
            t.password === password
        );

        if (matched || (email.toLowerCase().trim() === "rajesh@growise.edu" && password === "Teacher@123")) {
          const loggedTeacher = matched || {
            id: "TCH101",
            name: "Mr. Rajesh",
            email: "rajesh@growise.edu",
            subjects: ["Mathematics"],
            status: "Active"
          };
          localStorage.setItem("gw_logged_teacher_id", loggedTeacher.id);
          localStorage.setItem("gw_logged_teacher", JSON.stringify(loggedTeacher));
          onNavigate("teacher-dashboard");
        } else {
          setError("Invalid email or password.");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("❌ Unexpected login error:", err);
        setError("An error occurred. Please try again.");
        setIsLoading(false);
      }
    }, 600);
  };

  // Build hint list from stored teachers so admins/testers know what to use
  const storedTeachers = getStoredTeachers();

  return (
    <div className="login-container teacher-login-container">
      {/* Back button */}
      <button className="back-btn" onClick={() => onNavigate("role-selector")} aria-label="Go back to role selection">
        <ArrowLeft size={18} />
        <span>Back to Roles</span>
      </button>

      <div className="login-card">
        {/* Logo Section */}
        <div className="login-logo" onClick={() => onNavigate("landing")}>
          <img src={logo} alt="GroWise Logo" />
          <span className="logo-text">GroWise</span>
        </div>

        <div className="login-header">
          <h2>Teacher Portal</h2>
          <p>Log in to manage your classes, assignments, and students.</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error" role="alert">
            <span className="error-dot"></span>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="teacher-email">Email</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="teacher-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={error ? "input-err" : ""}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="teacher-password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="teacher-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={error ? "input-err" : ""}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Helper credentials hint card to make testing smooth */}
        <div className="credentials-hint">
          <p className="hint-title">Demo Credentials</p>
          <div className="hint-row">
            <span className="hint-label">Email:</span>
            <code className="hint-val">rajesh@growise.edu</code>
          </div>
          <div className="hint-row">
            <span className="hint-label">Password:</span>
            <code className="hint-val">Teacher@123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
