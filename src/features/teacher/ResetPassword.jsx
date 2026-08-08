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
    // Check if reset token is in URL hash and set session
    const processResetToken = async () => {
      const hash = window.location.hash;
      const fullUrl = window.location.href;
      
      console.log("DEBUG - Full URL:", fullUrl);
      console.log("DEBUG - Hash:", hash);
      
      // Check for error parameters from Supabase
      if (hash.includes("error=")) {
        const errorMatch = hash.match(/error_description=([^&]*)/);
        const errorDesc = errorMatch ? decodeURIComponent(errorMatch[1]).replace(/\+/g, ' ') : "Invalid or expired link";
        setTokenValid(false);
        setError(`Error: ${errorDesc}. Please request a new password reset email.`);
        return;
      }
      
      // Extract token and type from hash
      const accessTokenMatch = hash.match(/access_token=([^&]*)/);
      const typeMatch = hash.match(/type=([^&]*)/);
      const refreshTokenMatch = hash.match(/refresh_token=([^&]*)/);
      
      const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
      const type = typeMatch ? typeMatch[1] : null;
      const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;
      
      console.log("DEBUG - Access Token found:", !!accessToken);
      console.log("DEBUG - Token Type:", type);
      console.log("DEBUG - Has refresh_token:", !!refreshToken);
      
      // If we have an access token with recovery type, set it as the session
      if (accessToken && type === 'recovery') {
        try {
          console.log("DEBUG - Setting recovery session...");
          
          // Set the session using the token from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (sessionError) {
            console.error("DEBUG - Session error:", sessionError);
            setTokenValid(true); // Let them try anyway
          } else {
            console.log("DEBUG - Session set successfully");
            setTokenValid(true);
          }
        } catch (err) {
          console.error("DEBUG - Error setting session:", err);
          setTokenValid(true); // Let them try anyway
        }
      } else if (accessToken) {
        // Token exists but might not be recovery type, try anyway
        console.log("DEBUG - Token exists but type unclear, attempting to set session");
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError("Invalid or missing reset token. Please request a new password reset email.");
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

      // Redirect to teacher login after 2 seconds
      setTimeout(() => {
        window.location.hash = "/teacher";
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
            <p>{error || "The password reset link is invalid or has expired. It is valid for 1 hour from the time it was sent."}</p>
            <div className="error-actions">
              <button 
                className="reset-submit-btn"
                onClick={() => onNavigate("teacher-login")}
              >
                Back to Login
              </button>
              <p className="help-text">Check the browser console (F12) for debug information. If the link is expired, please contact your administrator to resend it.</p>
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
              onClick={() => onNavigate("teacher-login")}
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
