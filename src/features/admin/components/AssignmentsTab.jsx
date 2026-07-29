import { useState } from "react";
import { Search, Filter, ArrowLeft, ClipboardList, User, Calendar, CheckSquare, Award, AlertCircle } from "lucide-react";

const AssignmentsTab = ({ 
  assignments, 
  subjects, 
  batches, 
  teachers 
}) => {
  const [view, setView] = useState("list"); // 'list' | 'detail'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterBatch, setFilterBatch] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const handleViewDetail = (assignment) => {
    setSelectedAssignment(assignment);
    setView("detail");
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = filterSubject === "All" || a.subject === filterSubject;
    const matchesBatch = filterBatch === "All" || a.batchId === filterBatch;
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    return matchesSearch && matchesSubject && matchesBatch && matchesStatus;
  });

  return (
    <div className="tab-wrapper">
      {view === "list" && (
        <div className="list-view-container animate-fade-in">
          <div className="section-header-bar">
            <h2>Assignment Oversight</h2>
          </div>

          {/* Search & Filters */}
          <div className="filters-panel">
            <div className="search-bar-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search assignments by title or description..." 
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
                <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}>
                  <option value="All">All Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="Evaluated">Evaluated</option>
                  <option value="Submitted">Submitted (Pending Eval)</option>
                  <option value="Pending">Pending (Not Submitted)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Assignment Title</th>
                  <th>Subject</th>
                  <th>Batch ID</th>
                  <th>Due Date</th>
                  <th>Submission Status</th>
                  <th>Marks Published</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-table-row">No assignments found matching filters.</td>
                  </tr>
                ) : (
                  filteredAssignments.map(a => (
                    <tr key={a.id} className="hover-row">
                      <td className="font-semibold">{a.title}</td>
                      <td>
                        <span className="badge-tag subject">{a.subject}</span>
                      </td>
                      <td>
                        <span className="badge-tag batch">{a.batchId || "Unassigned"}</span>
                      </td>
                      <td className="font-mono text-sm">{a.dueDate}</td>
                      <td>
                        <span className={`status-badge-pill ${a.status.toLowerCase()}`}>
                          {a.status === "Evaluated" ? "Evaluated" : a.status === "Submitted" ? "Submitted" : "Pending Submission"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-tag ${a.marks !== null ? "count" : "faculty"}`}>
                          {a.marks !== null ? "Yes (Published)" : "No"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell justify-center">
                          <button className="action-btn view" title="View Submission details" onClick={() => handleViewDetail(a)}>
                            <ClipboardList size={16} />
                            <span className="text-xs ml-4">Audit Details</span>
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

      {view === "detail" && selectedAssignment && (
        <div className="profile-view-container animate-fade-in">
          {/* Header */}
          <div className="profile-header-strip">
            <button className="back-link-btn" onClick={() => setView("list")}>
              <ArrowLeft size={16} />
              <span>Back to Assignment List</span>
            </button>
            <span className="text-xs text-muted font-mono">Assignment Ref ID: {selectedAssignment.id}</span>
          </div>

          <div className="student-profile-main-card">
            <div className="profile-text-ident" style={{ marginLeft: 0 }}>
              <div className="flex align-center gap-10">
                <span className="badge-tag subject">{selectedAssignment.subject}</span>
                <span className="badge-tag batch">Batch: {selectedAssignment.batchId}</span>
              </div>
              <h2 className="mt-10">{selectedAssignment.title}</h2>
              <p className="mt-10 text-muted">{selectedAssignment.description || "No description provided."}</p>
              
              <div className="profile-subtitle mt-20 flex gap-20">
                <span className="flex align-center gap-4 text-xs font-semibold text-muted">
                  <Calendar size={14} /> Due Date: {selectedAssignment.dueDate}
                </span>
                <span className="flex align-center gap-4 text-xs font-semibold text-muted">
                  <Award size={14} /> Total Marks: {selectedAssignment.totalMarks || 20}
                </span>
              </div>
            </div>
          </div>

          {/* Submissions Section */}
          <div className="profile-details-panels mt-20">
            <div className="profile-details-card full-width">
              <div className="card-heading">
                <CheckSquare size={18} />
                <h3>Submissions & Evaluation Status</h3>
              </div>

              {/* RLS warning */}
              <div className="alert-message info-alert mb-20">
                <AlertCircle size={16} className="alert-icon" />
                <span className="alert-text text-xs">
                  <strong>Admin Audit View:</strong> Grading and remarks are handled by the assigned course teachers. This table is read-only for system audit logs.
                </span>
              </div>

              <div className="table-responsive-wrapper">
                <table className="profile-subtable">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Submission Date</th>
                      <th>Attachment File</th>
                      <th>Marks Awarded</th>
                      <th>Teacher Remarks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold">{selectedAssignment.student || "Sneha"}</td>
                      <td className="font-mono text-sm">{selectedAssignment.status !== "Pending" ? selectedAssignment.dueDate : "--"}</td>
                      <td>
                        {selectedAssignment.status !== "Pending" ? (
                          <span className="link-text font-mono text-xs cursor-pointer">submission_v1.pdf</span>
                        ) : (
                          <span className="text-muted text-xs">No attachment</span>
                        )}
                      </td>
                      <td className="font-mono font-bold text-primary">
                        {selectedAssignment.marks !== null ? `${selectedAssignment.marks} / ${selectedAssignment.totalMarks || 20}` : "--"}
                      </td>
                      <td className="text-muted text-xs italic max-w-xs truncate" title={selectedAssignment.remarks}>
                        {selectedAssignment.remarks || "No teacher remarks entered."}
                      </td>
                      <td>
                        <span className={`status-badge-pill ${selectedAssignment.status.toLowerCase()}`}>
                          {selectedAssignment.status}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;
