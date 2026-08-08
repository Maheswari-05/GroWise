import { useState, useEffect } from "react";
import { Menu, Bell, Search, Shield, ShieldAlert, LogOut } from "lucide-react";
import supabase from "../../lib/supabase";
import * as adminService from "../../services/adminService";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import StudentsTab from "./components/StudentsTab";
import TeachersTab from "./components/TeachersTab";
import SubjectsTab from "./components/SubjectsTab";
import BatchesTab from "./components/BatchesTab";
import AttendanceTab from "./components/AttendanceTab";
import MaterialsTab from "./components/MaterialsTab";
import AssignmentsTab from "./components/AssignmentsTab";
import ClassesTab from "./components/ClassesTab";
import ReportsTab from "./components/ReportsTab";
import SettingsTab from "./components/SettingsTab";
import ProfileTab from "./components/ProfileTab";

import avatarImg from "../../assets/courses/human2.jpg";
import logo from "../../assets/logo.png";
import "./AdminDashboard.css";

const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);

  // Auth & loading
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- DATA STATE (populated from Supabase) ---
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [weeklyTests, setWeeklyTests] = useState([]);
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState({
    studentRestricted: true,
    teacherRestricted: true,
    strictValidation: false,
  });
  const [adminProfile, setAdminProfile] = useState({ name: "", email: "" });

  const loadAllData = async () => {
    try {
      const [stu, tch, sub, bat, mat, att, asgn, wt, oc, notif, alog, sett] =
        await Promise.all([
          adminService.fetchStudents(),
          adminService.fetchTeachers(),
          adminService.fetchSubjects(),
          adminService.fetchBatches(),
          adminService.fetchMaterials(),
          adminService.fetchAttendanceLogs(),
          adminService.fetchAssignments(),
          adminService.fetchWeeklyTests(),
          adminService.fetchOnlineClasses(),
          adminService.fetchNotifications(),
          adminService.fetchAuditLogs(),
          adminService.fetchSettings(),
        ]);

      setStudents(stu);
      setTeachers(tch);
      setSubjects(sub);
      setBatches(bat);
      setMaterials(mat);
      setAttendanceLogs(att);
      setAssignments(asgn);
      setWeeklyTests(wt);
      setOnlineClasses(oc);
      setNotifications(notif);
      setAuditLogs(alog);
      if (sett) setSettings(sett);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  // --- 1. AUTH CHECK & INITIAL DATA FETCH ---
  useEffect(() => {
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        onNavigate("admin-login");
        return;
      }
      setUser(authUser);
      await loadAllData();
      const profile = await adminService.fetchAdminProfile(authUser.id);
      if (profile) setAdminProfile(profile);
      setLoading(false);
    };
    init();
  }, []);

  // --- RE-FETCH DATA ON TAB CHANGE ---
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [activeTab]);

  // --- 2. SUPABASE REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" },
        async () => { try { setStudents(await adminService.fetchStudents()); } catch (e) { /* silent */ } })
      .on("postgres_changes", { event: "*", schema: "public", table: "teachers" },
        async () => { try { setTeachers(await adminService.fetchTeachers()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "subjects" },
        async () => { try { setSubjects(await adminService.fetchSubjects()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "batches" },
        async () => { try { setBatches(await adminService.fetchBatches()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "materials" },
        async () => { try { setMaterials(await adminService.fetchMaterials()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_logs" },
        async () => { try { setAttendanceLogs(await adminService.fetchAttendanceLogs()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" },
        async () => { try { setAssignments(await adminService.fetchAssignments()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_tests" },
        async () => { try { setWeeklyTests(await adminService.fetchWeeklyTests()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "online_classes" },
        async () => { try { setOnlineClasses(await adminService.fetchOnlineClasses()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
        async () => { try { setNotifications(await adminService.fetchNotifications()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" },
        async () => { try { setAuditLogs(await adminService.fetchAuditLogs()); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" },
        async () => { try { const s = await adminService.fetchSettings(); if (s) setSettings(s); } catch (e) {} })
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_profiles" },
        async () => { try { const p = await adminService.fetchAdminProfile(user.id); if (p) setAdminProfile(p); } catch (e) {} })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // --- 3. CRUD HANDLERS (all async → Supabase) ---

  // Students
  const handleAddStudent = async (newStu) => {
    try {
      await adminService.addStudent(newStu);
      setStudents(await adminService.fetchStudents());
      await adminService.addNotification({
        type: "batch",
        message: `New Student ${newStu.name} added to system database.`,
        time: "Just now",
      });
      setNotifications(await adminService.fetchNotifications());
    } catch (err) {
      console.error("Failed to add student:", err);
    }
  };

  const handleUpdateStudent = async (updatedStu) => {
    try {
      await adminService.updateStudent(updatedStu);
      setStudents(await adminService.fetchStudents());
    } catch (err) {
      console.error("Failed to update student:", err);
    }
  };

  const handleDeleteStudent = async (stuId) => {
    try {
      await adminService.deleteStudent(stuId);
      setStudents(await adminService.fetchStudents());
    } catch (err) {
      console.error("Failed to delete student:", err);
    }
  };

  // Teachers
  const handleAddTeacher = async (newTch) => {
    try {
      await adminService.addTeacher(newTch);
      setTeachers(await adminService.fetchTeachers());
    } catch (err) {
      console.error("Failed to add teacher:", err);
    }
  };

  const handleUpdateTeacher = async (updatedTch) => {
    try {
      await adminService.updateTeacher(updatedTch);
      setTeachers(await adminService.fetchTeachers());
    } catch (err) {
      console.error("Failed to update teacher:", err);
    }
  };

  const handleDeleteTeacher = async (tchId) => {
    try {
      await adminService.deleteTeacher(tchId);
      setTeachers(await adminService.fetchTeachers());
    } catch (err) {
      console.error("Failed to delete teacher:", err);
    }
  };

  // Subjects
  const handleAddSubject = async (newSub) => {
    try {
      await adminService.addSubject(newSub);
      setSubjects(await adminService.fetchSubjects());
    } catch (err) {
      console.error("Failed to add subject:", err);
    }
  };

  const handleUpdateSubject = async (updatedSub) => {
    try {
      await adminService.updateSubject(updatedSub);
      setSubjects(await adminService.fetchSubjects());
    } catch (err) {
      console.error("Failed to update subject:", err);
    }
  };

  const handleDeleteSubject = async (subId) => {
    try {
      await adminService.deleteSubject(subId);
      setSubjects(await adminService.fetchSubjects());
    } catch (err) {
      console.error("Failed to delete subject:", err);
    }
  };

  // Batches
  const handleAddBatch = async (newBat) => {
    try {
      await adminService.addBatch(newBat);
      setBatches(await adminService.fetchBatches());
      await adminService.addNotification({
        type: "batch",
        message: `New batch ${newBat.name} scheduled for ${newBat.student} with ${newBat.teacher}.`,
        time: "Just now",
      });
      setNotifications(await adminService.fetchNotifications());
    } catch (err) {
      console.error("Failed to add batch:", err);
    }
  };

  const handleUpdateBatch = async (updatedBat) => {
    try {
      await adminService.updateBatch(updatedBat);
      setBatches(await adminService.fetchBatches());
    } catch (err) {
      console.error("Failed to update batch:", err);
    }
  };

  const handleDeleteBatch = async (batId) => {
    try {
      await adminService.deleteBatch(batId);
      setBatches(await adminService.fetchBatches());
    } catch (err) {
      console.error("Failed to delete batch:", err);
    }
  };

  // Materials Oversight
  const handleFlagMaterial = async (id) => {
    try {
      const material = materials.find((m) => m.id === id);
      if (material) {
        await adminService.flagMaterial(id, !material.flagged);
        setMaterials(await adminService.fetchMaterials());
      }
    } catch (err) {
      console.error("Failed to flag material:", err);
    }
  };

  const handleDeleteMaterial = async (id) => {
    try {
      await adminService.deleteMaterial(id);
      setMaterials(await adminService.fetchMaterials());
    } catch (err) {
      console.error("Failed to delete material:", err);
    }
  };

  // Attendance
  const handleUpdateAttendanceLog = async (updatedLog) => {
    try {
      await adminService.updateAttendanceLog(updatedLog);
      setAttendanceLogs(await adminService.fetchAttendanceLogs());
      await adminService.addAuditLog({
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        level: "INFO",
        source: "AttendanceRegistry",
        message: `Corrected attendance record for ${updatedLog.student} on ${updatedLog.date} -> ${updatedLog.status}`,
        operator: "Admin",
      });
      setAuditLogs(await adminService.fetchAuditLogs());
    } catch (err) {
      console.error("Failed to update attendance:", err);
    }
  };

  // Settings
  const handleToggleRLS = async (policyName) => {
    try {
      const newSettings = { ...settings, [policyName]: !settings[policyName] };
      await adminService.updateSettings(newSettings);
      setSettings(newSettings);
      await adminService.addAuditLog({
        timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
        level: "INFO",
        source: "AccessControlSettings",
        message: `RLS policy '${policyName}' toggled to: ${newSettings[policyName] ? "ON" : "OFF"}`,
        operator: "Admin",
      });
      setAuditLogs(await adminService.fetchAuditLogs());
    } catch (err) {
      console.error("Failed to toggle RLS:", err);
    }
  };

  const handleToggleUserStatus = async (role, id) => {
    try {
      if (role === "student") {
        const student = students.find((s) => s.id === id);
        if (student) {
          const newStatus = student.status === "Active" ? "Inactive" : "Active";
          await adminService.toggleUserStatus("students", id, newStatus);
          setStudents(await adminService.fetchStudents());
        }
      } else if (role === "teacher") {
        const teacher = teachers.find((t) => t.id === id);
        if (teacher) {
          const newStatus = teacher.status === "Active" ? "Inactive" : "Active";
          await adminService.toggleUserStatus("teachers", id, newStatus);
          setTeachers(await adminService.fetchTeachers());
        }
      }
    } catch (err) {
      console.error("Failed to toggle user status:", err);
    }
  };

  // Profile
  const handleUpdateProfile = async (newDetails) => {
    try {
      if (user) {
        await adminService.updateAdminProfile(user.id, {
          name: newDetails.name,
          email: newDetails.email,
        });
        if (newDetails.email && newDetails.email !== adminProfile.email) {
          await supabase.auth.updateUser({ email: newDetails.email });
        }
        const profile = await adminService.fetchAdminProfile(user.id);
        if (profile) setAdminProfile(profile);
        await adminService.addAuditLog({
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          level: "INFO",
          source: "ProfileManagement",
          message: "Admin profile updated successfully.",
          operator: "Admin",
        });
        setAuditLogs(await adminService.fetchAuditLogs());
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    // Verify current password by re-authenticating
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: adminProfile.email,
      password: currentPassword,
    });
    if (authError) throw new Error("Current password is incorrect.");

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);

    await adminService.addAuditLog({
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      level: "INFO",
      source: "ProfileManagement",
      message: "Admin password changed successfully.",
      operator: "Admin",
    });
    setAuditLogs(await adminService.fetchAuditLogs());
  };

  // Quick Action navigation shortcut
  const handleQuickAction = (action) => {
    if (action === "AddStudent") {
      setActiveTab("Students");
    } else if (action === "AddTeacher") {
      setActiveTab("Teachers");
    } else if (action === "CreateBatch") {
      setActiveTab("Batches");
    }
  };

  // Logout
  const handleLogout = async () => {
    if (confirm("Are you sure you want to end your administrative session?")) {
      try {
        await adminService.addAuditLog({
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
          level: "INFO",
          source: "AuthControl",
          message: "Admin session closed via logout trigger.",
          operator: "Admin",
        });
      } catch (e) {
        /* ignore audit failure on logout */
      }
      await supabase.auth.signOut();
      onNavigate("landing");
    }
  };

  // --- 4. TAB CONTENT RENDERER ---
  const renderTabContent = () => {
    switch (activeTab) {
      case "Students":
        return (
          <StudentsTab
            students={students}
            batches={batches}
            subjects={subjects}
            teachers={teachers}
            attendanceLogs={attendanceLogs}
            assignments={assignments}
            weeklyTests={weeklyTests}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case "Teachers":
        return (
          <TeachersTab
            teachers={teachers}
            students={students}
            batches={batches}
            subjects={subjects}
            attendanceLogs={attendanceLogs}
            assignments={assignments}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
          />
        );
      case "Subjects":
        return (
          <SubjectsTab
            subjects={subjects}
            teachers={teachers}
            students={students}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        );
      case "Batches":
        return (
          <BatchesTab
            batches={batches}
            subjects={subjects}
            teachers={teachers}
            students={students}
            onAddBatch={handleAddBatch}
            onUpdateBatch={handleUpdateBatch}
            onDeleteBatch={handleDeleteBatch}
          />
        );
      case "Attendance":
        return (
          <AttendanceTab
            attendanceLogs={attendanceLogs}
            students={students}
            teachers={teachers}
            subjects={subjects}
            onUpdateAttendanceLog={handleUpdateAttendanceLog}
          />
        );
      case "Materials":
        return (
          <MaterialsTab
            materials={materials}
            subjects={subjects}
            teachers={teachers}
            onFlagMaterial={handleFlagMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        );
      case "Assignments":
        return (
          <AssignmentsTab
            assignments={assignments}
            subjects={subjects}
            batches={batches}
            teachers={teachers}
          />
        );
      case "Classes":
        return (
          <ClassesTab
            onlineClasses={onlineClasses}
            subjects={subjects}
            batches={batches}
            teachers={teachers}
          />
        );
      case "Reports":
        return (
          <ReportsTab
            students={students}
            teachers={teachers}
            subjects={subjects}
            batches={batches}
            attendanceLogs={attendanceLogs}
            assignments={assignments}
            weeklyTests={weeklyTests}
          />
        );
      case "Settings":
        return (
          <SettingsTab
            students={students}
            teachers={teachers}
            auditLogs={auditLogs}
            onToggleUserStatus={handleToggleUserStatus}
            settings={settings}
            onToggleRLS={handleToggleRLS}
          />
        );
      case "Profile":
        return (
          <ProfileTab
            profile={adminProfile}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onLogout={handleLogout}
          />
        );
      default:
        return (
          <DashboardOverview
            students={students}
            teachers={teachers}
            subjects={subjects}
            batches={batches}
            onlineClasses={onlineClasses}
            notifications={notifications}
            onNavigateTab={setActiveTab}
            onQuickAction={handleQuickAction}
          />
        );
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div
        className="dashboard-container admin-dashboard-root"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "4px solid #1e293b",
              borderTop: "4px solid #6366f1",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Loading admin console...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container admin-dashboard-root">
      <Sidebar
        activeTab={activeTab}
        selectTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        onNavigate={onNavigate}
      />

      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header admin-header">
          <div className="header-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1>
              {activeTab === "Dashboard" ? "Admin Console" : activeTab}
            </h1>
          </div>

          <div className="header-right">
            {/* Notification bell */}
            <button
              className="notification-bell-btn"
              onClick={() => {
                setActiveTab("Dashboard");
                setUnreadNotifications(false);
              }}
              aria-label="View notifications overview"
            >
              <Bell size={22} />
              {unreadNotifications && (
                <span className="bell-badge-dot"></span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div
              className="header-profile"
              onClick={() => setActiveTab("Profile")}
            >
              <div className="profile-details">
                <span className="profile-name">{adminProfile.name}</span>
                <span className="profile-id text-indigo-light">
                  Admin
                </span>
              </div>
              <img
                src={avatarImg}
                alt="Admin Avatar"
                className="profile-avatar admin-profile-border"
              />
            </div>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="dashboard-content admin-content-main">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
