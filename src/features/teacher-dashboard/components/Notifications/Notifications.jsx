import { useState } from "react";
import { Bell, Check, Trash2, Calendar, ClipboardList, Info, AlertTriangle, Circle } from "lucide-react";
import "./Notifications.css";

const Notifications = ({ notifications, setNotifications }) => {
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
    switch (type) {
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
      default:
        return {
          icon: <Info size={18} />,
          colorClass: "bg-purple text-purple"
        };
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
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
              return (
                <div key={n.id} className={`notif-item ${!n.read ? "notif-unread" : ""}`}>
                  {/* Icon & Message */}
                  <div className="notif-item-left">
                    <div className={`notif-icon-circle ${colorClass}`}>
                      {icon}
                    </div>
                    <div className="notif-message-area">
                      <p className="notif-text">{n.text}</p>
                      <span className="notif-time">{formatTime(n.date)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="notif-item-right">
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
