import { useState } from "react";
import supabase from '../../lib/supabase';
import { ensureAdminProfile } from '../../services/adminService';
import { ArrowLeft, ShieldAlert, Lock, Eye, EyeOff, Shield } from "lucide-react";
import logo from "../../assets/logo.png";
import "./AdminLogin.css";

const AdminLogin = ({ onNavigate }) => {
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
      // Normalize email to lowercase for consistency
      const normalizedEmail = email.trim().toLowerCase();

      // Authenticate via Supabase auth
      console.log("🔐 Admin login attempt with email:", normalizedEmail);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: normalizedEmail, 
        password: password.trim() 
      });
      
      if (error) {
        console.error("❌ Admin login error:", error.message);
        console.log("Email tried:", normalizedEmail);
        console.log("Password length:", password.trim().length);
        setError(error.message || 'Invalid administrator credentials.');
        setIsLoading(false);
        return;
      }
      
      console.log("✅ Admin auth successful for:", normalizedEmail);

      const userId = data.user.id;

      // Auto-provision the admin profile row on first login so a valid admin
      // (one present in Supabase Auth) can access the dashboard.
      try {
        await ensureAdminProfile(userId, data.user.email);
      } catch (profileErr) {
        console.warn("Could not create/fetch admin profile:", profileErr);
      }

      // Verify this user is actually provisioned as an admin in the
      // admin_profiles table (keyed on the auth user id, matching
      // fetchAdminProfile / ensureAdminProfile).
      const { data: adminData, error: adminError } = await supabase
        .from("admin_profiles")
        .select("id, email, name")
        .eq("id", userId)
        .maybeSingle();

      if (adminError || !adminData) {
        console.error("❌ Not a valid admin account:", normalizedEmail);
        await supabase.auth.signOut();
        setError("This account does not have administrator privileges. Please use the correct login portal.");
        setIsLoading(false);
        return;
      }

      console.log("✅ Admin role verified for:", adminData.email);

      // Remember the admin session marker for downstream in-app convenience.
      localStorage.setItem("gw_admin_logged", "1");

      onNavigate('admin-dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container admin-login-container">
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
          <h2>Admin Portal</h2>
          <p>Log in with your Supabase administrator account to access dashboard controls.</p>
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
              <Shield className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
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
                placeholder="Enter admin password"
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
      </div>
    </div>
  );
};

export default AdminLogin;
