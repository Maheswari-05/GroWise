import React, { Component, useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import SummaryCards from "./components/SummaryCards/SummaryCards";
import TodaySchedule from "./components/TodaySchedule/TodaySchedule";
import UpcomingTests from "./components/UpcomingTests/UpcomingTests";
import RecentSubmissions from "./components/RecentSubmissions/RecentSubmissions";
import NotificationsCard from "./components/NotificationsCard/NotificationsCard";
import QuickActions from "./components/QuickActions/QuickActions";
import DashboardFooter from "./components/DashboardFooter/DashboardFooter";

class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Dashboard Error Boundary caught an error:", error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeNav !== this.props.activeNav && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", margin: "20px 0" }}>
          <h2 style={{ fontSize: "20px", color: "#0f172a", marginBottom: "8px", fontWeight: 800 }}>Something went wrong loading this view.</h2>
          <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "14px" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: "10px 20px",
              background: "#2D6BFF",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Refresh View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
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

// Mock Data Fallbacks
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

const loadFromStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
  }
  return fallback;
};

const loadLoggedTeacherProfile = () => {
  try {
    const loggedId = localStorage.getItem("gw_logged_teacher_id");
    const storedTeachersRaw = localStorage.getItem("gw_teachers_v2");
    const storedTeachers = storedTeachersRaw ? JSON.parse(storedTeachersRaw) : [];

    let matched = storedTeachers.find((t) => String(t.id) === String(loggedId));

    if (!matched) {
      const loggedTeacherRaw = localStorage.getItem("gw_logged_teacher");
      if (loggedTeacherRaw) {
        matched = JSON.parse(loggedTeacherRaw);
      }
    }

    if (matched) {
      const name = matched.name || matched.username || "Teacher";
      return {
        id: matched.id || "T1001",
        name: name,
        avatar: matched.avatar || "",
        email: matched.email || `${name.toLowerCase().replace(/\s+/g, ".")}@growise.com`,
        phone: matched.contact || matched.phone || "+91 98765 43210",
        qualification: matched.qualification || "M.Sc. in Education, B.Ed.",
        experience: matched.experience || "6+ Years Teaching Experience",
        subjects: Array.isArray(matched.subjects) ? matched.subjects : matched.subject ? [matched.subject] : ["Mathematics", "Science"],
        batches: matched.batches || ["Batch A (Grade 10)", "Batch C (Grade 9)"],
        joiningDate: matched.joiningDate || "June 12, 2024",
      };
    }
  } catch (err) {
    console.error("Error loading logged-in teacher profile:", err);
  }
  return initialTeacherProfile;
};

const VALID_TABS = ["dashboard", "batches", "materials", "assignments", "tests", "classes", "attendance", "reports", "notifications", "profile"];

const getTabFromHash = () => {
  const hash = window.location.hash || "";
  const parts = hash.split("/");
  if (parts.length >= 3 && parts[1] === "teacher-dashboard") {
    const tab = parts[2];
    if (VALID_TABS.includes(tab)) return tab;
  }
  return "dashboard";
};

const TeacherDashboard = ({ onNavigate }) => {
  const [activeNav, setActiveNavState] = useState(getTabFromHash);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync activeNav with URL hash changes
  useEffect(() => {
    const handleHash = () => {
      const tab = getTabFromHash();
      setActiveNavState(tab);
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSetActiveNav = (tabId) => {
    setActiveNavState(tabId);
    window.scrollTo({ top: 0, behavior: "instant" });
    const targetHash = tabId === "dashboard" ? "/teacher-dashboard" : `/teacher-dashboard/${tabId}`;
    if (window.location.hash !== `#${targetHash}`) {
      window.location.hash = targetHash;
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("gw_logged_teacher_id");
      localStorage.removeItem("gw_logged_teacher");
    } catch {}
    if (onNavigate) {
      onNavigate("teacher-login");
    } else {
      window.location.hash = "/teacher";
    }
  };

  // Shared state initialized from LocalStorage
  const [weeklyTests, setWeeklyTests] = useState(() => loadFromStorage("gw_weeklytests_v3", initialWeeklyTests));
  const [onlineClasses, setOnlineClasses] = useState(() => loadFromStorage("gw_classes_v2", initialOnlineClasses));
  const [attendanceRecords, setAttendanceRecords] = useState(() => loadFromStorage("gw_attendance_v2", initialAttendanceRecords));
  const [notifications, setNotifications] = useState(() => loadFromStorage("gw_notifications_v2", initialNotifications));
  const [teacherProfile, setTeacherProfile] = useState(loadLoggedTeacherProfile);
  const [assignedBatches, setAssignedBatches] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [students, setStudents] = useState(() => loadFromStorage("gw_students_v2", initialStudents));
  const [batches, setBatches] = useState(() => loadFromStorage("gw_batches_v2", initialBatches));
  const [assignments, setAssignments] = useState(() => loadFromStorage("gw_assignments_v2", []));
  const [materials, setMaterials] = useState(() => loadFromStorage("gw_materials_v2", []));

  // One-time migration: wipe old cached weekly tests so stale data doesn't appear
  useEffect(() => {
    try {
      localStorage.removeItem("gw_weeklytests_v1");
      localStorage.removeItem("gw_weeklytests_v2");
    } catch {}
    setWeeklyTests([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch teacher profile and active batches dynamically from Supabase
  useEffect(() => {
    let active = true;

    const fetchProfileAndBatches = async () => {
      try {
        const loggedId = localStorage.getItem("gw_logged_teacher_id");
        if (!loggedId) return;

        // 1. Fetch teacher profile from database
        const { data: teacher, error: teacherError } = await supabase
          .from("teachers")
          .select("*")
          .eq("id", loggedId)
          .maybeSingle();

        if (teacherError || !teacher) {
          console.error("Error fetching teacher profile from Supabase:", teacherError);
          return;
        }

        // 2. Fetch batches taught by this teacher from database
        const { data: batchesData, error: batchesError } = await supabase
          .from("batches")
          .select("*")
          .eq("teacher", teacher.name);

        let activeBatches = [];
        let activeStudents = [];
        if (!batchesError && batchesData) {
          activeBatches = batchesData;

          // 3. Fetch students enrolled in those batches from Supabase
          const { data: studentsData, error: studentsError } = await supabase
            .from("students")
            .select("*");

          if (!studentsError && studentsData) {
            const batchIds = batchesData.map(b => b.id);
            // Map to unified student format matching local storage format
            activeStudents = studentsData
              .filter(s => batchIds.includes(s.batch_id))
              .map(s => ({
                id: s.id,
                name: s.name,
                contact: s.contact,
                email: s.email || "",
                dob: s.dob || "",
                address: s.address || "",
                parentName: s.parent_name || "",
                parentContact: s.parent_contact || "",
                subjects: s.subjects || [],
                batchId: s.batch_id || "",
                status: s.status || "Active"
              }));
          }
        }

        const formatDate = (dateStr) => {
          if (!dateStr) return "—";
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        };

        if (active) {
          const exp = teacher.qualification?.toLowerCase().includes("exp")
            ? teacher.qualification.split(",").find(part => part.toLowerCase().includes("exp"))?.trim() || "Professional Faculty"
            : "Professional Faculty";

          setAssignedBatches(activeBatches);
          setAssignedStudents(activeStudents);

          setTeacherProfile({
            id: teacher.id,
            name: teacher.name,
            avatar: teacher.avatar || "",
            email: teacher.email || "",
            phone: teacher.contact || "",
            qualification: teacher.qualification || "",
            experience: exp,
            subjects: teacher.subjects || [],
            batches: activeBatches.map(b => b.name),
            joiningDate: formatDate(teacher.created_at),
          });
        }
      } catch (err) {
        console.error("Failed to fetch teacher profile/batches:", err);
      }
    };

    fetchProfileAndBatches();

    return () => {
      active = false;
    };
  }, []);


  // Sync state changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("gw_weeklytests_v3", JSON.stringify(weeklyTests));
    } catch {}
  }, [weeklyTests]);

  useEffect(() => {
    try {
      localStorage.setItem("gw_classes_v2", JSON.stringify(onlineClasses));
    } catch {}
  }, [onlineClasses]);

  useEffect(() => {
    try {
      localStorage.setItem("gw_attendance_v2", JSON.stringify(attendanceRecords));
    } catch {}
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem("gw_students_v2", JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem("gw_batches_v2", JSON.stringify(batches));
    } catch {}
  }, [batches]);

  const hasUnreadNotifications = notifications.some((n) => !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderContent = () => {
    switch (activeNav) {
      case "batches":
        return <MyBatches batches={assignedBatches} students={assignedStudents} />;
      case "materials":
        return <StudyMaterials materials={materials} setMaterials={setMaterials} batches={assignedBatches} />;
      case "assignments":
        return (
          <Assignments
            assignments={assignments}
            setAssignments={setAssignments}
            batches={assignedBatches}
            students={assignedStudents}
          />
        );
      case "tests":
        return (
          <WeeklyTests
            weeklyTests={weeklyTests}
            setWeeklyTests={setWeeklyTests}
            students={assignedStudents}
            batches={assignedBatches}
          />
        );
      case "classes":
        return (
          <OnlineClasses
            onlineClasses={onlineClasses}
            setOnlineClasses={setOnlineClasses}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
            students={assignedStudents}
            batches={assignedBatches}
            teacherProfile={teacherProfile}
          />
        );
      case "attendance":
        return (
          <Attendance
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
            students={assignedStudents}
            batches={assignedBatches}
          />
        );
      case "reports":
        return (
          <Performance
            weeklyTests={weeklyTests}
            attendanceRecords={attendanceRecords}
            students={assignedStudents}
            batches={assignedBatches}
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
            <SummaryCards
              batches={assignedBatches}
              students={assignedStudents}
              onlineClasses={onlineClasses}
              assignments={assignments}
              teacherProfile={teacherProfile}
              setActiveNav={handleSetActiveNav}
            />
            <div className="td-row-two">
              <TodaySchedule 
                onlineClasses={onlineClasses} 
                batches={assignedBatches} 
                teacherProfile={teacherProfile}
                setActiveNav={handleSetActiveNav} 
              />
              <UpcomingTests weeklyTests={weeklyTests} batches={assignedBatches} setActiveNav={handleSetActiveNav} />
            </div>
            <div className="td-row-three">
              <RecentSubmissions assignments={assignments} students={assignedStudents} setActiveNav={handleSetActiveNav} />
              <NotificationsCard setActiveNav={handleSetActiveNav} />
            </div>
            <QuickActions setActiveNav={handleSetActiveNav} />
          </>
        );
    }
  };

  return (
    <div className="td-layout">
      <Sidebar
        activeNav={activeNav}
        setActiveNav={handleSetActiveNav}
        hasUnreadNotifications={hasUnreadNotifications}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <div className="td-main">
        <Header
          activeNav={activeNav}
          setActiveNav={handleSetActiveNav}
          unreadCount={unreadCount}
          profile={teacherProfile}
          onToggleMobile={() => setIsMobileMenuOpen((prev) => !prev)}
        />
        <main className={`td-content ${activeNav !== "dashboard" ? "td-content--full" : ""}`}>
          <DashboardErrorBoundary activeNav={activeNav}>
            {renderContent()}
          </DashboardErrorBoundary>
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default TeacherDashboard;

