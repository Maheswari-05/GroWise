import { useState } from "react";
import { Shield, Eye, ToggleLeft, ToggleRight, Check, X, ShieldAlert, FileText, Calendar, ShieldCheck, AlertOctagon } from "lucide-react";

const SettingsTab = ({ 
  students, 
  teachers, 
  auditLogs, 
  onToggleUserStatus, 
  settings, 
  onToggleRLS 
}) => {
  const [activeSubTab, setActiveSubTab] = useState("permissions"); // 'permissions' | 'activation' | 'audit'

  return (
    <div className="tab-wrapper animate-fade-in">
      <div className="section-header-bar">
        <h2>Administrative Settings</h2>

        <div className="toggle-tabs-group">
          <button 
            className={`toggle-tab-btn ${activeSubTab === "permissions" ? "active" : ""}`}
            onClick={() => setActiveSubTab("permissions")}
          >
            Role RLS Permissions
          </button>
          <button 
            className={`toggle-tab-btn ${activeSubTab === "activation" ? "active" : ""}`}
            onClick={() => setActiveSubTab("activation")}
          >
            User Accounts
          </button>
          <button 
            className={`toggle-tab-btn ${activeSubTab === "audit" ? "active" : ""}`}
            onClick={() => setActiveSubTab("audit")}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* ==================== 1. ROLE RLS PERMISSIONS ==================== */}
      {activeSubTab === "permissions" && (
        <div className="report-content-body mt-20 animate-fade-in">
          <div className="profile-details-card full-width">
            <div className="card-heading">
              <ShieldCheck size={18} className="text-primary" />
              <h3>Row-Level Security (RLS) Settings</h3>
            </div>
            
            <div className="rls-policy-list mt-20">
              {/* Policy 1 */}
              <div className="rls-policy-item">
                <div className="policy-info">
                  <h4>Restrict Students to Enrolled Courses</h4>
                  <p>Enforces students to view only materials, tests, and classes assigned to subjects they are explicitly enrolled in.</p>
                </div>
                <div className="policy-toggle">
                  <button 
                    className="toggle-sw-btn" 
                    onClick={() => onToggleRLS("studentRestricted")}
                  >
                    {settings.studentRestricted ? (
                      <ToggleRight size={38} className="text-primary" />
                    ) : (
                      <ToggleLeft size={38} className="text-muted" />
                    )}
                  </button>
                </div>
              </div>

              {/* Policy 2 */}
              <div className="rls-policy-item mt-20">
                <div className="policy-info">
                  <h4>Restrict Faculty to Assigned Batches</h4>
                  <p>Limits teachers to accessing rosters, grades, and scheduling sheets of batches they are explicitly designated as instructors for.</p>
                </div>
                <div className="policy-toggle">
                  <button 
                    className="toggle-sw-btn" 
                    onClick={() => onToggleRLS("teacherRestricted")}
                  >
                    {settings.teacherRestricted ? (
                      <ToggleRight size={38} className="text-primary" />
                    ) : (
                      <ToggleLeft size={38} className="text-muted" />
                    )}
                  </button>
                </div>
              </div>

              {/* Policy 3 */}
              <div className="rls-policy-item mt-20">
                <div className="policy-info">
                  <h4>Strict Validation Checks</h4>
                  <p>Generates warning audit logs and prevents saving details when form structures contain invalid phone contacts or email formats.</p>
                </div>
                <div className="policy-toggle">
                  <button 
                    className="toggle-sw-btn" 
                    onClick={() => onToggleRLS("strictValidation")}
                  >
                    {settings.strictValidation ? (
                      <ToggleRight size={38} className="text-primary" />
                    ) : (
                      <ToggleLeft size={38} className="text-muted" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. USER ACCOUNT ACTIVATION ==================== */}
      {activeSubTab === "activation" && (
        <div className="report-content-body mt-20 animate-fade-in">
          <div className="profile-details-card full-width">
            <div className="card-heading">
              <Shield size={18} />
              <h3>Toggle Account Active Statuses</h3>
            </div>

            <div className="table-responsive-wrapper mt-20">
              <table className="profile-subtable">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>User Role</th>
                    <th>Contact Info</th>
                    <th>System State</th>
                    <th>Toggle Activation</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map Students */}
                  {students.map(s => (
                    <tr key={s.id}>
                      <td className="font-mono text-xs">{s.id}</td>
                      <td className="font-semibold">{s.name}</td>
                      <td><span className="badge-tag batch">Student</span></td>
                      <td className="font-mono text-xs">{s.contact}</td>
                      <td>
                        <span className={`status-badge-pill ${s.status === "Active" ? "active" : "inactive"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`action-btn ${s.status === "Active" ? "delete" : "save"}`}
                          onClick={() => onToggleUserStatus("student", s.id)}
                        >
                          {s.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Map Teachers */}
                  {teachers.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs">{t.id}</td>
                      <td className="font-semibold">{t.name}</td>
                      <td><span className="badge-tag faculty">Teacher</span></td>
                      <td className="font-mono text-xs">{t.contact}</td>
                      <td>
                        <span className={`status-badge-pill ${t.status === "Active" ? "active" : "inactive"}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`action-btn ${t.status === "Active" ? "delete" : "save"}`}
                          onClick={() => onToggleUserStatus("teacher", t.id)}
                        >
                          {t.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. AUDIT & ACTIVITY LOGS ==================== */}
      {activeSubTab === "audit" && (
        <div className="report-content-body mt-20 animate-fade-in">
          <div className="profile-details-card full-width">
            <div className="card-heading">
              <FileText size={18} />
              <h3>System Activity & Audit logs</h3>
            </div>

            <div className="table-responsive-wrapper mt-20">
              <table className="profile-subtable">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Log Level</th>
                    <th>Trigger Area</th>
                    <th>Message Details</th>
                    <th>Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-table-row">No audit logs available.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log, idx) => (
                      <tr key={idx} className={log.level === "WARNING" ? "table-row-flagged" : log.level === "EXCEPTION" ? "bg-red-light" : ""}>
                        <td className="font-mono text-xs text-muted">{log.timestamp}</td>
                        <td>
                          <span className={`status-badge-pill ${log.level === "INFO" ? "active" : log.level === "WARNING" ? "pending" : "inactive"}`}>
                            {log.level}
                          </span>
                        </td>
                        <td className="font-semibold text-xs font-mono">{log.source}</td>
                        <td className="text-xs">{log.message}</td>
                        <td className="font-mono text-xs">{log.operator || "SYSTEM"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
