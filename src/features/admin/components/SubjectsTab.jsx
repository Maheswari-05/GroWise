import { useState } from "react";
import { Search, Plus, Edit2, Trash2, ArrowLeft, Check, BookOpen, Users, GraduationCap } from "lucide-react";

const SubjectsTab = ({ 
  subjects, 
  teachers, 
  students, 
  onAddSubject, 
  onUpdateSubject, 
  onDeleteSubject 
}) => {
  const [view, setView] = useState("list"); // 'list' | 'form'
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    description: "",
    teacherIds: [] // Array of teacher IDs assigned
  });

  const handleAddNewClick = () => {
    // Generate unique subject ID using timestamp to avoid duplicates
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    let nextId = `SUB${timestamp}${randomSuffix}`;
    
    // Ensure uniqueness against existing subjects
    let attempts = 0;
    while (subjects.some(s => s.id === nextId) && attempts < 10) {
      const newTimestamp = Date.now().toString().slice(-6);
      const newSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      nextId = `SUB${newTimestamp}${newSuffix}`;
      attempts++;
    }
    
    setFormData({
      id: nextId,
      name: "",
      code: "",
      description: "",
      teacherIds: []
    });
    setEditMode(false);
    setView("form");
  };

  const handleEditClick = (subject) => {
    // Find teacher IDs based on teacher names assigned, or exact match
    const assignedTeacherIds = teachers
      .filter(t => t.subjects && t.subjects.includes(subject.name))
      .map(t => t.id);

    setFormData({
      id: subject.id,
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      teacherIds: assignedTeacherIds
    });
    setEditMode(true);
    setView("form");
  };

  const handleToggleTeacher = (teacherId) => {
    setFormData(prev => {
      const idx = prev.teacherIds.indexOf(teacherId);
      if (idx > -1) {
        return { ...prev, teacherIds: prev.teacherIds.filter(id => id !== teacherId) };
      } else {
        return { ...prev, teacherIds: [...prev.teacherIds, teacherId] };
      }
    });
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert("Please fill in Subject Name and Code.");
      return;
    }

    if (editMode) {
      await onUpdateSubject(formData);
    } else {
      await onAddSubject(formData);
    }
    setView("list");
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to delete this subject? All batch assignments and enrollments might be affected.")) {
      onDeleteSubject(id);
    }
  };

  // Filter
  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="tab-wrapper">
      {view === "list" && (
        <div className="list-view-container animate-fade-in">
          <div className="section-header-bar">
            <h2>Subject Syllabus</h2>
            <button className="add-primary-btn" onClick={handleAddNewClick}>
              <Plus size={16} />
              <span>Add New Subject</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="filters-panel">
            <div className="search-bar-wrapper full-width">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search subjects by Name or Code..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Description</th>
                  <th>Assigned Teachers</th>
                  <th>Enrolled Students</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table-row">No subjects found.</td>
                  </tr>
                ) : (
                  filteredSubjects.map(s => {
                    // Find teachers assigned to this subject
                    const assignedTchrs = teachers.filter(t => t.subjects && t.subjects.includes(s.name));
                    // Count enrolled students
                    const enrolledCount = students.filter(student => student.subjects && student.subjects.includes(s.name)).length;

                    return (
                      <tr key={s.id} className="hover-row">
                        <td className="font-mono font-bold text-primary">{s.code || `SUB${s.id}`}</td>
                        <td className="font-semibold">{s.name}</td>
                        <td className="text-muted text-sm max-w-xs truncate" title={s.description}>
                          {s.description || "No description provided."}
                        </td>
                        <td>
                          {assignedTchrs.length === 0 ? (
                            <span className="text-xs text-danger font-semibold">No teachers assigned</span>
                          ) : (
                            <div className="tag-badges-container">
                              {assignedTchrs.map(t => (
                                <span className="badge-tag faculty" key={t.id}>{t.name}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge-tag count">{enrolledCount} enrolled</span>
                        </td>
                        <td>
                          <div className="action-buttons-cell">
                            <button className="action-btn edit" title="Edit Subject" onClick={() => handleEditClick(s)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="action-btn delete" title="Delete Subject" onClick={() => handleDeleteClick(s.id)}>
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
              <span>Back to Syllabus</span>
            </button>
            <h2>{editMode ? `Edit Subject details` : "Add New Subject"}</h2>
          </div>

          <form className="admin-form" onSubmit={handleSaveForm}>
            <div className="form-grid">
              {/* Left Form Card */}
              <div className="form-card-column">
                <h3>Subject details</h3>
                
                <div className="form-control">
                  <label htmlFor="sub-name">Subject Name *</label>
                  <input 
                    id="sub-name" 
                    type="text" 
                    required 
                    placeholder="e.g. Mathematics, Biology"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="sub-code">Subject Code *</label>
                  <input 
                    id="sub-code" 
                    type="text" 
                    required 
                    placeholder="e.g. MATH12, PHYS11"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label htmlFor="sub-desc">Description</label>
                  <textarea 
                    id="sub-desc" 
                    placeholder="Provide overview details of course syllabus topics"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Right Teacher Assignment Card */}
              <div className="form-card-column">
                <h3>Assign Instructor Faculty</h3>
                
                <div className="form-control">
                  <label>Select Teachers to assign to this course:</label>
                  {teachers.length === 0 ? (
                    <p className="no-classes-text">No active teachers registered yet. Please create a teacher first.</p>
                  ) : (
                    <div className="checkboxes-grid full-width">
                      {teachers.map(t => {
                        const isSelected = formData.teacherIds.includes(t.id);
                        return (
                          <div 
                            key={t.id} 
                            className={`checkbox-item ${isSelected ? "checked" : ""}`}
                            onClick={() => handleToggleTeacher(t.id)}
                          >
                            <span className="checkbox-indicator">
                              {isSelected && <Check size={12} />}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold">{t.name}</span>
                              <span className="text-xs text-muted font-mono">{t.id}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-actions-bar">
              <button type="button" className="btn-secondary" onClick={() => setView("list")}>Cancel</button>
              <button type="submit" className="btn-primary">Save Course Subject</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubjectsTab;
