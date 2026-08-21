import { useState, useEffect } from "react";
import { Menu, Bell, Search, Shield, ShieldAlert, LogOut } from "lucide-react";
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

  // --- 1. CORE DATA BASE STATE ---

  // Subjects
  const [subjects, setSubjects] = useState([
    { id: "1", name: "Mathematics", code: "MATH12", description: "Advanced Calculative Algebra & Calculus Revision Course" },
    { id: "2", name: "Physics", code: "PHYS12", description: "Quantum Physics Fundamentals & Thermal Systems Dynamics" },
    { id: "3", name: "Chemistry", code: "CHEM12", description: "Organic Chemistry Formulations & Aldehydes Reagents" }
  ]);

  // Teachers
  const [teachers, setTeachers] = useState([
    { id: "TCH101", name: "Mr. Rajesh", contact: "+91 94441 23456", email: "rajesh.math@growise.edu", qualification: "M.Sc. Mathematics, 10 yrs exp", subjects: ["Mathematics"], status: "Active" },
    { id: "TCH102", name: "Mrs. Anita", contact: "+91 94442 34567", email: "anita.phys@growise.edu", qualification: "Ph.D. Physics, 8 yrs exp", subjects: ["Physics"], status: "Active" },
    { id: "TCH103", name: "Mr. Kumar", contact: "+91 94443 45678", email: "kumar.chem@growise.edu", qualification: "M.Sc. Organic Chemistry, 6 yrs exp", subjects: ["Chemistry"], status: "Active" }
  ]);

  // Students
  const [students, setStudents] = useState([
    { id: "STU101", name: "Sneha", contact: "+91 98765 43210", email: "sneha@growise.edu", dob: "2008-04-12", address: "No. 12, Guindy Road, Chennai", parentName: "Mr. Ramakrishnan", parentContact: "+91 98765 99999", subjects: ["Mathematics", "Physics", "Chemistry"], batchId: "BAT101", username: "Sneha", password: "Sneha@123", status: "Active" },
    { id: "STU102", name: "Aravind", contact: "+91 98765 11111", email: "aravind@growise.edu", dob: "2007-09-18", address: "No. 40, Velachery, Chennai", parentName: "Mrs. Lakshmi", parentContact: "+91 98765 22222", subjects: ["Mathematics", "Physics"], batchId: "BAT102", username: "Aravind", password: "Password@123", status: "Active" }
  ]);

  // Batches (1:1 constraint)
  const [batches, setBatches] = useState([
    { id: "BAT101", name: "Batch 12-Maths-Sneha", subject: "Mathematics", teacher: "Mr. Rajesh", student: "Sneha", schedule: "Mon, Wed, Fri - 5:00 PM", status: "Active" },
    { id: "BAT102", name: "Batch 12-Phys-Aravind", subject: "Physics", teacher: "Mrs. Anita", student: "Aravind", schedule: "Tue, Thu - 4:00 PM", status: "Active" }
  ]);

  // Study Materials
  const [materials, setMaterials] = useState([
    { id: "1", title: "Algebra practice Worksheet.pdf", subject: "Mathematics", teacher: "Mr. Rajesh", flagged: false },
    { id: "2", title: "Calculus Limits Formulas.pdf", subject: "Mathematics", teacher: "Mr. Rajesh", flagged: false },
    { id: "3", title: "Quantum Physics Waves Notes.pdf", subject: "Physics", teacher: "Mrs. Anita", flagged: false },
    { id: "4", title: "Aldehydes Functional Groups.pdf", subject: "Chemistry", teacher: "Mr. Kumar", flagged: true } // flagged demo
  ]);

  // Attendance logs
  const [attendanceLogs, setAttendanceLogs] = useState([
    { date: "Today", subject: "Mathematics", teacher: "Mr. Rajesh", student: "Sneha", status: "Present" },
    { date: "Today", subject: "Physics", teacher: "Mrs. Anita", student: "Aravind", status: "Present" },
    { date: "24 Jun 2026", subject: "Physics", teacher: "Mrs. Anita", student: "Sneha", status: "Present" },
    { date: "18 Jun 2026", subject: "Chemistry", teacher: "Mr. Kumar", student: "Sneha", status: "Present" },
    { date: "12 Jun 2026", subject: "Mathematics", teacher: "Mr. Rajesh", student: "Sneha", status: "Present" }
  ]);

  // Assignments
  const [assignments, setAssignments] = useState([
    { id: "A1", title: "Algebra Revision Sheet", description: "Practice algebraic equations and quadratic systems.", subject: "Mathematics", batchId: "BAT101", dueDate: "18 Jun 2026", student: "Sneha", status: "Evaluated", marks: 18, totalMarks: 20, remarks: "Excellent grasp of algebraic limits." },
    { id: "A2", title: "Calculus practice Worksheet", description: "Derivatives evaluation exercises.", subject: "Mathematics", batchId: "BAT101", dueDate: "25 Jun 2026", student: "Sneha", status: "Evaluated", marks: 20, totalMarks: 20, remarks: "Perfect marks, outstanding work." },
    { id: "A3", title: "Quantum Physics homework", description: "Solve Planck and Heisenberg uncertainty formulations.", subject: "Physics", batchId: "BAT101", dueDate: "05 Jul 2026", student: "Sneha", status: "Submitted", marks: null, totalMarks: 20, remarks: "" },
    { id: "A4", title: "Optics Homework Assignment", description: "Refraction indices calculations.", subject: "Physics", batchId: "BAT101", dueDate: "12 Jul 2026", student: "Sneha", status: "Pending", marks: null, totalMarks: 20, remarks: "" }
  ]);

  // Weekly Tests
  const [weeklyTests, setWeeklyTests] = useState([
    { id: 1, subject: "Mathematics", title: "Algebra Test", teacher: "Mr. Rajesh", date: "12 Jun 2026", status: "Published", marksObtained: 18, totalMarks: 20, percent: 90 },
    { id: 2, subject: "Physics", title: "Quantum Mechanics Test", teacher: "Mrs. Anita", date: "19 Jun 2026", status: "Published", marksObtained: 16, totalMarks: 20, percent: 80 },
    { id: 3, subject: "Chemistry", title: "Aldehydes Test", teacher: "Mr. Kumar", date: "26 Jun 2026", status: "Result Pending", marksObtained: null, totalMarks: 20, percent: null }
  ]);

  // Online Classes
  const [onlineClasses, setOnlineClasses] = useState([
    { id: 1, subject: "Mathematics", title: "Mathematics - Algebra Revision", description: "Advanced Problem Solving Techniques", teacher: "Mr. Rajesh", student: "Sneha", date: "Today", time: "5:00 PM - 6:00 PM", status: "Live Now" },
    { id: 2, subject: "Physics", title: "Physics - Quantum Mechanics", description: "Understanding Quantum Mechanics", teacher: "Mrs. Anita", student: "Aravind", date: "Today", time: "4:00 PM - 5:00 PM", status: "Completed" },
    { id: 3, subject: "Chemistry", title: "Chemistry - Organic Chemistry", description: "Introduction to Hydrocarbons", teacher: "Mr. Kumar", student: "Sneha", date: "18 Jun 2026", time: "3:00 PM - 4:00 PM", status: "Completed" }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: "assignment", message: "Sneha submitted Physics Quantum Mechanics Homework", time: "2 hours ago" },
    { id: 2, type: "material", message: "Mr. Rajesh uploaded Calculus Limits Formulas study sheet", time: "5 hours ago" },
    { id: 3, type: "batch", message: "New batch Batch 12-Phys-Aravind created successfully", time: "Yesterday" }
  ]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { timestamp: "2026-07-29 19:15:22", level: "INFO", source: "AuthControl", message: "Admin authenticated via secure control credentials.", operator: "Admin" },
    { timestamp: "2026-07-29 19:10:05", level: "WARNING", source: "StudyMaterials", message: "Chemistry study file 'Aldehydes Functional Groups.pdf' flagged for inappropriate title review.", operator: "TutorSystem" },
    { timestamp: "2026-07-29 19:08:44", level: "EXCEPTION", source: "JitsiMeetAPI", message: "Simulated WebRTC connection latency warning: 120ms standard drop limit exceeded.", operator: "SYSTEM" }
  ]);

  // Settings
  const [settings, setSettings] = useState({
    studentRestricted: true,
    teacherRestricted: true,
    strictValidation: false
  });

  // Admin Profile
  const [adminProfile, setAdminProfile] = useState({
    name: "Maha",
    email: "maha@growise.edu",
    password: "Maha@123"
  });

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

  // --- RE-FETCH DATA ON TAB CHANGE removed ---
  // Realtime subscriptions (below) keep all data fresh automatically.
  // No need to re-fetch 12 tables every time the user switches tabs.

  // --- 2. SUPABASE REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "students" },
        async () => { try { setStudents(await adminService.fetchStudents()); } catch (e) { /* silent */ } })
      .on("postgres_changes", { event: "*", schema: "public", table: "teachers" },
        async () => { try { setTeachers(await adminService.fetchTeachers()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "subjects" },
        async () => { try { setSubjects(await adminService.fetchSubjects()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "batches" },
        async () => { try { setBatches(await adminService.fetchBatches()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "materials" },
        async () => { try { setMaterials(await adminService.fetchMaterials()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_logs" },
        async () => { try { setAttendanceLogs(await adminService.fetchAttendanceLogs()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" },
        async () => { try { setAssignments(await adminService.fetchAssignments()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_tests" },
        async () => { try { setWeeklyTests(await adminService.fetchWeeklyTests()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "online_classes" },
        async () => { try { setOnlineClasses(await adminService.fetchOnlineClasses()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" },
        async () => { try { setNotifications(await adminService.fetchNotifications()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" },
        async () => { try { setAuditLogs(await adminService.fetchAuditLogs()); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" },
        async () => { try { const s = await adminService.fetchSettings(); if (s) setSettings(s); } catch (e) { } })
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_profiles" },
        async () => { try { const p = await adminService.fetchAdminProfile(user.id); if (p) setAdminProfile(p); } catch (e) { } })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  // --- 3. CRUD HANDLERS (all async → Supabase) ---

  // Students
  const handleAddStudent = async (newStu) => {
    try {
      await adminService.addStudent(newStu);
      setStudents((currentStudents) => {
        const nextStudent = {
          ...newStu,
          subjects: Array.isArray(newStu.subjects) ? newStu.subjects : [],
          status: newStu.status || "Active",
        };

        const existingIndex = currentStudents.findIndex(
          (student) => student.id === nextStudent.id || (nextStudent.email && student.email === nextStudent.email)
        );

        if (existingIndex >= 0) {
          const updatedStudents = [...currentStudents];
          updatedStudents[existingIndex] = { ...updatedStudents[existingIndex], ...nextStudent };
          return updatedStudents;
        }

        return [...currentStudents, nextStudent];
      });

      adminService.fetchStudents().then(setStudents).catch((err) => {
        console.error("Failed to refresh students after add:", err);
      });

      await adminService.addNotification({
        type: "batch",
        message: `New Student ${newStu.name} added to system database.`,
        time: "Just now",
      });
      setNotifications(await adminService.fetchNotifications());
      return true;
    } catch (err) {
      console.error("Failed to add student:", err);
      return false;
    }
  };

  const handleUpdateStudent = async (updatedStu) => {
    try {
      await adminService.updateStudent(updatedStu);
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === updatedStu.id || (updatedStu.email && student.email === updatedStu.email)
            ? { ...student, ...updatedStu }
            : student
        )
      );

      adminService.fetchStudents().then(setStudents).catch((err) => {
        console.error("Failed to refresh students after update:", err);
      });

      return true;
    } catch (err) {
      console.error("Failed to update student:", err);
      return false;
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
    } else if (action === "AddSubject") {
      setActiveTab("Subjects");
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

  // --- Notification icon by type ---
  const getNotifIcon = (type) => {
    switch (type) {
      case "batch": return <Users size={16} />;
      case "subject": return <BookOpen size={16} />;
      case "alert": return <ShieldAlert size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getNotifColor = (type) => {
    switch (type) {
      case "batch": return "#6366f1";
      case "subject": return "#10b981";
      case "alert": return "#ef4444";
      default: return "#3b82f6";
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
            {/* Notification bell + dropdown */}
            <div className="notif-panel-wrapper" ref={notifPanelRef}>
              <button
                className={`notification-bell-btn${notifPanelOpen ? " notif-bell-active" : ""}`}
                onClick={() => {
                  setNotifPanelOpen((prev) => !prev);
                  setUnreadNotifications(false);
                }}
                aria-label="View notifications"
              >
                <Bell size={22} />
                {unreadNotifications && (
                  <span className="bell-badge-dot"></span>
                )}
              </button>

              {notifPanelOpen && (
                <div className="notif-dropdown-panel">
                  <div className="notif-dropdown-header">
                    <h3>Notifications</h3>
                    <button
                      className="notif-close-btn"
                      onClick={() => setNotifPanelOpen(false)}
                      aria-label="Close notifications"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <Bell size={32} className="notif-empty-icon" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice().reverse().map((n) => (
                        <div className="notif-dropdown-item" key={n.id}>
                          <div
                            className="notif-item-icon"
                            style={{ backgroundColor: `${getNotifColor(n.type)}15`, color: getNotifColor(n.type) }}
                          >
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="notif-item-content">
                            <p className="notif-item-msg">{n.message}</p>
                            <span className="notif-item-time">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="notif-dropdown-footer">
                      <button
                        className="notif-view-all-btn"
                        onClick={() => {
                          setActiveTab("Dashboard");
                          setNotifPanelOpen(false);
                        }}
                      >
                        <CheckCheck size={14} />
                        View all activity
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

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
                src={adminAvatar}
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
