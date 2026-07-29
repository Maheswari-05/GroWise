import { Bell, ChevronDown } from "lucide-react";
import "./Header.css";

const PAGE_TITLES = {
  dashboard:     { title: "Good Morning, Mrs. Sarah! 👋", sub: "Here's what's happening today." },
  batches:       { title: "My Batches & Students",         sub: "View and manage your assigned batches and students." },
  materials:     { title: "Study Materials",               sub: "Upload and manage learning resources." },
  assignments:   { title: "Assignments",                  sub: "Create and review student assignments." },
  tests:         { title: "Weekly Tests",                 sub: "Schedule and evaluate weekly assessments." },
  classes:       { title: "Online Classes",               sub: "Schedule and join live sessions." },
  attendance:    { title: "Attendance",                   sub: "Track and manage student attendance." },
  reports:       { title: "Reports & Analytics",          sub: "Insights on student performance." },
  notifications: { title: "Notifications",               sub: "Stay updated with latest activity." },
  profile:       { title: "My Profile",                  sub: "Manage your account information." },
};

const Header = ({ activeNav = "dashboard", unreadCount = 0, profile = {} }) => {
  const page = PAGE_TITLES[activeNav] || PAGE_TITLES.dashboard;
  const avatarUrl = profile.avatar || "https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4";
  const name = profile.name || "Mrs. Sarah";

  return (
    <header className="td-header">
      {/* Left: Greeting / Page Title */}
      <div className="td-header-left">
        <h1 className="td-header-greeting">{page.title}</h1>
        <p className="td-header-subtitle">{page.sub}</p>
      </div>

      {/* Right: Bell + Profile */}
      <div className="td-header-right">
        {/* Notification Bell */}
        <button className="td-header-bell" aria-label="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && <span className="td-header-bell-badge">{unreadCount}</span>}
        </button>

        {/* Profile */}
        <div className="td-header-profile">
          <div className="td-header-avatar">
            <img
              src={avatarUrl}
              alt={name}
            />
          </div>
          <div className="td-header-profile-info">
            <span className="td-header-name">{name}</span>
            <span className="td-header-role">Mathematics Teacher</span>
          </div>
          <ChevronDown size={16} className="td-header-chevron" />
        </div>
      </div>
    </header>
  );
};

export default Header;
