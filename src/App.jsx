import { useState, useEffect } from "react";
import LandingPage from "./features/landing/LandingPage";
import Login from "./features/student/Login";
import StudentDashboard from "./features/student/StudentDashboard";
import TeacherDashboard from "./features/teacher-dashboard/TeacherDashboard";

function App() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing' | 'login' | 'dashboard' | 'teacher-dashboard'
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (route === "#/teacher-dashboard" || currentView === "teacher-dashboard") {
    return <TeacherDashboard onNavigate={navigateTo} />;
  }

  if (currentView === "login") {
    return <Login onNavigate={navigateTo} />;
  }

  if (currentView === "dashboard") {
    return <StudentDashboard onNavigate={navigateTo} />;
  }

  return <LandingPage onNavigate={navigateTo} />;
}

export default App;