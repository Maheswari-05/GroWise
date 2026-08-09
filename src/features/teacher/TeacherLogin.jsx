import { useState } from "react";
import { ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";
import supabase from "../../lib/supabase";
import "./TeacherLogin.css";

const TeacherLogin = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("🔐 Teacher login attempt with email:", normalizedEmail);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      });

      if (authError) {
        console.error("❌ Teacher login error:", authError.message);
        setError("Invalid email or password. Please check and try again.");
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        console.log("✅ Teacher login successful for:", data.user.email);
        onNavigate("teacher-dashboard");
      } else {
        setError("Login failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("❌ Unexpected login error:", err);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

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

        {/* Helper text */}
        <div className="credentials-hint">
          <p className="hint-title">First Time Login?</p>
          <p>An admin should have sent you a password setup email. Click the link in that email to create your password.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
