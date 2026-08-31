import { useState, useEffect } from "react";
import { Search, Filter, Plus, Eye, Edit2, Trash2, ArrowLeft, Check, X, ShieldAlert, Award, FileText, Calendar, Mail, Phone, MapPin, Send } from "lucide-react";
import { sendPasswordInviteEmail } from "../../../services/adminService";
import InviteModal from "./InviteModal";

const StudentsTab = ({ 
  students, 
  batches, 
  subjects, 
  teachers, 
  attendanceLogs, 
  assignments, 
  weeklyTests, 
  onAddStudent, 
  onUpdateStudent, 
  onDeleteStudent,
  initialView = "list",
  initialEditStudentId = null,
  initialStudentData = null,
  onClearInitialData = null
}) => {
  const [view, setView] = useState(initialView); // 'list' | 'form' | 'profile'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBatch, setFilterBatch] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const generateStudentId = () => {
    const suffix = Date.now().toString().slice(-6);
    return `STU${suffix}`;
  };

  // Calculate student attendance percentage
  const getStudentAttendancePercentage = (studentId) => {
    const studentLogs = attendanceLogs.filter(log => 
      log.student === students.find(s => s.id === studentId)?.name
    );
    
    if (studentLogs.length === 0) return { percentage: 0, present: 0, total: 0 };
    
    const presentCount = studentLogs.filter(log => log.status === "Present").length;
    const percentage = Math.round((presentCount / studentLogs.length) * 100);
    
    return { percentage, present: presentCount, total: studentLogs.length };
  };

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    dob: "",
    contact: "",
    email: "",
    address: "",
    parentName: "",
    parentContact: "",
    subjects: [],
    batchId: "",
    teacherId: "",
    username: "",
    password: "",
    status: "Active"
  });

  // Auto-open Add Student form pre-filled when coming from Convert to Student
  useEffect(() => {
    if (initialStudentData) {
      setFormData({
        id: generateStudentId(),
        name: initialStudentData.name || "",
        dob: "",
        contact: initialStudentData.contact || "",
        email: initialStudentData.email || "",
        address: "",
        parentName: "",
        parentContact: "",
        subjects: [],
        batchId: "",
        teacherId: "",
        username: "",
        password: "Password@123",
        status: "Active"
      });
      setEditMode(false);
      setView("form");
      if (onClearInitialData) onClearInitialData();
    }
  }, [initialStudentData]);

  const handleEditClick = (student) => {
    const studentBatch = batches.find(b => b.id === student.batchId);
    const matchedTeacher = teachers.find(t => t.name === studentBatch?.teacher);
    const resolvedTeacherId = matchedTeacher ? matchedTeacher.id : "";

    setFormData({
      id: student.id,
      name: student.name,
      dob: student.dob || "",
      contact: student.contact,
      email: student.email || "",
      address: student.address || "",
      parentName: student.parentName || "",
      parentContact: student.parentContact || "",
      subjects: student.subjects || [],
      batchId: student.batchId || "",
      teacherId: resolvedTeacherId,
      username: student.username || student.name.split(" ")[0],
      password: student.password || "Password@123",
      status: student.status || "Active"
    });
    setEditMode(true);
    setView("form");
  };

  const handleAddNewClick = () => {
    setFormData({
      id: generateStudentId(),
      name: "",
      dob: "",
      contact: "",
      email: "",
      address: "",
      parentName: "",
      parentContact: "",
      subjects: [],
      batchId: "",
      teacherId: "",
      username: "",
      password: "Password@123",
      status: "Active"
    });
    setEditMode(false);
    setView("form");
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setView("profile");
  };

  const handleToggleSubjectForm = (subjName) => {
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
    if (!formData.name || !formData.contact || formData.subjects.length === 0) {
      alert("Please enter a Name, Contact, and enroll in at least one Subject.");
      return;
    }

    const saveResult = editMode
      ? await onUpdateStudent(formData)
      : await onAddStudent(formData);

    if (saveResult === false) {
      alert("Failed to save student details. Please check the data and try again.");
      return;
    }

    setView("list");
  };

  const handleDeleteClick = (studentId) => {
    if (confirm("Are you sure you want to delete this student record?")) {
      onDeleteStudent(studentId);
      if (view === "profile") {
        setView("list");
      }
    }
  };

  const getAssignedTeacherName = (student) => {
    if (!student) return "None Assigned";
    if (student.teacherId) {
      const matched = teachers.find(t => t.id === student.teacherId);
      if (matched) return matched.name;
    }
    if (student.batchId) {
      const batch = batches.find(b => b.id === student.batchId);
      if (batch?.teacher) return batch.teacher;
    }
    const subjectTeachers = teachers.filter(t => t.subjects && t.subjects.some(sub => student.subjects?.includes(sub)));
    if (subjectTeachers.length > 0) {
      return subjectTeachers.map(t => t.name).join(", ");
    }
    return "Unassigned";
  };

  // Filter logic
  const filteredStudents = students.filter(student => {
    const teacherName = getAssignedTeacherName(student).toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.batchId && student.batchId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      teacherName.includes(searchQuery.toLowerCase());

    const matchesBatch = filterBatch === "All" || student.batchId === filterBatch;
    const matchesSubject = filterSubject === "All" || (student.subjects && student.subjects.includes(filterSubject));
    const matchesStatus = filterStatus === "All" || student.status === filterStatus;

    return matchesSearch && matchesBatch && matchesSubject && matchesStatus;
  });

  return (
    <div className="tab-wrapper">
      {view === "list" && (
        <div className="list-view-container animate-fade-in">
          <div className="section-header-bar">
            <h2>Student Roster</h2>
            <button className="add-primary-btn" onClick={handleAddNewClick}>
              <Plus size={16} />
              <span>Add New Student</span>
            </button>
          </div>

          {/* Search and Filters panel */}
          <div className="filters-panel">
            <div className="search-bar-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search by Name, ID, Batch..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-dropdowns">
              <div className="filter-group">
                <Filter size={14} className="filter-icon" />
                <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}>
                  <option value="All">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
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

          {/* Student Grid Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Enrolled Subjects</th>
                  <th>Batch ID</th>
                  <th>Assigned Teacher</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-table-row">No students found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredStudents.map(stu => (
                    <tr key={stu.id} className="hover-row">
                      <td className="font-mono font-bold text-primary">{stu.id}</td>
                      <td>
                        <div className="profile-cell-info">
                          <span className="font-semibold block">{stu.name}</span>
                          <span className="text-xs text-muted font-mono">{stu.email || "No email"}</span>
                        </div>
                      </td>
                      <td>{stu.contact}</td>
                      <td>
                        <div className="tag-badges-container">
                          {stu.subjects && stu.subjects.map(s => (
                            <span className="badge-tag subject" key={s}>{s}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="badge-tag batch">{stu.batchId || "Unassigned"}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-sm" style={{ color: "#334155" }}>
                          {getAssignedTeacherName(stu)}
                        </span>
                      </td>
                      <td>
                        {(() => {
                          const attendance = getStudentAttendancePercentage(stu.id);
                          const color = attendance.percentage >= 75 ? "#16a34a" : 
                                       attendance.percentage >= 60 ? "#ea580c" : "#dc2626";
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ 
                                flex: 1, 
                                height: '6px', 
                                background: '#f1f5f9', 
                                borderRadius: '3px',
                                overflow: 'hidden'
                              }}>
                                <div style={{ 
                                  width: `${attendance.percentage}%`, 
                                  height: '100%', 
                                  background: color,
                                  transition: 'width 0.3s ease'
                                }}></div>
                              </div>
                              <span style={{ 
                                fontSize: '13px', 
                                fontWeight: 700, 
                                color,
                                minWidth: '40px'
                              }}>
                                {attendance.percentage}%
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <span className={`status-badge-pill ${stu.status === "Active" ? "active" : "inactive"}`}>
                          {stu.status || "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button className="action-btn view" title="View Profile" onClick={() => handleViewProfile(stu)}>
                            <Eye size={16} />
                          </button>
                          <button className="action-btn edit" title="Edit Student" onClick={() => handleEditClick(stu)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="action-btn delete" title="Delete Student" onClick={() => handleDeleteClick(stu.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
            <h2>{editMode ? `Edit Student Profile (${formData.id})` : "Add New Student"}</h2>
          </div>

          <form className="admin-form" onSubmit={handleSaveForm}>
            <div className="form-grid">
              {/* Personal details column */}
              <div className="form-card-column">
                <h3>Personal Information</h3>
                
                <div className="form-control">
                  <label htmlFor="stu-name">Full Name *</label>
                  <input 
                    id="stu-name" 
                    type="text" 
                    required 
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="form-control-row">
                  <div className="form-control">
                    <label htmlFor="stu-dob">Date of Birth</label>
                    <input 
                      id="stu-dob" 
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                  <div className="form-control">
                    <label htmlFor="stu-status">Status</label>
                    <select 
                      id="stu-status" 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-control-row">
                  <div className="form-control">
                    <label htmlFor="stu-contact">Contact Number *</label>
                    <input 
                      id="stu-contact" 
                      type="text" 
                      required 
                      placeholder="e.g. +91 9876543210"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    />
                  </div>
                  <div className="form-control">
                    <label htmlFor="stu-email">Email Address</label>
                    <input 
                      id="stu-email" 
                      type="email" 
                      placeholder="e.g. name@growise.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label htmlFor="stu-address">Home Address</label>
                  <textarea 
                    id="stu-address" 
                    placeholder="Enter permanent address details"
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              {/* Parents & Enrollment details column */}
              <div className="form-card-column">
                <h3>Parent Details & Enrollments</h3>
                
                <div className="form-control">
                  <label htmlFor="stu-parent">Parent/Guardian Name</label>
                  <input 
                    id="stu-parent" 
                    type="text" 
                    placeholder="Enter parent or guardian name"
                    value={formData.parentName}
                    onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="stu-parent-contact">Parent Contact Number</label>
                  <input 
                    id="stu-parent-contact" 
                    type="text" 
                    placeholder="Parent's mobile number"
                    value={formData.parentContact}
                    onChange={(e) => setFormData({...formData, parentContact: e.target.value})}
                  />
                </div>

                {/* Batch select */}
                <div className="form-control">
                  <label htmlFor="stu-batch">Batch Assignment *</label>
                  <select 
                    id="stu-batch" 
                    required 
                    value={formData.batchId}
                    onChange={(e) => setFormData({...formData, batchId: e.target.value})}
                  >
                    <option value="">-- Choose Batch --</option>
                    {batches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.subject})</option>
                    ))}
                  </select>
                </div>

                {/* Teacher select */}
                <div className="form-control">
                  <label htmlFor="stu-teacher">Assigned Teacher</label>
                  <select 
                    id="stu-teacher" 
                    value={formData.teacherId}
                    onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  >
                    <option value="">-- Choose Teacher --</option>
                    {(teachers || []).map(t => (
                      <option key={t.id} value={t.id}>{t.name} {t.subjects ? `(${Array.isArray(t.subjects) ? t.subjects.join(", ") : t.subjects})` : ""}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Enrollment Checkboxes */}
                <div className="form-control">
                  <label>Subject Enrollment (Multi-select) *</label>
                  <div className="checkboxes-grid">
                    {subjects.map(s => {
                      const isSelected = formData.subjects.includes(s.name);
                      return (
                        <div 
                          key={s.id} 
                          className={`checkbox-item ${isSelected ? "checked" : ""}`}
                          onClick={() => handleToggleSubjectForm(s.name)}
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
              <button type="submit" className="btn-primary">Save Student Details</button>
            </div>
          </form>
        </div>
      )}

      {view === "profile" && selectedStudent && (
        <div className="profile-view-container animate-fade-in">
          {/* Header */}
          <div className="profile-header-strip">
            <button className="back-link-btn" onClick={() => setView("list")}>
              <ArrowLeft size={16} />
              <span>Back to Roster</span>
            </button>
            <div className="profile-header-actions">
              <button className="btn-edit-header" onClick={() => handleEditClick(selectedStudent)}>
                <Edit2 size={14} />
                <span>Edit Profile</span>
              </button>
              <button className="btn-delete-header" onClick={() => handleDeleteClick(selectedStudent.id)}>
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Profile Overview Card */}
          <div className="student-profile-main-card">
            <div className="profile-card-primary-info">
              <div className="student-avatar-large">
                <span>{selectedStudent.name.charAt(0)}</span>
              </div>
              <div className="profile-text-ident">
                <h2>{selectedStudent.name}</h2>
                <div className="profile-subtitle">
                  <span className="font-mono text-primary text-sm font-semibold">{selectedStudent.id}</span>
                  <span className="bullet-sep">•</span>
                  <span className={`status-badge-pill ${selectedStudent.status === "Active" ? "active" : "inactive"}`}>
                    {selectedStudent.status}
                  </span>
                </div>
                <div className="profile-subjects-tags">
                  {selectedStudent.subjects && selectedStudent.subjects.map(s => (
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
                    <span>{selectedStudent.email || "No Email Registered"}</span>
                  </div>
                  <div className="info-item">
                    <Phone size={16} className="icon-phone" />
                    <span>{selectedStudent.contact}</span>
                  </div>
                  <div className="info-item font-mono text-xs">
                    <MapPin size={16} className="icon-address" />
                    <span>{selectedStudent.address || "No Home Address Provided"}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Parent / Guardian</h4>
                <div className="info-list">
                  <div className="info-item font-semibold">
                    <span>{selectedStudent.parentName || "Not Provided"}</span>
                  </div>
                  <div className="info-item text-sm">
                    <Phone size={14} className="icon-phone" />
                    <span>Contact: {selectedStudent.parentContact || "Not Provided"}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Academic Details</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label text-xs">Assigned Batch:</span>
                    <span className="badge-tag batch">{selectedStudent.batchId || "None"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label text-xs">DOB:</span>
                    <span>{selectedStudent.dob || "Not Provided"}</span>
                  </div>
                  <div className="info-item text-xs">
                    <span className="info-label">Assigned Teacher:</span>
                    <span className="teachers-names">
                      {getAssignedTeacherName(selectedStudent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Records Tables Section */}
          <div className="profile-details-panels">
            {/* 1. Attendance History */}
            <div className="profile-details-card">
              <div className="card-heading">
                <Calendar size={18} />
                <h3>Recent Attendance History</h3>
              </div>
              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Class Date</th>
                      <th>Subject</th>
                      <th>Teacher</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.filter(log => log.studentId === selectedStudent.id || log.student === selectedStudent.name).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="empty-table-row">No attendance records found.</td>
                      </tr>
                    ) : (
                      attendanceLogs
                        .filter(log => log.studentId === selectedStudent.id || log.student === selectedStudent.name)
                        .slice(0, 5)
                        .map((log, idx) => (
                          <tr key={idx}>
                            <td className="font-mono text-sm">{log.date}</td>
                            <td>{log.subject}</td>
                            <td>{log.teacher}</td>
                            <td>
                              <span className={`status-badge-pill ${log.status === "Present" ? "active" : "inactive"}`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Assignment History */}
            <div className="profile-details-card">
              <div className="card-heading">
                <FileText size={18} />
                <h3>Assignment Records</h3>
              </div>
              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Assignment Title</th>
                      <th>Subject</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Marks Given</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.filter(a => a.student === selectedStudent.name || a.studentId === selectedStudent.id).length === 0 ? (
                      // Fallback check against overall assignments by subject
                      assignments.filter(a => selectedStudent.subjects.includes(a.subject)).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="empty-table-row">No assignments associated.</td>
                        </tr>
                      ) : (
                        assignments
                          .filter(a => selectedStudent.subjects.includes(a.subject))
                          .slice(0, 5)
                          .map((a, idx) => (
                            <tr key={idx}>
                              <td>{a.title}</td>
                              <td><span className="badge-tag subject">{a.subject}</span></td>
                              <td className="font-mono text-xs">{a.dueDate}</td>
                              <td>
                                <span className={`status-badge-pill ${a.status.toLowerCase()}`}>
                                  {a.status}
                                </span>
                              </td>
                              <td className="font-mono font-bold">{a.marks !== null ? `${a.marks}/${a.totalMarks || 100}` : "--"}</td>
                            </tr>
                          ))
                      )
                    ) : (
                      assignments
                        .filter(a => a.student === selectedStudent.name || a.studentId === selectedStudent.id)
                        .slice(0, 5)
                        .map((a, idx) => (
                          <tr key={idx}>
                            <td>{a.title}</td>
                            <td><span className="badge-tag subject">{a.subject}</span></td>
                            <td className="font-mono text-xs">{a.dueDate}</td>
                            <td>
                              <span className={`status-badge-pill ${a.status.toLowerCase()}`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="font-mono font-bold">{a.marks !== null ? `${a.marks}/${a.totalMarks || 100}` : "--"}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Weekly Test Scores */}
            <div className="profile-details-card full-width">
              <div className="card-heading">
                <Award size={18} />
                <h3>Weekly Test & Marks History</h3>
              </div>
              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Test Title</th>
                      <th>Subject</th>
                      <th>Test Date</th>
                      <th>Teacher</th>
                      <th>Marks Obtained</th>
                      <th>Percent (%)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyTests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="empty-table-row">No weekly tests recorded.</td>
                      </tr>
                    ) : (
                      weeklyTests.map((t, idx) => {
                        // Enrolled = the test subject matches one of the student's subjects.
                        const subjects = Array.isArray(selectedStudent.subjects)
                          ? selectedStudent.subjects.map((s) => String(s).toLowerCase())
                          : [];
                        const isEnrolled = subjects.some(
                          (s) => s === String(t.subject || "").toLowerCase()
                        );

                        let marks = "--";
                        let percentStr = "--";
                        let statusText = "Not Enrolled";

                        if (isEnrolled) {
                          if (t.status === "Published") {
                            // Show real marks only when the student actually has
                            // recorded marks — never fabricate a score.
                            if (t.marksObtained != null && t.percent != null) {
                              marks = `${t.marksObtained} / ${t.totalMarks}`;
                              percentStr = `${t.percent}%`;
                              statusText = "Evaluated";
                            } else {
                              statusText = "Result Pending";
                            }
                          } else {
                            statusText = "Result Pending";
                          }
                        }

                        if (statusText === "Not Enrolled") return null;

                        return (
                          <tr key={idx}>
                            <td className="font-semibold">{t.title}</td>
                            <td><span className="badge-tag subject">{t.subject}</span></td>
                            <td className="font-mono text-xs">{t.date}</td>
                            <td>{t.teacher}</td>
                            <td className="font-mono font-bold text-primary">{marks}</td>
                            <td className="font-mono font-bold">{percentStr}</td>
                            <td>
                              <span className={`status-badge-pill ${statusText === "Evaluated" ? "active" : "pending"}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        );
                      }).filter(Boolean)
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
        role="student"
        onSend={() => sendPasswordInviteEmail(formData.email, 'student', formData.name)}
      />
    </div>
  );
};

export default StudentsTab;
