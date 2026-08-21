import {
  CheckCircle2,
  UserPlus,
  CalendarDays,
} from "lucide-react";
import "./NotificationsCard.css";

const notifications = [
  {
    icon: CheckCircle2,
    message: "Rahul submitted Assignment 3",
    time: "5 min ago",
    color: "green",
    unread: true,
  },
  {
    icon: UserPlus,
    message: "Parent requested a meeting",
    time: "22 min ago",
    color: "blue",
    unread: true,
  },
  {
    icon: CalendarDays,
    message: "Weekly test scheduled for Friday",
    time: "3 hrs ago",
    color: "orange",
    unread: false,
  },
];


const colorMap = {
  green:  { bg: "rgba(55,200,113,0.12)", color: "#27a55e"  },
  blue:   { bg: "rgba(45,107,255,0.10)", color: "#2D6BFF"  },
  purple: { bg: "rgba(139,92,246,0.10)", color: "#7c3aed"  },
  orange: { bg: "rgba(234,88,12,0.10)",  color: "#ea580c"  },
};

const NotificationsCard = ({ setActiveNav }) => {
  return (
    <div className="td-card notifications-card">
      <div className="td-card-header">
        <h2 className="td-card-title">Notifications</h2>
        <span className="notif-unread-count">2 new</span>
      </div>

      <div className="notif-list">
        {notifications.map((notif, idx) => {
          const c = colorMap[notif.color];
          const Icon = notif.icon;
          return (
            <div
              key={idx}
              className={`notif-item ${notif.unread ? "notif-item--unread" : ""}`}
            >
              <div
                className="notif-icon-wrap"
                style={{ background: c.bg, color: c.color }}
              >
                <Icon size={15} />
              </div>
              <div className="notif-body">
                <p className="notif-message">{notif.message}</p>
                <span className="notif-time">{notif.time}</span>
              </div>
              {notif.unread && <div className="notif-dot" />}
            </div>
          );
        })}
      </div>

      <button className="notif-view-all-btn" onClick={() => setActiveNav && setActiveNav("notifications")}>
        View All Notifications
      </button>
    </div>
  );
};

export default NotificationsCard;
