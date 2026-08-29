import { useState } from "react";
import { ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";
import supabase from "../../lib/supabase";
import "./Login.css";

const Login = ({ onNavigate }) => {
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

    // Clear any previously cached student so the dashboard always loads
    // the freshly authenticated user instead of a stale localStorage entry.
    localStorage.removeItem("gw_logged_student");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      console.log("🔐 Student login attempt with email:", normalizedEmail);

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: password.trim(),
      });

      if (authError) {
        console.error("❌ Student login error:", authError.message);
        console.log("Email tried:", normalizedEmail);
        console.log("Password length:", password.trim().length);
        setError("Invalid email or password. Please check and try again.");
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        console.log("✅ Student login successful for:", data.user.email);
        console.log("User ID:", data.user.id);
        onNavigate("dashboard");
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
    <div className="login-container">
      {/* Back button */}
      <button className="back-btn" onClick={() => onNavigate("landing")} aria-label="Go back to home">
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </button>

      <div className="login-card">
        {/* Logo Section */}
        <div className="login-logo" onClick={() => onNavigate("landing")}>
          <img src={logo} alt="GroWise Logo" />
          <span className="logo-text">GroWise</span>
        </div>

        <div className="login-header">
          <h2>Student Portal</h2>
          <p>Log in to access your dashboard, courses, and materials.</p>
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
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="email"
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
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
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

          <div className="forgot-password-section">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => onNavigate("forgot-password")}
            >
              Forgot password?
            </button>
          </div>
        </form>

        
      </div>
    </div>
  );
};

export default Login;
