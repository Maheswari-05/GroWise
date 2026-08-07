import { useState } from "react";
import { User, Lock, Mail, Shield, AlertTriangle, CheckCircle, LogOut } from "lucide-react";
import avatarImg from "../../../assets/courses/human2.jpg";

const ProfileTab = ({ 
  profile, 
  onUpdateProfile, 
  onChangePassword,
  onLogout 
}) => {
  // Details form
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("success"); // 'success' | 'error'

  // Password form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateDetails = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setStatusType("error");
      setStatusMsg("Please enter a valid Name and Email.");
      return;
    }

    onUpdateProfile({ name, email });
    setStatusType("success");
    setStatusMsg("Profile details updated successfully.");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setStatusType("error");
      setStatusMsg("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusType("error");
      setStatusMsg("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setStatusType("error");
      setStatusMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      await onChangePassword(oldPassword, newPassword);
      setStatusType("success");
      setStatusMsg("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setStatusType("error");
      setStatusMsg(err.message || "Failed to change password.");
    }
    setTimeout(() => setStatusMsg(""), 3000);
  };

  return (
    <div className="tab-wrapper animate-fade-in">
      <div className="section-header-bar">
        <h2>Admin Profile Settings</h2>
      </div>

      {statusMsg && (
        <div className={`alert-message ${statusType === "success" ? "success-alert" : "error-alert"} mb-20 animate-fade-in`}>
          {statusType === "success" ? <CheckCircle size={18} className="alert-icon" /> : <AlertTriangle size={18} className="alert-icon" />}
          <span className="alert-text">{statusMsg}</span>
        </div>
      )}

      <div className="profile-settings-layout">
        {/* Personal Details Form */}
        <div className="profile-details-card">
          <div className="card-heading">
            <User size={18} />
            <h3>Administrative Profile Details</h3>
          </div>

          <div className="admin-profile-avatar-row mt-20">
            <img src={avatarImg} alt="Admin Avatar" className="admin-profile-avatar-large" />
            <div className="avatar-meta">
              <h4>{profile.name}</h4>
              <p className="text-xs text-muted">System Level Access: Admin</p>
            </div>
          </div>

          <form onSubmit={handleUpdateDetails} className="admin-form mt-20">
            <div className="form-control">
              <label htmlFor="admin-name">Display Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={16} />
                <input 
                  id="admin-name"
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter admin display name"
                />
              </div>
            </div>

            <div className="form-control mt-15">
              <label htmlFor="admin-email">Administrator Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={16} />
                <input 
                  id="admin-email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter contact email address"
                />
              </div>
            </div>

            <div className="form-control mt-15">
              <label>Administrative Role</label>
              <div className="input-wrapper">
                <Shield className="input-icon text-muted" size={16} />
                <input 
                  type="text" 
                  value="Super Admin" 
                  disabled 
                  className="bg-disabled"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary mt-20">Update Details</button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="profile-details-card">
          <div className="card-heading">
            <Lock size={18} />
            <h3>Change Portal Password</h3>
          </div>

          <form onSubmit={handleChangePassword} className="admin-form mt-20">
            <div className="form-control">
              <label htmlFor="old-pass">Current Password *</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={16} />
                <input 
                  id="old-pass"
                  type="password" 
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
            </div>

            <div className="form-control mt-15">
              <label htmlFor="new-pass">New Password *</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={16} />
                <input 
                  id="new-pass"
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div className="form-control mt-15">
              <label htmlFor="conf-pass">Confirm New Password *</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={16} />
                <input 
                  id="conf-pass"
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary mt-20">Change Password</button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
