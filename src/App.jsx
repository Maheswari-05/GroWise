import { useState } from "react";
import LandingPage from "./features/landing/LandingPage";
import Login from "./features/student/Login";
import StudentDashboard from "./features/student/StudentDashboard";

function App() {
  const [currentView, setCurrentView] = useState("landing"); // 'landing' | 'login' | 'dashboard'

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (currentView === "login") {
    return <Login onNavigate={navigateTo} />;
  }

  if (currentView === "dashboard") {
    return <StudentDashboard onNavigate={navigateTo} />;
  }

  return <LandingPage onNavigate={navigateTo} />;
}

export default App;