import { useState } from "react";
import {
  Search, Filter, Eye, Trash2, GraduationCap, X,
  Mail, Phone, Calendar, Clock, MessageSquare, User
} from "lucide-react";

const STATUS_OPTIONS = ["New", "In Progress", "Resolved"];

const InquiriesTab = ({ inquiries, onUpdateStatus, onDeleteInquiry, onConvertToStudent }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [viewedInquiry, setViewedInquiry] = useState(null);

  const filtered = inquiries.filter((inq) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inq.fullName?.toLowerCase().includes(q) ||
      inq.email?.toLowerCase().includes(q) ||
      inq.phone?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === "All" || inq.status === filterStatus;
    const matchesRole = filterRole === "All" || inq.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusChange = (inq, newStatus) => {
    onUpdateStatus(inq.id, newStatus);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this inquiry? This cannot be undone.")) {
      onDeleteInquiry(id);
      if (viewedInquiry?.id === id) setViewedInquiry(null);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    return (
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " " +
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusClass = (status) => {
    if (status === "New") return "status-badge-pill inactive";
    if (status === "In Progress") return "status-badge-pill pending";
    return "status-badge-pill active";
  };

  return (
    <div className="tab-wrapper">
      <div className="list-view-container animate-fade-in">
        <div className="section-header-bar">
          <h2>Contact Inquiries</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="count-pill">{inquiries.filter((i) => i.status === "New").length} New</span>
            <span className="count-pill">{inquiries.length} Total</span>
          </div>
        </div>

        <div className="filters-panel">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-dropdowns">
            <div className="filter-group">
              <Filter size={14} className="filter-icon" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Parent">Parent</option>
                <option value="Teacher">Teacher</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Name</th>
                <th>Contact Info</th>
                <th>Role</th>
                <th>Message</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table-row">No inquiries found.</td>
                </tr>
              ) : (
                filtered.map((inq) => (
                  <tr key={inq.id} className="hover-row">
                    <td className="font-mono text-xs">{formatDate(inq.createdAt)}</td>
                    <td>
                      <span className="font-semibold">{inq.fullName}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span className="text-xs" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={11} /> {inq.email}
                        </span>
                        <span className="text-xs text-muted" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={11} /> {inq.phone || "—"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge-tag subject">{inq.role}</span>
                    </td>
                    <td>
                      <span
                        className="text-xs text-muted"
                        style={{ maxWidth: 180, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {inq.message || "—"}
                      </span>
                    </td>
                    <td>
                      <select
                        className={getStatusClass(inq.status)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem" }}
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button className="action-btn view" title="View Full Details" onClick={() => setViewedInquiry(inq)}>
                          <Eye size={16} />
                        </button>
                        <button className="action-btn edit" title="Convert to Student" onClick={() => onConvertToStudent(inq)}>
                          <GraduationCap size={16} />
                        </button>
                        <button className="action-btn delete" title="Delete Inquiry" onClick={() => handleDelete(inq.id)}>
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

      {/* Detail Modal */}
      {viewedInquiry && (
        <div
          onClick={() => setViewedInquiry(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 25px 70px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)",
              color: "#1e293b",
              position: "relative",
              animation: "modalPop 0.25s ease-out"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <MessageSquare size={19} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 700, color: "#0f172a" }}>Inquiry Details</h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Received on {formatDate(viewedInquiry.createdAt)}</span>
                </div>
              </div>
              <button
                onClick={() => setViewedInquiry(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#64748b"
                }}
              >
                <X size={17} />
              </button>
            </div>

            {/* User Profile Card */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 16px",
              background: "#f8fafc",
              border: "1.5px solid #e2e8f0",
              borderRadius: "14px",
              marginBottom: "18px"
            }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #10b981)",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                {viewedInquiry.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    {viewedInquiry.fullName}
                  </span>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: viewedInquiry.role === "Teacher" ? "#ecfdf5" : viewedInquiry.role === "Parent" ? "#f5f3ff" : "#eff6ff",
                    color: viewedInquiry.role === "Teacher" ? "#047857" : viewedInquiry.role === "Parent" ? "#6d28d9" : "#1d4ed8",
                    border: `1px solid ${viewedInquiry.role === "Teacher" ? "#a7f3d0" : viewedInquiry.role === "Parent" ? "#ddd6fe" : "#bfdbfe"}`
                  }}>
                    {viewedInquiry.role || "Student"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Status:</span>
                  <select
                    className={getStatusClass(viewedInquiry.status)}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      padding: "2px 6px"
                    }}
                    value={viewedInquiry.status}
                    onChange={(e) => {
                      const updated = e.target.value;
                      handleStatusChange(viewedInquiry, updated);
                      setViewedInquiry(prev => ({ ...prev, status: updated }));
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "18px"
            }}>
              <div style={{
                padding: "12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                  <Mail size={13} color="#3b82f6" /> Email Address
                </div>
                <a href={`mailto:${viewedInquiry.email}`} style={{ color: "#2563eb", fontSize: "13px", fontWeight: 600, textDecoration: "none", wordBreak: "break-all" }}>
                  {viewedInquiry.email || "—"}
                </a>
              </div>

              <div style={{
                padding: "12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                  <Phone size={13} color="#10b981" /> Contact Number
                </div>
                <a href={`tel:${viewedInquiry.phone}`} style={{ color: "#0f172a", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                  {viewedInquiry.phone || "Not provided"}
                </a>
              </div>

              <div style={{
                padding: "12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                  <Calendar size={13} color="#8b5cf6" /> Preferred Date
                </div>
                <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 600 }}>
                  {viewedInquiry.preferredDate || "Flexible / Any"}
                </div>
              </div>

              <div style={{
                padding: "12px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>
                  <Clock size={13} color="#f59e0b" /> Preferred Slot
                </div>
                <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 600 }}>
                  {viewedInquiry.preferredTime || "—"}
                </div>
              </div>
            </div>

            {/* Message / Requirements */}
            {viewedInquiry.message && (
              <div style={{
                padding: "14px 16px",
                background: "#f8fafc",
                border: "1.5px solid #e2e8f0",
                borderRadius: "12px",
                marginBottom: "22px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "12px", fontWeight: 600, marginBottom: "6px" }}>
                  <MessageSquare size={14} color="#6366f1" /> Inquiry Message / Requirements
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {viewedInquiry.message}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => setViewedInquiry(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#64748b",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onConvertToStudent(viewedInquiry);
                  setViewedInquiry(null);
                }}
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #2563eb, #10b981)",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)"
                }}
              >
                <GraduationCap size={16} />
                Convert to Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiriesTab;
