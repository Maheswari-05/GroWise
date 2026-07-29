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

  // --- 2. LOG EVENT TRIGGER HELPER ---
  const addAuditLog = (level, source, message) => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    setAuditLogs(prev => [
      { timestamp, level, source, message, operator: "Admin" },
      ...prev
    ]);
  };

  // --- 3. CRUD HANDLER ACTIONS ---

  // Students CRUD
  const handleAddStudent = (newStu) => {
    setStudents(prev => [...prev, newStu]);
    // Create audit log
    addAuditLog("INFO", "StudentManager", `Added new student record: ${newStu.name} (${newStu.id})`);
    // Add activity notification
    setNotifications(prev => [
      { id: Date.now(), type: "batch", message: `New Student ${newStu.name} added to system database.`, time: "Just now" },
      ...prev
    ]);
  };

  const handleUpdateStudent = (updatedStu) => {
    setStudents(prev => prev.map(s => s.id === updatedStu.id ? updatedStu : s));
    addAuditLog("INFO", "StudentManager", `Updated student profile information: ${updatedStu.name} (${updatedStu.id})`);
  };

  const handleDeleteStudent = (stuId) => {
    const stu = students.find(s => s.id === stuId);
    setStudents(prev => prev.filter(s => s.id !== stuId));
    addAuditLog("WARNING", "StudentManager", `Deleted student record from database: ${stu?.name || stuId}`);
  };

  // Teachers CRUD
  const handleAddTeacher = (newTch) => {
    setTeachers(prev => [...prev, newTch]);
    addAuditLog("INFO", "TeacherManager", `Registered new faculty member: ${newTch.name} (${newTch.id})`);
  };

  const handleUpdateTeacher = (updatedTch) => {
    setTeachers(prev => prev.map(t => t.id === updatedTch.id ? updatedTch : t));
    addAuditLog("INFO", "TeacherManager", `Updated faculty member details: ${updatedTch.name} (${updatedTch.id})`);
  };

  const handleDeleteTeacher = (tchId) => {
    const tch = teachers.find(t => t.id === tchId);
    setTeachers(prev => prev.filter(t => t.id !== tchId));
    addAuditLog("WARNING", "TeacherManager", `Deleted faculty record from system: ${tch?.name || tchId}`);
  };

  // Subjects CRUD
  const handleAddSubject = (newSub) => {
    setSubjects(prev => [...prev, newSub]);
    addAuditLog("INFO", "SubjectManager", `Created new syllabus course: ${newSub.name} (${newSub.code})`);
  };

  const handleUpdateSubject = (updatedSub) => {
    setSubjects(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
    addAuditLog("INFO", "SubjectManager", `Modified subject syllabus settings: ${updatedSub.name} (${updatedSub.code})`);
  };

  const handleDeleteSubject = (subId) => {
    const sub = subjects.find(s => s.id === subId);
    setSubjects(prev => prev.filter(s => s.id !== subId));
    addAuditLog("WARNING", "SubjectManager", `Removed course subject from center directory: ${sub?.name || subId}`);
  };

  // Batches CRUD
  const handleAddBatch = (newBat) => {
    setBatches(prev => [...prev, newBat]);
    addAuditLog("INFO", "BatchManager", `Scheduled new 1:1 study batch: ${newBat.name} (${newBat.id})`);
    setNotifications(prev => [
      { id: Date.now(), type: "batch", message: `New batch ${newBat.name} scheduled for ${newBat.student} with ${newBat.teacher}.`, time: "Just now" },
      ...prev
    ]);
  };

  const handleUpdateBatch = (updatedBat) => {
    setBatches(prev => prev.map(b => b.id === updatedBat.id ? updatedBat : b));
    addAuditLog("INFO", "BatchManager", `Modified batch mapping configs: ${updatedBat.name}`);
  };

  const handleDeleteBatch = (batId) => {
    const bat = batches.find(b => b.id === batId);
    setBatches(prev => prev.filter(b => b.id !== batId));
    addAuditLog("WARNING", "BatchManager", `Deleted batch: ${bat?.name || batId}`);
  };

  // Materials Oversight
  const handleFlagMaterial = (id) => {
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        const flagVal = !m.flagged;
        addAuditLog("WARNING", "MaterialsOversight", `Study file '${m.title}' flagged status toggled to: ${flagVal ? "FLAGGED" : "CLEARED"}`);
        return { ...m, flagged: flagVal };
      }
      return m;
    }));
  };

  const handleDeleteMaterial = (id) => {
    const m = materials.find(file => file.id === id);
    setMaterials(prev => prev.filter(file => file.id !== id));
    addAuditLog("WARNING", "MaterialsOversight", `Removed study material file from directories: ${m?.title || id}`);
  };

  // Attendance edit
  const handleUpdateAttendanceLog = (updatedLog) => {
    setAttendanceLogs(prev => prev.map(log => 
      (log.student === updatedLog.student && log.date === updatedLog.date && log.subject === updatedLog.subject) 
      ? updatedLog 
      : log
    ));
    addAuditLog("INFO", "AttendanceRegistry", `Corrected attendance record for ${updatedLog.student} on ${updatedLog.date} -> ${updatedLog.status}`);
  };

  // Settings
  const handleToggleRLS = (policyName) => {
    setSettings(prev => {
      const nextVal = !prev[policyName];
      addAuditLog("INFO", "AccessControlSettings", `Row Level Security (RLS) configuration for policy '${policyName}' toggled to: ${nextVal ? "ON" : "OFF"}`);
      return { ...prev, [policyName]: nextVal };
    });
  };

  const handleToggleUserStatus = (role, id) => {
    if (role === "student") {
      setStudents(prev => prev.map(s => {
        if (s.id === id) {
          const nextState = s.status === "Active" ? "Inactive" : "Active";
          addAuditLog("WARNING", "AccessControlSettings", `Student portal access state for ${s.name} set to: ${nextState}`);
          return { ...s, status: nextState };
        }
        return s;
      }));
    } else if (role === "teacher") {
      setTeachers(prev => prev.map(t => {
        if (t.id === id) {
          const nextState = t.status === "Active" ? "Inactive" : "Active";
          addAuditLog("WARNING", "AccessControlSettings", `Teacher login authentication token for ${t.name} set to: ${nextState}`);
          return { ...t, status: nextState };
        }
        return t;
      }));
    }
  };

  // Profile details update
  const handleUpdateProfile = (newDetails) => {
    setAdminProfile(prev => {
      const updated = { ...prev, ...newDetails };
      addAuditLog("INFO", "ProfileManagement", `Admin security credential profile updated successfully.`);
      return updated;
    });
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

  // Logouts
  const handleLogout = () => {
    if (confirm("Are you sure you want to end your administrative session?")) {
      addAuditLog("INFO", "AuthControl", "Admin session closed via logout trigger.");
      onNavigate("landing");
    }
  };

  // Tab Coordinator switch
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

  return (
    <div className="dashboard-container admin-dashboard-root">
      <Sidebar 
        activeTab={activeTab} 
        selectTab={setActiveTab} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header admin-header">
          <div className="header-left">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1>{activeTab === "Dashboard" ? "Admin Console" : activeTab}</h1>
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
              {unreadNotifications && <span className="bell-badge-dot"></span>}
            </button>

            {/* Profile Dropdown */}
            <div className="header-profile" onClick={() => setActiveTab("Profile")}>
              <div className="profile-details">
                <span className="profile-name">{adminProfile.name}</span>
                <span className="profile-id text-indigo-light">Super Administrator</span>
              </div>
              <img src={avatarImg} alt="Admin Avatar" className="profile-avatar admin-profile-border" />
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
