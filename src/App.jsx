import { useState, useEffect } from "react";
import LandingPage from "./features/landing/LandingPage";
import Login from "./features/student/Login";
import StudentDashboard from "./features/student/StudentDashboard";
import TeacherDashboard from "./features/teacher-dashboard/TeacherDashboard";
import AdminLogin from "./features/admin/AdminLogin";
import AdminDashboard from "./features/admin/AdminDashboard";

function App() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing' | 'login' | 'dashboard' | 'teacher-dashboard' | 'admin-login' | 'admin-dashboard'
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash);
      // Synchronize currentView if hash changes
      if (window.location.hash === "#/admin") {
        setCurrentView("admin-login");
      } else if (window.location.hash === "#/admin-dashboard") {
        setCurrentView("admin-dashboard");
      } else if (window.location.hash === "#/teacher-dashboard") {
        setCurrentView("teacher-dashboard");
      } else if (window.location.hash === "#/dashboard") {
        setCurrentView("dashboard");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    // Initial run
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === "landing") {
      window.location.hash = "";
    } else if (view === "admin-login") {
      window.location.hash = "/admin";
    } else if (view === "admin-dashboard") {
      window.location.hash = "/admin-dashboard";
    } else if (view === "dashboard") {
      window.location.hash = "/dashboard";
    } else if (view === "teacher-dashboard") {
      window.location.hash = "/teacher-dashboard";
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (route === "#/admin" || currentView === "admin-login") {
    return <AdminLogin onNavigate={navigateTo} />;
  }

  if (route === "#/admin-dashboard" || currentView === "admin-dashboard") {
    return <AdminDashboard onNavigate={navigateTo} />;
  }

  if (route === "#/teacher-dashboard" || currentView === "teacher-dashboard") {
    return <TeacherDashboard onNavigate={navigateTo} />;
  }

  if (currentView === "login" || route === "#/login") {
    return <Login onNavigate={navigateTo} />;
  }

  if (currentView === "dashboard" || route === "#/dashboard") {
    return <StudentDashboard onNavigate={navigateTo} />;
  }

  return <LandingPage onNavigate={navigateTo} />;
}

export default App;