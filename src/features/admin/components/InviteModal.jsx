import { useState, useEffect } from "react";
import { X, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import "./InviteModal.css";

const InviteModal = ({ isOpen, onClose, email, name, role, onSend }) => {
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      handleSend();
    }
  }, [isOpen]);

  const handleSend = async () => {
    setStatus("sending");
    setErrorMsg("");
    try {
      await onSend();
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message || "Failed to send email. Please try again.");
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setErrorMsg("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="invite-modal-overlay" onClick={handleClose}>
      <div className="invite-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="invite-modal-close" onClick={handleClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* ─── SENDING STATE ─── */}
        {status === "sending" && (
          <div className="invite-modal-body center-state">
            <div className="invite-icon-wrapper sending">
              <Loader2 size={32} className="spin-icon" />
            </div>
            <h3>Sending Email...</h3>
            <p className="invite-desc">Delivering password setup link to <strong>{email}</strong></p>
          </div>
        )}

        {/* ─── SUCCESS STATE ─── */}
        {status === "success" && (
          <div className="invite-modal-body center-state">
            <div className="invite-icon-wrapper success">
              <CheckCircle size={32} />
            </div>
            <h3>Email Sent Successfully!</h3>
            <p className="invite-desc">
              Password setup link has been sent to <strong>{email}</strong>.
            </p>

            <div className="invite-modal-actions">
              <button className="btn-modal-done" onClick={handleClose}>Done</button>
            </div>
          </div>
        )}

        {/* ─── ERROR STATE ─── */}
        {status === "error" && (
          <div className="invite-modal-body center-state">
            <div className="invite-icon-wrapper error">
              <AlertCircle size={32} />
            </div>
            <h3>Failed to Send Email</h3>
            <p className="invite-desc error-text">{errorMsg}</p>

            <div className="invite-info-box error-info">
              <p>Common causes:</p>
              <ul>
                <li>Email rate limit exceeded (wait a few minutes)</li>
                <li>SMTP provider not configured in Supabase</li>
                <li>Invalid email address format</li>
              </ul>
            </div>

            <div className="invite-modal-actions">
              <button className="btn-modal-cancel" onClick={handleClose}>Close</button>
              <button className="btn-modal-retry" onClick={handleSend}>
                <Mail size={16} />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteModal;
