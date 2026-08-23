import { useState } from "react";
import { Search, Filter, Plus, Eye, Edit2, Trash2, ArrowLeft, Check, X, ShieldAlert, Award, FileText, Calendar, Mail, Phone, BookOpen, Layers, Users, Send } from "lucide-react";
import { sendPasswordInviteEmail } from "../../../services/adminService";
import InviteModal from "./InviteModal";

const TeachersTab = ({
  teachers,
  students,
  batches,
  subjects,
  attendanceLogs,
  assignments,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}) => {
  const [view, setView] = useState("list"); // 'list' | 'form' | 'profile'
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Delete confirmation modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Form validation error
  const [formError, setFormError] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const generateTeacherId = () => {
    const suffix = Date.now().toString().slice(-6);
    return `TCH${suffix}`;
  };

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    contact: "",
    email: "",
    qualification: "",
    experience: "",
    subjects: [],
    status: "Active"
  });

  const handleAddNewClick = () => {
    setFormData({
      id: generateTeacherId(),
      name: "",
      contact: "",
      email: "",
      qualification: "",
      experience: "",
      subjects: [],
      status: "Active"
    });
    setEditMode(false);
    setView("form");
  };

  const handleEditClick = (teacher) => {
    setFormData({
      id: teacher.id,
      name: teacher.name,
      contact: teacher.contact,
      email: teacher.email || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      subjects: teacher.subjects || [],
      status: teacher.status || "Active"
    });
    setEditMode(true);
    setView("form");
  };

  const handleViewProfile = (teacher) => {
    setSelectedTeacher(teacher);
    setView("profile");
  };

  const handleToggleSubject = (subjName) => {
    setFormData(prev => {
      const idx = prev.subjects.indexOf(subjName);
      if (idx > -1) {
        return { ...prev, subjects: prev.subjects.filter(s => s !== subjName) };
      } else {
        return { ...prev, subjects: [...prev.subjects, subjName] };
      }
    });
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.contact || formData.subjects.length === 0) {
      alert("Please enter a Name, Contact, and select at least one Subject.");
      return;
    }

    const saveResult = editMode
      ? await onUpdateTeacher(formData)
      : await onAddTeacher(formData);

    if (saveResult === false) {
      alert("Failed to save teacher details. Please check the data and try again.");
      return;
    }

    setView("list");
  };

  const handleDeleteClick = (teacherId) => {
    if (confirm("Are you sure you want to delete this faculty record?")) {
      onDeleteTeacher(teacherId);
      if (view === "profile") {
        setView("list");
      }
    }
  };

  // Filtering
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = filterSubject === "All" || (t.subjects && t.subjects.includes(filterSubject));
    const matchesStatus = filterStatus === "All" || t.status === filterStatus;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <div className="tab-wrapper">
      {view === "list" && (
        <div className="list-view-container animate-fade-in">
          <div className="section-header-bar">
            <h2>Faculty roster</h2>
            <button className="add-primary-btn" onClick={handleAddNewClick}>
              <Plus size={16} />
              <span>Add New Teacher</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="filters-panel">
            <div className="search-bar-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by Teacher Name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-dropdowns">
              <div className="filter-group">
                <Filter size={14} className="filter-icon" />
                <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                  <option value="All">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Teachers Data Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Teacher ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Assigned Subjects</th>
                  <th>Students Handled</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table-row">No faculty members found.</td>
                  </tr>
                ) : (
                  filteredTeachers.map(t => {
                    // Count students handled
                    const handledCount = students.filter(s =>
                      s.subjects && s.subjects.some(sub => t.subjects.includes(sub))
                    ).length;

                    return (
                      <tr key={t.id} className="hover-row">
                        <td className="font-mono font-bold text-primary">{t.id}</td>
                        <td>
                          <div className="profile-cell-info">
                            <span className="font-semibold block">{t.name}</span>
                            <span className="text-xs text-muted font-mono">{t.email || "No email"}</span>
                          </div>
                        </td>
                        <td>{t.contact}</td>
                        <td>
                          <div className="tag-badges-container">
                            {t.subjects && t.subjects.map(s => (
                              <span className="badge-tag subject" key={s}>{s}</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="count-pill">{handledCount} students</span>
                        </td>
                        <td>
                          <span className={`status-badge-pill ${t.status === "Active" ? "active" : "inactive"}`}>
                            {t.status || "Active"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <button className="action-btn view" title="View Profile" onClick={() => handleViewProfile(t)}>
                              <Eye size={16} />
                            </button>
                            <button className="action-btn edit" title="Edit Faculty" onClick={() => handleEditClick(t)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="action-btn delete" title="Delete Faculty" onClick={() => handleDeleteClick(t.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "form" && (
        <div className="form-view-container animate-fade-in">
          <div className="section-header-bar">
            <button className="back-link-btn" onClick={() => setView("list")}>
              <ArrowLeft size={16} />
              <span>Back to List</span>
            </button>
            <h2>{editMode ? `Edit Faculty Member (${formData.id})` : "Add New Teacher"}</h2>
          </div>

          <form className="admin-form" onSubmit={handleSaveForm}>
            <div className="form-grid">
              {/* Personal Details */}
              <div className="form-card-column">
                <h3>Personal Information</h3>

                <div className="form-control">
                  <label htmlFor="tch-name">Full Name *</label>
                  <input
                    id="tch-name"
                    type="text"
                    required
                    placeholder="Enter teacher's full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-control-row">
                  <div className="form-control">
                    <label htmlFor="tch-contact">Contact Number *</label>
                    <input
                      id="tch-contact"
                      type="text"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label htmlFor="tch-status">Status</label>
                    <select
                      id="tch-status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label htmlFor="tch-email">Email Address</label>
                  <input
                    id="tch-email"
                    type="email"
                    placeholder="e.g. teacher@growise.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-control-row">
                  <div className="form-control">
                    <label htmlFor="tch-qual">Qualification</label>
                    <input
                      id="tch-qual"
                      type="text"
                      placeholder="e.g. M.Sc. in Physics, B.Ed."
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label htmlFor="tch-exp">Experience</label>
                    <input
                      id="tch-exp"
                      type="text"
                      placeholder="e.g. 5+ Years"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Subject assignments & logins */}
              <div className="form-card-column">
                <h3>Department Assignments & Access</h3>

                {/* Subject checkboxes */}
                <div className="form-control">
                  <label>Assigned Subjects (Multi-select) *</label>
                  <div className="checkboxes-grid">
                    {subjects.map(s => {
                      const isSelected = formData.subjects.includes(s.name);
                      return (
                        <div
                          key={s.id}
                          className={`checkbox-item ${isSelected ? "checked" : ""}`}
                          onClick={() => handleToggleSubject(s.name)}
                        >
                          <span className="checkbox-indicator">
                            {isSelected && <Check size={12} />}
                          </span>
                          <span>{s.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>


              </div>
            </div>

            <div className="form-actions-bar">
              <button type="button" className="btn-secondary" onClick={() => setView("list")}>Cancel</button>
              {formData.email && (
                <button
                  type="button"
                  className="btn-invite-action"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <Send size={16} />
                  <span>Send Password Setup Email</span>
                </button>
              )}
              <button type="submit" className="btn-primary">Save Faculty Record</button>
            </div>
          </form>
        </div>
      )}

      {view === "profile" && selectedTeacher && (
        <div className="profile-view-container animate-fade-in">
          {/* Header Actions */}
          <div className="profile-header-strip">
            <button className="back-link-btn" onClick={() => setView("list")}>
              <ArrowLeft size={16} />
              <span>Back to Faculty Roster</span>
            </button>
            <div className="profile-header-actions">
              <button className="btn-edit-header" onClick={() => handleEditClick(selectedTeacher)}>
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
              <button className="btn-delete-header" onClick={() => handleDeleteClick(selectedTeacher.id)}>
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Profile overview card */}
          <div className="student-profile-main-card">
            <div className="profile-card-primary-info">
              <div className="student-avatar-large green-theme">
                <span>{selectedTeacher.name.split(" ")[1]?.charAt(0) || selectedTeacher.name.charAt(0)}</span>
              </div>
              <div className="profile-text-ident">
                <h2>{selectedTeacher.name}</h2>
                <div className="profile-subtitle">
                  <span className="font-mono text-primary text-sm font-semibold">{selectedTeacher.id}</span>
                  <span className="bullet-sep">•</span>
                  <span className={`status-badge-pill ${selectedTeacher.status === "Active" ? "active" : "inactive"}`}>
                    {selectedTeacher.status}
                  </span>
                </div>
                <p className="qualification-text">
                  {selectedTeacher.qualification || "Instructor Faculty"}
                  {selectedTeacher.experience ? ` • ${selectedTeacher.experience}` : ""}
                </p>
                <div className="profile-subjects-tags">
                  {selectedTeacher.subjects && selectedTeacher.subjects.map(s => (
                    <span key={s} className="badge-tag subject">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="info-section">
                <h4>Contact Details</h4>
                <div className="info-list">
                  <div className="info-item">
                    <Mail size={16} className="icon-mail" />
                    <span>{selectedTeacher.email || "No Email Registered"}</span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} className="icon-phone" />
                    <span>{selectedTeacher.contact}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Assigned Batches</h4>
                <div className="info-list">
                  {batches.filter(b => selectedTeacher.subjects.includes(b.subject)).length === 0 ? (
                    <div className="info-item text-xs text-muted">No active batches assigned.</div>
                  ) : (
                    batches
                      .filter(b => selectedTeacher.subjects.includes(b.subject))
                      .map(b => (
                        <div className="info-item" key={b.id}>
                          <Layers size={14} className="icon-batches" />
                          <span className="font-semibold">{b.name}</span>
                          <span className="text-xs text-muted font-mono">({b.subject})</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="info-section">
                <h4>Students Roster</h4>
                <div className="info-list">
                  <div className="info-item">
                    <Users size={16} className="icon-users" />
                    <span className="font-semibold">
                      {students.filter(s =>
                        s.subjects && s.subjects.some(sub => selectedTeacher.subjects.includes(sub))
                      ).length} Enrolled Students
                    </span>
                  </div>
                  <div className="students-list-names text-xs text-muted leading-relaxed">
                    {students
                      .filter(s => s.subjects && s.subjects.some(sub => selectedTeacher.subjects.includes(sub)))
                      .map(s => s.name)
                      .join(", ") || "No students under guidance."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic log and history grid */}
          <div className="profile-details-panels">
            {/* 1. Class / Attendance History */}
            <div className="profile-details-card">
              <div className="card-heading">
                <Calendar size={18} />
                <h3>Class Conduct Log</h3>
              </div>
              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Class Date</th>
                      <th>Subject</th>
                      <th>Conducted For</th>
                      <th>Teacher Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.filter(log => log.teacher === selectedTeacher.name).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-table-row">No class conduction logs found.</td>
                      </tr>
                    ) : (
                      attendanceLogs
                        .filter(log => log.teacher === selectedTeacher.name)
                        .slice(0, 5)
                        .map((log, idx) => (
                          <tr key={idx}>
                            <td className="font-mono text-sm">{log.date}</td>
                            <td>{log.subject}</td>
                            <td>{log.student}</td>
                            <td>
                              <span className="status-badge-pill active">Present</span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Assignment Evaluation Activity */}
            <div className="profile-details-card">
              <div className="card-heading">
                <FileText size={18} />
                <h3>Evaluation Activities</h3>
              </div>
              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Assignment Title</th>
                      <th>Subject</th>
                      <th>Student</th>
                      <th>Evaluation Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.filter(a => selectedTeacher.subjects.includes(a.subject)).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-table-row">No evaluation records.</td>
                      </tr>
                    ) : (
                      assignments
                        .filter(a => selectedTeacher.subjects.includes(a.subject))
                        .slice(0, 5)
                        .map((a, idx) => (
                          <tr key={idx}>
                            <td>{a.title}</td>
                            <td><span className="badge-tag subject">{a.subject}</span></td>
                            <td>{a.student}</td>
                            <td>
                              <span className={`status-badge-pill ${a.status.toLowerCase()}`}>
                                {a.status === "Evaluated" ? "Evaluated" : "Evaluation Pending"}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        email={formData.email}
        name={formData.name}
        role="teacher"
        onSend={() => sendPasswordInviteEmail(formData.email, 'teacher', formData.name)}
      />
    </div>
  );
};

export default TeachersTab;
