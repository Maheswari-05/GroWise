import { Bell } from "lucide-react";
import "./NotificationsCard.css";

const NotificationsCard = ({ notifications = [], setActiveNav }) => {
  const displayList = Array.isArray(notifications) && notifications.length > 0
    ? notifications.slice(0, 3)
    : [];

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  return (
    <div className="td-card notifications-card">
      <div className="td-card-header">
        <h2 className="td-card-title">Notifications</h2>
        {unreadCount > 0 && <span className="notif-unread-count">{unreadCount} new</span>}
      </div>

      <div className="notif-list">
        {displayList.length === 0 ? (
          <div className="notif-empty-state" style={{ padding: "28px 16px", textAlign: "center", color: "#64748b", fontSize: "13.5px" }}>
            <Bell size={26} style={{ color: "#94a3b8", marginBottom: "8px" }} />
            <p>No new notifications</p>
          </div>
        ) : (
          displayList.map((notif, idx) => {
            const isUnread = !notif.read;
            const message = notif.text || notif.message || "Notification update";
            const timeStr = notif.time || (notif.date ? new Date(notif.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently");

            return (
              <div
                key={notif.id || idx}
                className={`notif-item ${isUnread ? "notif-item--unread" : ""}`}
              >
                <div className="notif-icon-wrap">
                  <Bell size={15} />
                </div>
                <div className="notif-body">
                  <p className="notif-message">{message}</p>
                  <span className="notif-time">{timeStr}</span>
                </div>
                {isUnread && <div className="notif-dot" />}
              </div>
            );
          })
        )}
      </div>

      <button className="notif-view-all-btn" onClick={() => setActiveNav && setActiveNav("notifications")}>
        View All Notifications
      </button>
    </div>
  );
};

export default NotificationsCard;
