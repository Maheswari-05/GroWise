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
    dashboard:     { title: `Good Morning, ${name}!`, sub: "Here's what's happening today." },
    batches:       { title: "My Batches & Students",      sub: "View and manage your assigned batches and students." },
    materials:     { title: "Study Materials",            sub: "Upload and manage learning resources." },
    assignments:   { title: "Assignments",               sub: "Create and review student assignments." },
    tests:         { title: "Weekly Tests",              sub: "Schedule and evaluate weekly assessments." },
    classes:       { title: "Online Classes",            sub: "Schedule and join live sessions." },
    attendance:    { title: "Attendance",                sub: "Track and manage student attendance." },
    reports:       { title: "Reports & Analytics",       sub: "Insights on student performance." },
    notifications: { title: "Notifications",            sub: "Stay updated with latest activity." },
    profile:       { title: "My Profile",               sub: "Manage your account information." },
  };

  const page = PAGE_TITLES[activeNav] || PAGE_TITLES.dashboard;

  return (
    <header className="td-header">
      {/* Left: Greeting / Page Title */}
      <div className="td-header-left">
        {onToggleMobile && (
          <button className="td-header-menu-btn" onClick={onToggleMobile} aria-label="Toggle Navigation">
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="td-header-greeting">{page.title}</h1>
          <p className="td-header-subtitle">{page.sub}</p>
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
