import { useState } from "react";
import { Bell, Check, Trash2, Calendar, ClipboardList, Info, AlertTriangle, Circle, Eye } from "lucide-react";
import "./Notifications.css";

const Notifications = ({ notifications, setNotifications, assignments, setAssignments, students, setActiveNav, setViewAsgn, weeklyTests, setWeeklyTests, setViewTestId }) => {
  const [filter, setFilter] = useState("all"); // "all" | "unread" | "read"

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const handleMarkAsRead = (id) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const handleDelete = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      setNotifications([]);
    }
  };

  // Get icon based on type
  const getNotificationIcon = (type) => {
    const mainType = type?.includes(":") ? type.split(":")[0] : type;
    switch (mainType) {
      case "assignment":
        return {
          icon: <ClipboardList size={18} />,
          colorClass: "bg-blue text-blue"
        };
      case "test":
        return {
          icon: <AlertTriangle size={18} />,
          colorClass: "bg-red text-red"
        };
      case "class":
        return {
          icon: <Calendar size={18} />,
          colorClass: "bg-green text-green"
        };
      case "submission":
      case "student-submission":
        return {
          icon: <Check size={18} />,
          colorClass: "bg-green text-green"
        };
      default:
        return {
          icon: <Info size={18} />,
          colorClass: "bg-purple text-purple"
        };
    }
  };

  const formatTime = (n) => {
    // DB returns created_at → camelCase → createdAt; fallback to .date for locally-created entries
    const dateStr = n.createdAt || n.date || n.timestamp;
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-page-container">
      {/* Header bar */}
      <div className="notif-action-bar">
        <div className="notif-filters">
          <button 
            className={`notif-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All <span className="notif-count-badge">{notifications.length}</span>
          </button>
          <button 
            className={`notif-filter-btn ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread <span className="notif-count-badge bg-unread">{unreadCount}</span>
          </button>
          <button 
            className={`notif-filter-btn ${filter === "read" ? "active" : ""}`}
            onClick={() => setFilter("read")}
          >
            Read <span className="notif-count-badge">{notifications.length - unreadCount}</span>
          </button>
        </div>

        <div className="notif-global-actions">
          {unreadCount > 0 && (
            <button className="notif-btn-secondary" onClick={handleMarkAllRead}>
              <Check size={14} /> Mark All as Read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="notif-btn-danger" onClick={handleClearAll}>
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="notif-list-card">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty-state">
            <Bell size={48} />
            <p>No notifications to display in this view.</p>
          </div>
        ) : (
          <div className="notif-items-list">
            {filteredNotifications.map((n) => {
              const { icon, colorClass } = getNotificationIcon(n.type);
              
              let asgnObj = null;
              let studentSub = null;
              let testObj = null;
              if (n.type && n.type.startsWith("submission:")) {
                const parts = n.type.split(":");
                const asgnId = parts[2];
                const studentId = parts[3];
                asgnObj = assignments?.find(a => a.id === asgnId);
                if (asgnObj) {
                  studentSub = asgnObj.submissions?.find(s => s.studentId === studentId);
                }
              } else if (n.type && (n.type.startsWith("test-submission:") || n.type.startsWith("weekly-test"))) {
                const parts = n.type.split(":");
                const testId = parts[2];
                const studentId = parts[3];
                testObj =
                  weeklyTests?.find(t => String(t.id) === String(testId)) ||
                  weeklyTests?.find(t => (n.text || n.message || "").toLowerCase().includes((t.title || "").toLowerCase()));
                if (testObj) {
                  const allMarks = testObj.studentMarks || testObj.student_marks || {};
                  studentSub = allMarks[studentId] || Object.values(allMarks).find(m => m?.submissionUrl);
                }
              }

              const handleGradeSubmission = (asgn) => {
                if (setActiveNav && setViewAsgn) {
                  setViewAsgn(asgn);
                  setActiveNav("assignments");
                }
              };

              return (
                <div key={n.id} className={`notif-item ${!n.read ? "notif-unread" : ""}`}>
                  {/* Icon & Message */}
                  <div className="notif-item-left">
                    <div className={`notif-icon-circle ${colorClass}`}>
                      {icon}
                    </div>
                    <div className="notif-message-area">
                      <p className="notif-text">{n.text || n.message || n.title || "Notification"}</p>
                      <span className="notif-time">{formatTime(n)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="notif-item-right" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {asgnObj && (
                      <button
                        className="notif-row-action-btn"
                        title="Grade Assignment"
                        style={{ 
                          background: "#2D6BFF", 
                          color: "#ffffff", 
                          border: "none", 
                          borderRadius: "4px", 
                          padding: "4px 8px", 
                          fontSize: "12px", 
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          height: "28px"
                        }}
                        onClick={() => handleGradeSubmission(asgnObj)}
                      >
                        Grade
                      </button>
                    )}
                    {testObj && (
                      <button
                        className="notif-row-action-btn"
                        title="Grade Test"
                        style={{ 
                          background: "#2D6BFF", 
                          color: "#ffffff", 
                          border: "none", 
                          borderRadius: "4px", 
                          padding: "4px 8px", 
                          fontSize: "12px", 
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          height: "28px"
                        }}
                        onClick={() => {
                          if (setActiveNav && setViewTestId) {
                             setViewTestId(testObj.id);
                             setActiveNav("tests");
                          }
                        }}
                      >
                        Grade
                      </button>
                    )}
                    {(studentSub?.attachmentUrl || studentSub?.submissionUrl) && (
                      <button
                        className="notif-row-action-btn"
                        title="View Answer Sheet"
                        style={{ 
                          background: "#27a55e", 
                          color: "#ffffff", 
                          border: "none", 
                          borderRadius: "4px", 
                          padding: "4px 10px", 
                          fontSize: "12px", 
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          height: "28px"
                        }}
                        onClick={() => {
                          const url = studentSub.attachmentUrl || studentSub.submissionUrl;
                          if (url.startsWith("data:")) {
                            const byteStr = atob(url.split(",")[1]);
                            const mime = url.split(",")[0].split(":")[1].split(";")[0];
                            const arr = new Uint8Array(byteStr.length);
                            for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
                            const blob = new Blob([arr], { type: mime });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, "_blank");
                            setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                          } else {
                            window.open(url, "_blank");
                          }
                        }}
                      >
                        <Eye size={12} /> View PDF
                      </button>
                    )}
                    {!n.read && (
                      <button 
                        className="notif-row-action-btn check-btn" 
                        title="Mark as Read"
                        onClick={() => handleMarkAsRead(n.id)}
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button 
                      className="notif-row-action-btn trash-btn" 
                      title="Delete"
                      onClick={() => handleDelete(n.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                    {!n.read && (
                      <Circle size={8} fill="#2563eb" color="#2563eb" className="notif-unread-dot" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
