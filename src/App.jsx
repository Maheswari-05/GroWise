import { useState, useEffect } from "react";
import LandingPage from "./features/landing/LandingPage";
import RoleSelector from "./features/auth/RoleSelector";
import Login from "./features/student/Login";
import ResetPassword from "./features/student/ResetPassword";
import TeacherLogin from "./features/teacher/TeacherLogin";
import TeacherResetPassword from "./features/teacher/ResetPassword";
import StudentDashboard from "./features/student/StudentDashboard";
import TeacherDashboard from "./features/teacher-dashboard/TeacherDashboard";
import AdminLogin from "./features/admin/AdminLogin";
import AdminDashboard from "./features/admin/AdminDashboard";

function App() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing' | 'role-selector' | 'login' | 'reset-password' | 'teacher-login' | 'teacher-reset-password' | 'dashboard' | 'teacher-dashboard' | 'admin-login' | 'admin-dashboard'
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      const fullHash = window.location.hash;
      setRoute(fullHash);
      
      // Extract path from hash (before ? if query params exist)
      const hashPath = fullHash.split('?')[0];
      
      console.log("🔍 Route detected:", hashPath);
      console.log("📍 Full hash:", fullHash);
      
      // Check for Supabase error redirects (these come with error parameters)
      if (fullHash.includes("error=")) {
        console.log("⚠️  Error URL detected");
        // Determine which reset page based on route parameter or teacher-reset-password in hash
        if (fullHash.includes("teacher-reset-password") || fullHash.includes("role=teacher")) {
          setCurrentView("teacher-reset-password");
        } else {
          setCurrentView("reset-password");
        }
        return;
      }
      
      // Check for reset password with access token (MUST be before other checks!)
      if (fullHash.includes("access_token")) {
        console.log("🔑 Access token found in URL");
        if (fullHash.includes("teacher-reset-password")) {
          console.log("👨‍🏫 Teacher reset password detected");
          setCurrentView("teacher-reset-password");
        } else {
          console.log("👤 Student reset password detected");
          setCurrentView("reset-password");
        }
        return;
      }
      
      // Synchronize currentView if hash changes
      if (hashPath === "#/role-selector") {
        setCurrentView("role-selector");
      } else if (hashPath === "#/admin") {
        setCurrentView("admin-login");
      } else if (hashPath === "#/admin-dashboard") {
        setCurrentView("admin-dashboard");
      } else if (hashPath === "#/teacher-dashboard") {
        setCurrentView("teacher-dashboard");
      } else if (hashPath === "#/teacher") {
        setCurrentView("teacher-login");
      } else if (hashPath === "#/teacher-reset-password") {
        setCurrentView("teacher-reset-password");
      } else if (hashPath === "#/login") {
        setCurrentView("login");
      } else if (hashPath === "#/reset-password") {
        setCurrentView("reset-password");
      } else if (hashPath === "#/dashboard") {
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
    } else if (view === "role-selector") {
      window.location.hash = "/role-selector";
    } else if (view === "admin-login") {
      window.location.hash = "/admin";
    } else if (view === "teacher-login") {
      window.location.hash = "/teacher";
    } else if (view === "teacher-reset-password") {
      window.location.hash = "/teacher-reset-password";
    } else if (view === "login") {
      window.location.hash = "/login";
    } else if (view === "reset-password") {
      window.location.hash = "/reset-password";
    } else if (view === "admin-dashboard") {
      window.location.hash = "/admin-dashboard";
    } else if (view === "dashboard") {
      window.location.hash = "/dashboard";
    } else if (view === "teacher-dashboard") {
      window.location.hash = "/teacher-dashboard";
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Extract path from hash (before ? if query params exist)
  const hashPath = route.split('?')[0];
  
  // Check if URL has access token (reset password link)
  const hasAccessToken = route.includes("access_token");

  // Student Reset Password - Check FIRST if token present
  if (hasAccessToken && !route.includes("teacher-reset-password")) {
    return <ResetPassword onNavigate={navigateTo} />;
  }

  // Teacher Reset Password - Check FIRST if token present
  if (hasAccessToken && route.includes("teacher-reset-password")) {
    return <TeacherResetPassword onNavigate={navigateTo} />;
  }

  // Role Selector
  if (hashPath === "#/role-selector" || currentView === "role-selector") {
    return <RoleSelector onNavigate={navigateTo} />;
  }

  // Admin Login
  if (hashPath === "#/admin" || currentView === "admin-login") {
    return <AdminLogin onNavigate={navigateTo} />;
  }

  // Student Login
  if (currentView === "login" || hashPath === "#/login") {
    return <Login onNavigate={navigateTo} />;
  }

  // Student Reset Password (by currentView or path)
  if (currentView === "reset-password" || hashPath === "#/reset-password") {
    return <ResetPassword onNavigate={navigateTo} />;
  }

  // Teacher Login
  if (hashPath === "#/teacher" || currentView === "teacher-login") {
    return <TeacherLogin onNavigate={navigateTo} />;
  }

  // Teacher Reset Password (by currentView or path)
  if (currentView === "teacher-reset-password" || hashPath === "#/teacher-reset-password") {
    return <TeacherResetPassword onNavigate={navigateTo} />;
  }

  // Admin Dashboard
  if (hashPath === "#/admin-dashboard" || currentView === "admin-dashboard") {
    return <AdminDashboard onNavigate={navigateTo} />;
  }

  // Teacher Dashboard
  if (hashPath === "#/teacher-dashboard" || currentView === "teacher-dashboard") {
    return <TeacherDashboard onNavigate={navigateTo} />;
  }

  // Student Dashboard
  if (currentView === "dashboard" || hashPath === "#/dashboard") {
    return <StudentDashboard onNavigate={navigateTo} />;
  }

  return <LandingPage onNavigate={navigateTo} />;
}

export default App;