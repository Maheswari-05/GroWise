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

// New Modules
import WeeklyTests from "./components/WeeklyTests/WeeklyTests";
import OnlineClasses from "./components/OnlineClasses/OnlineClasses";
import Attendance from "./components/Attendance/Attendance";
import Performance from "./components/Performance/Performance";
import Notifications from "./components/Notifications/Notifications";
import Profile from "./components/Profile/Profile";

// Mock Data
import {
  initialWeeklyTests,
  initialOnlineClasses,
  initialAttendanceRecords,
  initialNotifications,
  initialTeacherProfile,
  initialStudents,
  initialBatches
} from "./mockData";

import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const [activeNav, setActiveNav] = useState("dashboard");

  // Shared state
  const [weeklyTests, setWeeklyTests] = useState(initialWeeklyTests);
  const [onlineClasses, setOnlineClasses] = useState(initialOnlineClasses);
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [teacherProfile, setTeacherProfile] = useState(initialTeacherProfile);
  const [students, setStudents] = useState(initialStudents);
  const [batches, setBatches] = useState(initialBatches);

  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderContent = () => {
    switch (activeNav) {
      case "batches":
        return <MyBatches />;
      case "materials":
        return <StudyMaterials />;
      case "assignments":
        return <Assignments />;
      case "tests":
        return (
          <WeeklyTests
            weeklyTests={weeklyTests}
            setWeeklyTests={setWeeklyTests}
            students={students}
            batches={batches}
          />
        );
      case "classes":
        return (
          <OnlineClasses
            onlineClasses={onlineClasses}
            setOnlineClasses={setOnlineClasses}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
            students={students}
            batches={batches}
          />
        );
      case "attendance":
        return (
          <Attendance
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
            students={students}
            batches={batches}
          />
        );
      case "reports":
        return (
          <Performance
            weeklyTests={weeklyTests}
            attendanceRecords={attendanceRecords}
            students={students}
            batches={batches}
          />
        );
      case "notifications":
        return (
          <Notifications
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      case "profile":
        return (
          <Profile
            teacherProfile={teacherProfile}
            setTeacherProfile={setTeacherProfile}
          />
        );
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
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        hasUnreadNotifications={hasUnreadNotifications}
      />
      <div className="td-main">
        <Header activeNav={activeNav} unreadCount={unreadCount} profile={teacherProfile} />
        <main className={`td-content ${activeNav !== "dashboard" ? "td-content--full" : ""}`}>
          {renderContent()}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default TeacherDashboard;

