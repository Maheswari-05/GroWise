import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Layers, 
  CalendarDays, 
  FileText, 
  Tv, 
  BarChart3, 
  Settings, 
  User,
  LogOut,
  X,
  MessageSquare
} from "lucide-react";
import logo from "../../../assets/logo.png";

const Sidebar = ({ activeTab, selectTab, sidebarOpen, setSidebarOpen, onLogout, onNavigate }) => {
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "Students", label: "Students", icon: Users },
    { id: "Teachers", label: "Teachers", icon: GraduationCap },
    { id: "Subjects", label: "Subjects", icon: BookOpen },
    { id: "Batches", label: "Batches", icon: Layers },
    { id: "Attendance", label: "Attendance", icon: CalendarDays },
    { id: "Materials", label: "Materials Oversight", icon: FileText },
    { id: "Classes", label: "Online Classes", icon: Tv },
    { id: "Reports", label: "Reports Module", icon: BarChart3 },
    { id: "Settings", label: "Settings", icon: Settings },
    { id: "Profile", label: "Profile Settings", icon: User },
  ];

  const handleLogoClick = () => {
    selectTab("Dashboard");
    setSidebarOpen(false);
  };

  const handleNavClick = (itemId) => {
    selectTab(itemId);
    setSidebarOpen(false);
  };

  return (
    <>
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={handleLogoClick}>
            <img src={logo} alt="GroWise Logo" />
            <span className="logo-text">GroWise</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <IconComponent size={20} className="nav-icon" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
