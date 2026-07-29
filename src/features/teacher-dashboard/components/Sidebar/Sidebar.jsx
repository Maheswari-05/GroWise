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

const Sidebar = ({ activeNav, setActiveNav }) => {
  return (
    <aside className="sidebar">
      {/* Logo — same logo.png used in the landing page Navbar */}
      <div className="sidebar-logo">
        <img src={logo} alt="GroWise Logo" className="sidebar-logo-img" />
        <div className="sidebar-logo-wordmark">
          <span className="sidebar-logo-gro">Gro</span>
          <span className="sidebar-logo-wise">Wise</span>
        </div>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sidebar-nav-item ${activeNav === id ? "active" : ""}`}
            onClick={() => setActiveNav(id)}
          >
            <span className="sidebar-nav-icon">
              <Icon size={18} />
            </span>
            <span className="sidebar-nav-label">{label}</span>
            {activeNav === id && <span className="sidebar-nav-dot" />}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Logout */}
      <button className="sidebar-logout">
        <span className="sidebar-nav-icon">
          <LogOut size={18} />
        </span>
        <span className="sidebar-nav-label">Logout</span>
      </button>

      {/* Bottom gradient accent */}
      <div className="sidebar-bottom-accent" />
    </aside>
  );
};

export default Sidebar;

