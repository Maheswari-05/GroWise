import { useState } from "react";
import { User, Mail, Phone, BookOpen, GraduationCap, Calendar, Shield, Edit3, Key, X, Check } from "lucide-react";
import "./Profile.css";

const Profile = ({ teacherProfile, setTeacherProfile }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Edit fields state
  const [editName, setEditName] = useState(teacherProfile.name);
  const [editEmail, setEditEmail] = useState(teacherProfile.email);
  const [editPhone, setEditPhone] = useState(teacherProfile.phone);
  const [editQualification, setEditQualification] = useState(teacherProfile.qualification);
  const [editAvatar, setEditAvatar] = useState(teacherProfile.avatar || "");

  // Password fields state
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...teacherProfile,
      name: editName,
      email: editEmail,
      phone: editPhone,
      qualification: editQualification,
      avatar: editAvatar,
    };
    setTeacherProfile(updated);

    try {
      localStorage.setItem("gw_logged_teacher", JSON.stringify(updated));
      const teachersRaw = localStorage.getItem("gw_teachers_v2");
      if (teachersRaw) {
        const teachers = JSON.parse(teachersRaw);
        const idx = teachers.findIndex((t) => t.id === updated.id || t.email === updated.email);
        if (idx !== -1) {
          teachers[idx] = { ...teachers[idx], name: editName, email: editEmail, contact: editPhone, phone: editPhone, avatar: editAvatar };
          localStorage.setItem("gw_teachers_v2", JSON.stringify(teachers));
        }
      }
    } catch (err) {
      console.error("Error saving profile to localStorage:", err);
    }

    setShowEditModal(false);
    alert("Profile details updated successfully!");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password changed successfully!");
    setShowPasswordModal(false);
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="profile-page-container">
      <div className="profile-grid">
        {/* Left Side: Summary Card */}
        <div className="profile-card profile-summary-card">
          <div className="profile-avatar-wrapper">
            {teacherProfile.avatar ? (
              <img src={teacherProfile.avatar} alt={teacherProfile.name} className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-blank">
                {teacherProfile.name ? teacherProfile.name.charAt(0).toUpperCase() : "T"}
              </div>
            )}
          </div>

          <h2 className="profile-summary-name">{teacherProfile.name}</h2>
          <span className="profile-summary-role">Professional Educator</span>
          <span className="profile-id-badge">ID: {teacherProfile.id}</span>

          <div className="profile-summary-divider"></div>

          <div className="profile-quick-actions">
            <button className="profile-btn-primary" onClick={() => setShowEditModal(true)}>
              <Edit3 size={15} /> Edit Profile
            </button>
            <button className="profile-btn-secondary" onClick={() => setShowPasswordModal(true)}>
              <Key size={15} /> Change Password
            </button>
          </div>
        </div>

        {/* Right Side: Detailed Cards */}
        <div className="profile-details-column">
          {/* Card 1: Personal & Contact Info */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Personal & Contact Information</h3>
            </div>
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <div className="profile-icon-box"><User size={16} /></div>
                <div className="profile-detail-text">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{teacherProfile.name}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-icon-box"><Mail size={16} /></div>
                <div className="profile-detail-text">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{teacherProfile.email}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-icon-box"><Phone size={16} /></div>
                <div className="profile-detail-text">
                  <span className="detail-label">Contact Number</span>
                  <span className="detail-value">{teacherProfile.phone}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-icon-box"><GraduationCap size={16} /></div>
                <div className="profile-detail-text">
                  <span className="detail-label">Qualifications</span>
                  <span className="detail-value">{teacherProfile.qualification}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-icon-box"><Shield size={16} /></div>
                <div className="profile-detail-text">
                  <span className="detail-label">Experience</span>
                  <span className="detail-value">{teacherProfile.experience}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="profile-icon-box"><Calendar size={16} /></div>
                <div className="profile-detail-text">
                  <span className="detail-label">Joining Date</span>
                  <span className="detail-value">{teacherProfile.joiningDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Assigned Workload */}
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Assigned Batches & Subjects</h3>
            </div>
            <div className="profile-workload-sections">
              <div className="workload-section">
                <span className="workload-title">Subjects Taught</span>
                <div className="workload-tags">
                  {teacherProfile.subjects.map((sub, i) => (
                    <span key={i} className="workload-tag sub-tag">
                      <BookOpen size={13} /> {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="workload-section">
                <span className="workload-title">Active Batches</span>
                <div className="workload-tags">
                  {teacherProfile.batches.map((batch, i) => (
                    <span key={i} className="workload-tag batch-tag">
                      <GraduationCap size={13} /> {batch}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <h3>Edit Profile</h3>
              <button className="profile-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="profile-form-group">
                <label>Profile Photo</label>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "4px" }}>
                  {editAvatar ? (
                    <img
                      src={editAvatar}
                      alt="Profile preview"
                      style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid #cbd5e1" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "#e2e8f0",
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "18px",
                      }}
                    >
                      {editName ? editName.charAt(0).toUpperCase() : "T"}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <label
                      style={{
                        cursor: "pointer",
                        padding: "7px 14px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        color: "#334155",
                        display: "inline-block",
                      }}
                    >
                      Browse Photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setEditAvatar(ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {editAvatar && (
                      <button
                        type="button"
                        onClick={() => setEditAvatar("")}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: "6px",
                        }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label>Qualifications</label>
                <input
                  type="text"
                  required
                  value={editQualification}
                  onChange={(e) => setEditQualification(e.target.value)}
                />
              </div>

              <div className="profile-modal-footer">
                <button type="button" className="profile-btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="profile-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="profile-modal-overlay">
          <div className="profile-modal">
            <div className="profile-modal-header">
              <h3>Change Password</h3>
              <button className="profile-modal-close" onClick={() => setShowPasswordModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="profile-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  required
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="profile-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="profile-modal-footer">
                <button type="button" className="profile-btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="profile-btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
