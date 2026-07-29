import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import SummaryCards from "./components/SummaryCards/SummaryCards";
import TodaySchedule from "./components/TodaySchedule/TodaySchedule";
import UpcomingTests from "./components/UpcomingTests/UpcomingTests";
import RecentSubmissions from "./components/RecentSubmissions/RecentSubmissions";
import NotificationsCard from "./components/NotificationsCard/NotificationsCard";
import QuickActions from "./components/QuickActions/QuickActions";
import DashboardFooter from "./components/DashboardFooter/DashboardFooter";
import MyBatches from "./components/MyBatches/MyBatches";
import StudyMaterials from "./components/StudyMaterials/StudyMaterials";
import Assignments from "./components/Assignments/Assignments";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const [activeNav, setActiveNav] = useState("dashboard");

  const renderContent = () => {
    switch (activeNav) {
      case "batches":
        return <MyBatches />;
      case "materials":
        return <StudyMaterials />;
      case "assignments":
        return <Assignments />;
      default:
        return (
          <>
            <SummaryCards />
            <div className="td-row-two">
              <TodaySchedule />
              <UpcomingTests />
            </div>
            <div className="td-row-three">
              <RecentSubmissions />
              <NotificationsCard />
            </div>
            <QuickActions />
          </>
        );
    }
  };

  return (
    <div className="td-layout">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <div className="td-main">
        <Header activeNav={activeNav} />
        <main className={`td-content ${activeNav !== "dashboard" ? "td-content--full" : ""}`}>
          {renderContent()}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default TeacherDashboard;

