import { useState } from "react";
import { Search, Plus, Edit2, Trash2, ArrowLeft, Layers, Calendar, User, GraduationCap, AlertCircle } from "lucide-react";

const BatchesTab = ({ 
  batches, 
  subjects, 
  teachers, 
  students, 
  onAddBatch, 
  onUpdateBatch, 
  onDeleteBatch 
}) => {
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    subject: "",
    teacher: "",
    student: "",
    schedule: "",
    status: "Active"
  });

  const handleAddNewClick = () => {
    const nextId = "BAT" + String(batches.length + 101);
    setFormData({
      id: nextId,
      name: "",
      subject: "",
      teacher: "",
      student: "",
      schedule: "",
      status: "Active"
    });
    setEditMode(false);
    setView("form");
  };

  const handleEditClick = (batch) => {
    setFormData({
      id: batch.id,
      name: batch.name,
      subject: batch.subject,
      teacher: batch.teacher,
      student: batch.student,
      schedule: batch.schedule,
      status: batch.status || "Active"
    });
    setEditMode(true);
    setView("form");
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.teacher || !formData.student || !formData.schedule) {
      alert("Please fill in all required fields (Batch Name, Subject, Teacher, Student, Schedule).");
      return;
    }

    if (editMode) {
      onUpdateBatch(formData);
    } else {
      onAddBatch(formData);
    }
    setView("list");
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to delete this batch? All scheduled classes might be affected.")) {
      onDeleteBatch(id);
    }
  };

  // Filter teachers who teach the selected subject
  const availableTeachers = teachers.filter(t => t.subjects && t.subjects.includes(formData.subject));

  // Filter students who are enrolled in the selected subject
  const availableStudents = students.filter(s => s.subjects && s.subjects.includes(formData.subject));

  // Search filter
  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.student.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tab-wrapper">
      {view === "list" && (
        <div className="list-view-container animate-fade-in">
          <div className="section-header-bar">
            <h2>Batch Management</h2>
            <button className="add-primary-btn" onClick={handleAddNewClick}>
              <Plus size={16} />
              <span>Add New Batch</span>
            </button>
          </div>



          {/* Search bar */}
          <div className="filters-panel">
            <div className="search-bar-wrapper full-width">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search batches by Name, ID, Subject, Student..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Batches Data Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Batch Name</th>
                  <th>Subject</th>
                  <th>Teacher (1:1)</th>
                  <th>Student (1:1)</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-table-row">No batches registered.</td>
                  </tr>
                ) : (
                  filteredBatches.map(b => (
                    <tr key={b.id} className="hover-row">
                      <td className="font-mono font-bold text-primary">{b.id}</td>
                      <td>
                        <div className="flex align-center gap-10">
                          <Layers size={16} className="text-muted" />
                          <span className="font-semibold">{b.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-tag subject">{b.subject}</span>
                      </td>
                      <td>
                        <div className="flex align-center gap-6">
                          <GraduationCap size={14} className="text-muted" />
                          <span>{b.teacher}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex align-center gap-6">
                          <User size={14} className="text-primary" />
                          <span className="font-semibold">{b.student}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex align-center gap-6 font-mono text-xs">
                          <Calendar size={14} className="text-muted" />
                          <span>{b.schedule}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge-pill ${b.status === "Active" ? "active" : "inactive"}`}>
                          {b.status || "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button className="action-btn edit" title="Edit Batch" onClick={() => handleEditClick(b)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="action-btn delete" title="Delete Batch" onClick={() => handleDeleteClick(b.id)}>
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
              <span>Back to Batches</span>
            </button>
            <h2>{editMode ? `Edit Batch Settings (${formData.id})` : "Create 1:1 Study Batch"}</h2>
          </div>

          <form className="admin-form" onSubmit={handleSaveForm}>
            <div className="form-grid">
              {/* Main settings card */}
              <div className="form-card-column">
                <h3>Batch Identification & Subjects</h3>
                
                <div className="form-control">
                  <label htmlFor="bat-name">Batch Name *</label>
                  <input 
                    id="bat-name" 
                    type="text" 
                    required 
                    placeholder="e.g. Batch 12-A, Sneha Revision Maths"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="bat-subject">Subject *</label>
                  <select 
                    id="bat-subject" 
                    required 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value, teacher: "", student: ""})}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label htmlFor="bat-sched">Class Schedule (Days & Time) *</label>
                  <input 
                    id="bat-sched" 
                    type="text" 
                    required 
                    placeholder="e.g. Mon, Wed, Fri - 5:00 PM"
                    value={formData.schedule}
                    onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="bat-status">Batch Status</label>
                  <select 
                    id="bat-status" 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* 1:1 Assignments card */}
              <div className="form-card-column">
                <h3>1-on-1 Assignments (1 Teacher : 1 Student)</h3>

                <div className="form-control">
                  <label htmlFor="bat-teacher">Assign Instructor Faculty *</label>
                  <select 
                    id="bat-teacher" 
                    required 
                    disabled={!formData.subject}
                    value={formData.teacher}
                    onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                  >
                    <option value="">-- {formData.subject ? "Select Faculty" : "Select Subject First"} --</option>
                    {availableTeachers.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                  {formData.subject && availableTeachers.length === 0 && (
                    <span className="text-xs text-danger block mt-4">
                      Warning: No teachers are assigned to {formData.subject}. Edit a teacher to assign this subject.
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label htmlFor="bat-student">Assign Student *</label>
                  <select 
                    id="bat-student" 
                    required 
                    disabled={!formData.subject}
                    value={formData.student}
                    onChange={(e) => setFormData({...formData, student: e.target.value})}
                  >
                    <option value="">-- {formData.subject ? "Select Student" : "Select Subject First"} --</option>
                    {availableStudents.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  {formData.subject && availableStudents.length === 0 && (
                    <span className="text-xs text-danger block mt-4">
                      Warning: No students are currently enrolled in {formData.subject}.
                    </span>
                  )}
                </div>

                {formData.subject && (
                  <div className="info-helper-box text-xs mt-10">
                    Showing only teachers and students associated with course <strong>{formData.subject}</strong>. 
                    This guarantees structural integrity in lesson planning and calendar scheduling.
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions-bar">
              <button type="button" className="btn-secondary" onClick={() => setView("list")}>Cancel</button>
              <button type="submit" className="btn-primary">Save Batch Settings</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BatchesTab;
