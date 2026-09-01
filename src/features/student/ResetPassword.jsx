import { useState, useEffect } from "react";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import supabase from "../../lib/supabase";
import "./ResetPassword.css";

const ResetPassword = ({ onNavigate }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true = valid, false = invalid
  // Resend link state — MUST be declared before any early returns
  const [resendEmailInput, setResendEmailInput] = useState("");
  const [resendSent, setResendSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Password validation requirements
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false,
  });

  useEffect(() => {
    const processResetToken = async () => {
      try {
        const fullUrl = window.location.href;
        const search = window.location.search;
        
        console.log("🔍 ResetPassword processResetToken - Full URL:", fullUrl);
        
        // 1. Check for error parameters from Supabase
        if (fullUrl.includes("error=")) {
          const errorMatch = fullUrl.match(/error_description=([^&]*)/);
          const errorDesc = errorMatch ? decodeURIComponent(errorMatch[1]).replace(/\+/g, ' ') : "Invalid or expired link";
          setTokenValid(false);
          setError(`Error: ${errorDesc}. Please request a new password reset link below.`);
          return;
        }

        // 2. Check for PKCE exchange code in URL search params
        const searchParams = new URLSearchParams(search);
        const code = searchParams.get("code");
        if (code) {
          console.log("🔑 Found PKCE code, exchanging for session...");
          const { data, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.error("❌ PKCE exchange error:", exchangeErr);
            setTokenValid(false);
            setError("The reset code is invalid or has expired. Please request a new password reset link below.");
            return;
          }
          console.log("✅ PKCE Session established for:", data?.user?.email);
          setTokenValid(true);
          return;
        }

        // 3. Extract access_token / refresh_token from URL
        const accessTokenMatch = fullUrl.match(/access_token=([^&]*)/);
        const refreshTokenMatch = fullUrl.match(/refresh_token=([^&]*)/);
        
        const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
        const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

        if (accessToken) {
          console.log("🔑 Access token found, setting recovery session...");
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          if (sessionError) {
            console.warn("⚠️ Session error with token:", sessionError.message);
          } else {
            console.log("✅ Recovery session set successfully");
          }
          setTokenValid(true);
          return;
        }

        // 4. Check if an active session already exists in Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          console.log("✅ Active recovery session found for:", sessionData.session.user?.email);
          setTokenValid(true);
          return;
        }

        // 5. Fallback
        setTokenValid(false);
        setError("No valid reset token found. Please enter your email below to receive a new password reset link.");
      } catch (err) {
        console.error("❌ Error in processResetToken:", err);
        setTokenValid(false);
        setError("Unable to verify link. Please request a new password reset link below.");
      }
    };

    processResetToken();
  }, []);

  const validatePasswordRealtime = (pwd, confirm) => {
    const newRequirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*]/.test(pwd),
      match: pwd.length > 0 && pwd === confirm,
    };
    setRequirements(newRequirements);
    return newRequirements;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswordRealtime(newPassword, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    validatePasswordRealtime(password, newConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Final validation before submit
    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const allRequirementsMet = Object.values(requirements).every(req => req);
    if (!allRequirementsMet) {
      setError("Password does not meet all requirements.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Updating password via recovery session...");
      
      // Get current session - should be set from recovery token
      const { data: sessionData } = await supabase.auth.getSession();
      
      console.log("📋 Current session:", !!sessionData?.session);
      console.log("📋 Session access_token:", !!sessionData?.session?.access_token);
      console.log("📋 Session user:", sessionData?.session?.user?.email);
      
      if (!sessionData?.session?.access_token) {
        throw new Error("No active recovery session. Please use the link from the email.");
      }

      console.log("✅ Recovery session active for:", sessionData.session.user?.email);

      // Update password using the recovery session
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        console.error("❌ Password update error:", updateError);
        console.error("Error code:", updateError.status);
        console.error("Error message:", updateError.message);
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      console.log("✅ Password updated successfully in Supabase Auth");
      console.log("Updated user:", updateData?.user?.email);
      
      // Sign out to force re-login with new password
      await supabase.auth.signOut();
      console.log("✅ Signed out - user must login with new password");
      
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      // Reset URL so the lingering ?role=student param (used to detect the
      // reset redirect) doesn't force the reset view again on redirect.
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.hash
      );

      // Redirect to login after 2 seconds
      setTimeout(() => {
        onNavigate("login");
      }, 2000);
    } catch (err) {
      console.error("❌ Password reset error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
      setIsLoading(false);
    }
  };

  // Show loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="reset-container">
        <button className="back-btn" onClick={() => onNavigate("landing")} aria-label="Go back to home">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </button>

        <div className="reset-card">
          <div className="loading-spinner"></div>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }


  const handleResendResetLink = async (e) => {
    e.preventDefault();
    if (!resendEmailInput.trim()) return;
    setResendLoading(true);
    try {
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/#/reset-password`;
      const { error: sendErr } = await supabase.auth.resetPasswordForEmail(resendEmailInput.trim().toLowerCase(), {
        redirectTo: redirectUrl,
      });
      if (sendErr) throw sendErr;
      setResendSent(true);
    } catch (err) {
      alert("Could not send password reset email: " + (err.message || "Please check the email address."));
    } finally {
      setResendLoading(false);
    }
  };

  // Show error if token invalid
  if (tokenValid === false) {
    return (
      <div className="reset-container">
        <button className="back-btn" onClick={() => onNavigate("landing")} aria-label="Go back to home">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </button>

        <div className="reset-card">
          <div className="reset-logo" onClick={() => onNavigate("landing")}>
            <img src={logo} alt="GroWise Logo" />
            <span className="logo-text">GroWise</span>
          </div>

          <div className="error-state">
            <AlertCircle size={48} className="error-icon" />
            <h2>Invalid or Expired Link</h2>
            <p>{error || "The password reset link is invalid or has expired."}</p>

            {resendSent ? (
              <div className="reset-error" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)", padding: "12px", borderRadius: "8px", margin: "16px 0" }}>
                ✅ A fresh password reset link has been sent to <strong>{resendEmailInput}</strong>. Please check your inbox!
              </div>
            ) : (
              <form onSubmit={handleResendResetLink} style={{ margin: "20px 0 10px 0", width: "100%" }}>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>Enter your registered email to receive a fresh password reset link:</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input 
                    type="email" 
                    required 
                    placeholder="Enter your email" 
                    value={resendEmailInput}
                    onChange={(e) => setResendEmailInput(e.target.value)}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                  <button type="submit" className="reset-submit-btn" style={{ width: "auto", padding: "10px 16px", margin: 0 }} disabled={resendLoading}>
                    {resendLoading ? "Sending..." : "Request New Link"}
                  </button>
                </div>
              </form>
            )}

            <div className="error-actions">
              <button 
                className="reset-submit-btn"
                style={{ backgroundColor: "#64748b" }}
                onClick={() => onNavigate("login")}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="reset-container">
        <div className="reset-card">
          <div className="reset-logo" onClick={() => onNavigate("landing")}>
            <img src={logo} alt="GroWise Logo" />
            <span className="logo-text">GroWise</span>
          </div>

          <div className="success-state">
            <CheckCircle size={48} className="success-icon" />
            <h2>Password Reset Successful!</h2>
            <p>Your password has been updated. Redirecting to login...</p>
            <button 
              className="reset-submit-btn"
              onClick={() => onNavigate("login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show reset form
  return (
    <div className="reset-container">
      <button className="back-btn" onClick={() => onNavigate("landing")} aria-label="Go back to home">
        <ArrowLeft size={18} />
        <span>Back to Home</span>
      </button>

      <div className="reset-card">
        <div className="reset-logo" onClick={() => onNavigate("landing")}>
          <img src={logo} alt="GroWise Logo" />
          <span className="logo-text">GroWise</span>
        </div>

        <div className="reset-header">
          <h2>Set Your Password</h2>
          <p>Create a strong password to secure your account.</p>
        </div>

        {error && (
          <div className="reset-error" role="alert">
            <span className="error-dot"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="input-group">
            <label htmlFor="password">New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                className={error ? "input-err" : ""}
                autoComplete="new-password"
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

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm password"
                className={error ? "input-err" : ""}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="password-requirements">
            <p className="requirement-title">Password Requirements:</p>
            <ul>
              <li className={requirements.length ? "met" : "unmet"}>
                <span className="requirement-icon">{requirements.length ? "✓" : "✕"}</span>
                At least 8 characters
              </li>
              <li className={requirements.uppercase ? "met" : "unmet"}>
                <span className="requirement-icon">{requirements.uppercase ? "✓" : "✕"}</span>
                Uppercase letter (A-Z)
              </li>
              <li className={requirements.lowercase ? "met" : "unmet"}>
                <span className="requirement-icon">{requirements.lowercase ? "✓" : "✕"}</span>
                Lowercase letter (a-z)
              </li>
              <li className={requirements.number ? "met" : "unmet"}>
                <span className="requirement-icon">{requirements.number ? "✓" : "✕"}</span>
                Number (0-9)
              </li>
              <li className={requirements.special ? "met" : "unmet"}>
                <span className="requirement-icon">{requirements.special ? "✓" : "✕"}</span>
                Special character (!@#$%^&*)
              </li>
              {confirmPassword && (
                <li className={requirements.match ? "met" : "unmet"}>
                  <span className="requirement-icon">{requirements.match ? "✓" : "✕"}</span>
                  Passwords match
                </li>
              )}
            </ul>
          </div>

          <button type="submit" className="reset-submit-btn" disabled={isLoading || !Object.values(requirements).every(req => req)}>
            {isLoading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
