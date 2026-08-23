import { Bell, ChevronDown, Menu } from "lucide-react";
import "./Header.css";

const Header = ({ activeNav = "dashboard", setActiveNav, unreadCount = 0, profile = {}, onToggleMobile }) => {
  const name = profile.name || "Teacher";
  const avatarUrl = profile.avatar || "";
  const roleText =
    Array.isArray(profile.subjects) && profile.subjects.length > 0
      ? `${profile.subjects.join(", ")} Teacher`
      : profile.role || "Teacher";

  const PAGE_TITLES = {
    dashboard:     "Teacher Dashboard",
    batches:       "My Batches & Students",
    materials:     "Study Materials",
    assignments:   "Assignments",
    tests:         "Weekly Tests",
    classes:       "Online Classes",
    attendance:    "Attendance",
    reports:       "Reports & Analytics",
    notifications: "Notifications",
    profile:       "My Profile",
  };

  const pageTitle = PAGE_TITLES[activeNav] || "Teacher Dashboard";

  return (
    <header className="td-header">
      {/* Left: Page Title */}
      <div className="td-header-left">
        {onToggleMobile && (
          <button className="td-header-menu-btn" onClick={onToggleMobile} aria-label="Toggle Navigation">
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="td-header-greeting">{pageTitle}</h1>
        </div>
      </div>

      {/* Right: Bell + Profile */}
      <div className="td-header-right">
        {/* Notification Bell */}
        <button
          className="td-header-bell"
          aria-label="Notifications"
          onClick={() => setActiveNav && setActiveNav("notifications")}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="td-header-bell-badge">{unreadCount}</span>}
        </button>

        {/* Profile */}
        <div
          className="td-header-profile"
          onClick={() => setActiveNav && setActiveNav("profile")}
        >
          <div className="td-header-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} />
            ) : (
              <div className="td-header-avatar-blank">
                {name ? name.charAt(0).toUpperCase() : "T"}
              </div>
            )}
          </div>
          <div className="td-header-profile-info">
            <span className="td-header-name">{name}</span>
            <span className="td-header-role">{roleText}</span>
          </div>
          <ChevronDown size={16} className="td-header-chevron" />
        </div>
      </div>
    </header>
  );
};

export default Header;
