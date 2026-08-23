import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Video,
  CalendarCheck,
  BarChart3,
  Bell,
  UserCircle,
  LogOut,
} from "lucide-react";
import logo from "../../../../assets/logo.png";
import "./Sidebar.css";

const navItems = [
  { id: "dashboard",     label: "Dashboard",            icon: LayoutDashboard },
  { id: "batches",       label: "My Batches & Students", icon: Users },
  { id: "materials",     label: "Study Materials",       icon: BookOpen },
  { id: "assignments",   label: "Assignments",           icon: ClipboardList },
  { id: "tests",         label: "Weekly Tests",          icon: FileCheck2 },
  { id: "classes",       label: "Online Classes",        icon: Video },
  { id: "attendance",    label: "Attendance",            icon: CalendarCheck },
  { id: "reports",       label: "Reports & Analytics",   icon: BarChart3 },
  { id: "notifications", label: "Notifications",         icon: Bell },
  { id: "profile",       label: "Profile",               icon: UserCircle },
];

const Sidebar = ({
  activeNav,
  setActiveNav,
  hasUnreadNotifications = false,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const handleNavClick = (id) => {
    setActiveNav(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isOpenMobile && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${isOpenMobile ? "sidebar--mobile-open" : ""}`}>
        {/* Logo */}
        <div
          className="sidebar-logo"
          onClick={() => handleNavClick("dashboard")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="GroWise Logo" className="sidebar-logo-img" />
          <div className="sidebar-logo-wordmark">
            <span className="sidebar-logo-gro">Gro</span>
            <span className="sidebar-logo-wise">Wise</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`sidebar-nav-item ${activeNav === id ? "active" : ""}`}
              onClick={() => handleNavClick(id)}
            >
              <span className="sidebar-nav-icon">
                <Icon size={18} />
              </span>
              <span className="sidebar-nav-label">{label}</span>
              {id === "notifications" && hasUnreadNotifications && (
                <span className="sidebar-notification-dot" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="sidebar-logout" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
