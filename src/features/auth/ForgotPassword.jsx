import { useState } from "react";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import logo from "../../assets/logo.png";
import supabase from "../../lib/supabase";
import "./ForgotPassword.css";

const ForgotPassword = ({ role = "student", onNavigate }) => {
  const isTeacher = role === "teacher";
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);

    if (!email.trim()) {
      setError("Please enter your registered email.");
      return;
    }

    setIsLoading(true);
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const redirectUrl = `${baseUrl}?role=${isTeacher ? "teacher" : "student"}`;
      const { error: sendErr } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo: redirectUrl }
      );
      if (sendErr) throw sendErr;
      setSent(true);
      setEmail("");
    } catch (err) {
      setError(err.message || "Could not send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`reset-container forgot-container ${isTeacher ? "teacher-forgot-container" : ""}`}>
      <button
        className="back-btn"
        onClick={() => onNavigate(isTeacher ? "teacher-login" : "login")}
        aria-label="Go back to login"
      >
        <ArrowLeft size={18} />
        <span>Back to {isTeacher ? "Teacher" : "Student"} Login</span>
      </button>

      <div className="reset-card forgot-card">
        <div className="reset-logo" onClick={() => onNavigate("landing")}>
          <img src={logo} alt="GroWise Logo" />
          <span className="logo-text">GroWise</span>
        </div>

        <div className="reset-header forgot-header">
          <h2>Forgot Password</h2>
          <p>
            Enter your registered email and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="reset-error" role="alert">
            <span className="error-dot"></span>
            {error}
          </div>
        )}

        {sent ? (
          <div className="forgot-success-state" role="status">
            <div className="forgot-success-icon">
              <CheckCircle size={44} />
            </div>
            <h3>Email Sent</h3>
            <p>
              If an account exists for the email you entered, a password reset link
              has been sent. Please check your inbox (and spam folder).
            </p>
            <button
              className="reset-submit-btn forgot-resubmit"
              onClick={() => setSent(false)}
            >
              Resend Link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-form forgot-form">
            <div className="input-group">
              <label htmlFor="forgot-email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  autoComplete="email"
                  className={error ? "input-err" : ""}
                />
              </div>
            </div>

            <button type="submit" className="reset-submit-btn" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
