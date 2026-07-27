import { useState } from "react";
import { ArrowLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";
import "./Login.css";

const Login = ({ onNavigate }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    // Simulate small latency for realistic loading experience
    setTimeout(() => {
      if (username === "Sneha" && password === "Sneha@123") {
        onNavigate("dashboard");
      } else {
        setError("Invalid username or password.");
        setIsLoading(false);
      }
    }, 600);
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
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={error ? "input-err" : ""}
                autoComplete="username"
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
        </form>

        {/* Helper credentials hint card to make testing smooth */}
        <div className="credentials-hint">
          <p className="hint-title">Demo Credentials</p>
          <div className="hint-row">
            <span className="hint-label">Username:</span>
            <code className="hint-val">Sneha</code>
          </div>
          <div className="hint-row">
            <span className="hint-label">Password:</span>
            <code className="hint-val">Sneha@123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
