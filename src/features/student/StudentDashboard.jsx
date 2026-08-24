import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ClipboardList,
  FileText,
  Tv,
  BarChart3,
  Bell,
  User,
  Users,
  LogOut,
  Menu,
  X,
  Video,
  CheckCircle,
  AlertTriangle,
  Award,
  Download,
  FileCheck,
  ChevronRight,
  Search,
  Calculator,
  FlaskConical,
  Play,
  Lock,
  HelpCircle,
  GraduationCap,
  Paperclip,
  Upload,
  Check,
  Loader2,
  Mic,
  MicOff,
  Radio,
  ExternalLink,
  Maximize2,
  Minimize2,
  Eye,
  Sparkles,
  FolderOpen,
  Filter
} from "lucide-react";
import logo from "../../assets/logo.png";
import avatarImg from "../../assets/avatar.png";
import mathClassImg from "../../assets/math_class.png";
import physicsClassImg from "../../assets/physics_class.png";
import chemistryClassImg from "../../assets/chemistry_class.png";
import supabase from "../../lib/supabase";
import * as adminService from "../../services/adminService";
import AttendanceView from "./components/AttendanceView";
import JitsiClassroom from "../../components/JitsiClassroom/JitsiClassroom";
import "./StudentDashboard.css";

const StudentDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const [studentProfile, setStudentProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [attendanceError, setAttendanceError] = useState("");

  const getDisplayValue = (value, fallback = "—") => {
    if (value === null || value === undefined) return fallback;
    const text = typeof value === "string" ? value.trim() : String(value).trim();
    return text ? value : fallback;
  };

  const normalizeStudentProfile = (student, batchName, assignedTeachers, batchSchedule = "—") => ({
    ...student,
    batchId: student?.batch_id || "",
    name: student?.name || "",
    email: student?.email || "",
    contact: student?.contact || "",
    dob: student?.dob || "",
    address: student?.address || "",
    batchName,
    batchSchedule,
    assignedTeachers,
    admissionDate: student?.created_at || "",
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    let active = true;

    const fetchStudentProfile = async () => {
      try {
        setLoadingProfile(true);
        setLoadingAttendance(true);
        setProfileError("");
        setAttendanceError("");

        let studentEmail = "";
        const loggedStudentStr = localStorage.getItem("gw_logged_student");
        if (loggedStudentStr) {
          try {
            studentEmail = JSON.parse(loggedStudentStr).email;
          } catch (e) { }
        }

        if (!studentEmail) {
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
            console.error("No authenticated user found:", authError);
            if (active) {
              onNavigate("login");
            }
            return;
          }
          studentEmail = user.email;
        }

        const normalizedEmail = studentEmail.trim().toLowerCase();

        console.log("Authenticated user found in dashboard:", normalizedEmail);

        const { data: student, error: studentError } = await supabase
          .from("students")
          .select("*")
          .ilike("email", normalizedEmail)
          .maybeSingle();

        if (studentError) {
          throw studentError;
        }

        if (!student) {
          console.error("Student profile not found for email:", normalizedEmail);
          if (active) {
            setProfileError("Student profile not found in database.");
            setLoadingProfile(false);
            setLoadingAttendance(false);
          }
          return;
        }

        let batchName = student.batch || student.batch_id || "Not Assigned";
        let batchSchedule = "—";
        let assignedTeachers = [];

        const addTeacherName = (teacherName) => {
          if (!teacherName) return;
          const value = String(teacherName).trim();
          if (value && !assignedTeachers.includes(value)) {
            assignedTeachers.push(value);
          }
        };

        const batchTarget = student.batch_id || student.batch;
        let batchData = null;
        if (batchTarget) {
          const { data } = await supabase
            .from("batches")
            .select("*")
            .or(`id.eq.${batchTarget},name.eq.${batchTarget}`)
            .maybeSingle();
          batchData = data;
        }

        if (batchData) {
          batchName = batchData.name;
          batchSchedule = batchData.schedule || "—";
          addTeacherName(batchData.teacher);
          addTeacherName(batchData.teacher_name);

          if (batchData.teacher_id) {
            const { data: teacherInfo } = await supabase
              .from("teachers")
              .select("*")
              .eq("id", batchData.teacher_id)
              .maybeSingle();
            if (teacherInfo?.name) addTeacherName(teacherInfo.name);
          }
        }

        const teacherTarget = student.teacher_id || student.teacherId || student.teacher;
        if (teacherTarget) {
          const { data: teacherData } = await supabase
            .from("teachers")
            .select("*")
            .or(`id.eq.${teacherTarget},name.eq.${teacherTarget}`)
            .maybeSingle();

          if (teacherData?.name) {
            addTeacherName(teacherData.name);
          } else {
            addTeacherName(String(teacherTarget).trim());
          }
        }

        if (assignedTeachers.length === 0 && student.subjects && Array.isArray(student.subjects)) {
          const { data: allTeachers } = await supabase.from("teachers").select("*");
          if (allTeachers && Array.isArray(allTeachers)) {
            const studentSubjs = student.subjects.map((subject) => String(subject).toLowerCase());
            allTeachers.forEach((teacher) => {
              const teacherSubjects = (teacher.subjects || []).map((subject) => String(subject).toLowerCase());
              if (teacherSubjects.some((subject) => studentSubjs.includes(subject)) && teacher.name) {
                addTeacherName(teacher.name);
              }
            });
          }
        }

        // Fetch attendance logs for this student name or ID
        let attLogs = [];
        let attError = null;
        try {
          const sIdentifier = student.name || student.id || student.email;
          const { data, error } = await supabase
            .from("attendance_logs")
            .select("*")
            .or(`student.eq.${student.name},student_id.eq.${student.id},student_id.eq.${student.email}`)
            .order("date", { ascending: false });
          if (error) {
            attError = error;
          } else {
            attLogs = data || [];
          }
        } catch (e) {
          console.error("Exception fetching attendance logs:", e);
          attError = e;
        }

        // Merge with LocalStorage attendance logs
        try {
          const raw = localStorage.getItem("gw_attendance_logs_v3");
          const localLogs = raw ? JSON.parse(raw) : [];
          const myLocalLogs = localLogs.filter(
            (l) => l.student === student.name || l.student_id === student.id || l.student_id === student.email
          );
          const mergedMap = new Map();
          attLogs.forEach((l) => mergedMap.set(String(l.id), l));
          myLocalLogs.forEach((l) => {
            if (!mergedMap.has(String(l.id))) {
              mergedMap.set(String(l.id), l);
            }
          });
          attLogs = Array.from(mergedMap.values());
        } catch (e) {}

        if (active) {
          setStudentProfile(normalizeStudentProfile(student, batchName, assignedTeachers, batchSchedule));
          setAttendanceLogs(attLogs);
          if (attError && attLogs.length === 0) {
            setAttendanceError("Failed to load attendance logs.");
          }
          setLoadingAttendance(false);
          setLoadingProfile(false);
        }
      } catch (err) {
        console.error("Error fetching student profile:", err);
        if (active) {
          setProfileError(err.message || "Failed to load student profile.");
          setLoadingProfile(false);
          setLoadingAttendance(false);
        }
      }
    };

    fetchStudentProfile();

    // Real-time subscription: re-fetch when student record or attendance logs are updated
    const studentChannel = supabase
      .channel("student-profile-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "students" }, () => {
        if (active) fetchStudentProfile();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "batches" }, () => {
        if (active) fetchStudentProfile();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_logs" }, () => {
        if (active) fetchStudentProfile();
      })
      .subscribe();

    const handleStorageUpdate = () => {
      if (active) fetchStudentProfile();
    };
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorageUpdate);
      supabase.removeChannel(studentChannel);
    };
  }, [onNavigate]);

  const [historyFilter, setHistoryFilter] = useState("All Subjects");

  const [assignmentSearch, setAssignmentSearch] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("All Subjects");
  const [assignmentStatus, setAssignmentStatus] = useState("All Status");
  const [submittingId, setSubmittingId] = useState(null);
  const [activeDetailsAssignment, setActiveDetailsAssignment] = useState(null);

  const [testSearch, setTestSearch] = useState("");
  const [testSubject, setTestSubject] = useState("All Subjects");
  const [activeTestResult, setActiveTestResult] = useState(null);
  const [weeklyTests, setWeeklyTests] = useState([]);
  const [weeklyTestsLoading, setWeeklyTestsLoading] = useState(false);
  const [testSubmissions, setTestSubmissions] = useState({}); // testId -> { uploading, url }
  const submissionInputRefs = useRef({});

  // Fetch weekly tests for this student from Supabase & adminService & localStorage
  useEffect(() => {
    let active = true;

    const fetchWeeklyTests = async () => {
      setWeeklyTestsLoading(true);
      try {
        let dbTests = await adminService.fetchWeeklyTests();
        if (!Array.isArray(dbTests)) dbTests = [];

        let localTests = [];
        try {
          const raw = localStorage.getItem("gw_weeklytests_v4");
          if (raw) localTests = JSON.parse(raw);
        } catch (e) {}

        // Merge tests by id with deep marks preservation
        const mergedMap = new Map();
        [...localTests, ...dbTests].forEach((t) => {
          if (t && t.id) {
            const key = String(t.id);
            const existing = mergedMap.get(key);
            if (existing) {
              const combinedMarks = {
                ...(existing.studentMarks || existing.student_marks || {}),
                ...(t.studentMarks || t.student_marks || {}),
              };
              mergedMap.set(key, {
                ...existing,
                ...t,
                studentMarks: combinedMarks,
                student_marks: combinedMarks,
              });
            } else {
              mergedMap.set(key, {
                ...t,
                studentMarks: t.studentMarks || t.student_marks || {},
                student_marks: t.student_marks || t.studentMarks || {},
              });
            }
          }
        });
        const allCombinedTests = Array.from(mergedMap.values());

        const studentBatchId = String(studentProfile?.batchId || studentProfile?.batch_id || studentProfile?.batch || "").trim().toLowerCase();
        const studentBatchName = String(studentProfile?.batchName || "").trim().toLowerCase();
        const studentSubjects = (studentProfile?.subjects || []).map((s) => String(s).toLowerCase().trim());
        const sId = String(studentProfile?.id || "");
        const sId2 = String(studentProfile?.student_id || "");

        const myTests = allCombinedTests.filter((t) => {
          if (!t) return false;
          const tBatchId = String(t.batchId || t.batch_id || t.batch || "").trim().toLowerCase();
          const tSub = String(t.subject || "").trim().toLowerCase();
          const allMarks = t.studentMarks || t.student_marks || {};

          // If student has explicit marks/submission
          if ((sId && allMarks[sId]) || (sId2 && allMarks[sId2]) || allMarks[studentProfile?.name]) return true;

          // If test is for all batches or matches student's batch
          if (tBatchId === "all" || !tBatchId) return true;
          if (studentBatchId && (tBatchId === studentBatchId || tBatchId === studentBatchName || studentBatchId.includes(tBatchId) || tBatchId.includes(studentBatchId))) return true;
          if (studentBatchName && (tBatchId === studentBatchName || tBatchId === studentBatchId || studentBatchName.includes(tBatchId) || tBatchId.includes(studentBatchName))) return true;

          // If test subject matches
          if (tSub && (studentSubjects.length === 0 || studentSubjects.some((sub) => sub === tSub || tSub.includes(sub) || sub.includes(tSub)))) return true;

          // Always show test rather than hiding it
          return true;
        });

        if (active) {
          setWeeklyTests(myTests);
          setWeeklyTestsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching weekly tests for student:", err);
        if (active) setWeeklyTestsLoading(false);
      }
    };

    fetchWeeklyTests();

    const testChan = supabase
      .channel("student-weekly-tests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "weekly_tests" }, () => {
        fetchWeeklyTests();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(testChan);
    };
  }, [studentProfile]);

  const handleSubmitTestAnswer = async (test) => {
    const fileInput = submissionInputRefs.current[test.id];
    if (!fileInput || !fileInput.files[0]) {
      showToast("Please select a file before clicking Submit.", "info");
      return;
    }
    const file = fileInput.files[0];
    const studentId = studentProfile?.id || studentProfile?.student_id || studentProfile?.name || "s1";

    setTestSubmissions((prev) => ({ ...prev, [test.id]: { uploading: true, url: null } }));

    try {
      // 1. Read file as DataURL as a guaranteed fallback
      const fileDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result || null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

      let submissionUrl = null;

      // 2. Try uploading file to Supabase Storage bucket 'weekly-tests'
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `submissions/${test.id}_${studentId}_${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("weekly-tests")
          .upload(path, file, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("weekly-tests").getPublicUrl(path);
          if (urlData?.publicUrl) submissionUrl = urlData.publicUrl;
        }
      } catch (storageErr) {
        console.warn("Storage upload warning, using DataURL fallback:", storageErr);
      }

      // 3. Use DataURL fallback if storage upload wasn't available
      if (!submissionUrl) {
        submissionUrl = fileDataUrl;
      }

      // 4. Build updated studentMarks object
      const currentMarks = { ...(test.student_marks || test.studentMarks || {}) };
      const updatedMarks = { ...currentMarks };
      const subRecord = {
        submissionUrl,
        fileName: file.name,
        submittedAt: new Date().toISOString(),
        score: currentMarks[studentId]?.score ?? null,
        remarks: currentMarks[studentId]?.remarks || "",
      };

      [studentProfile?.id, studentProfile?.student_id, studentProfile?.name, studentProfile?.email, studentId].forEach((key) => {
        if (key) {
          updatedMarks[key] = {
            ...(currentMarks[key] || {}),
            ...subRecord,
          };
        }
      });

      // 5. Update database
      try {
        await adminService.updateWeeklyTest(test.id, {
          studentMarks: updatedMarks,
        });
      } catch (dbErr) {
        console.warn("Database weekly test update warning:", dbErr);
      }

      // 6. Update local storage
      try {
        const raw = localStorage.getItem("gw_weeklytests_v4");
        const localTests = raw ? JSON.parse(raw) : [];
        const updatedLocal = localTests.map((t) =>
          String(t.id) === String(test.id)
            ? { ...t, studentMarks: updatedMarks, student_marks: updatedMarks }
            : t
        );
        localStorage.setItem("gw_weeklytests_v4", JSON.stringify(updatedLocal));
      } catch (e) {}

      // 7. Dispatch notifications
      const rawTeacher = (studentProfile?.assignedTeachers?.[0] || "Mr. Rajesh")
        .toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.)\s*/, "")
        .trim();

      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      try {
        await supabase.from("notifications").insert({
          type: `test-submission:${rawTeacher}:${test.id}:${studentProfile.id}`,
          message: `${studentProfile.name} submitted test paper '${test.title}' (${test.subject})`,
          time: currentTime,
        });
      } catch (nErr) {
        console.error("Failed to insert test submission notification:", nErr);
      }

      try {
        await supabase.from("notifications").insert({
          type: `test-submitted:${studentProfile.id}`,
          message: `You successfully submitted your answer sheet for "${test.title}" (${test.subject}). Your teacher will grade it soon.`,
          time: currentTime,
        });
      } catch (nErr) {
        console.error("Failed to insert student self-notification:", nErr);
      }

      setTestSubmissions((prev) => ({ ...prev, [test.id]: { uploading: false, url: submissionUrl } }));
      // Refresh the test list
      setWeeklyTests((prev) =>
        prev.map((t) => (String(t.id) === String(test.id) ? { ...t, studentMarks: updatedMarks, student_marks: updatedMarks } : t))
      );
      showToast("Answer sheet submitted successfully!", "success");
    } catch (err) {
      console.error("Submission failed:", err);
      setTestSubmissions((prev) => ({ ...prev, [test.id]: { uploading: false, url: null } }));
      showToast("Submission failed. Please try again.", "error");
    }
  };

  const filteredWeeklyTests = weeklyTests.filter((test) => {
    const title = test.title || "";
    const subject = test.subject || "";
    const matchesSearch =
      title.toLowerCase().includes(testSearch.toLowerCase()) ||
      subject.toLowerCase().includes(testSearch.toLowerCase());
    const matchesSubject =
      testSubject === "All Subjects" ||
      subject.toLowerCase().trim() === testSubject.toLowerCase().trim() ||
      subject.toLowerCase().includes(testSubject.toLowerCase()) ||
      testSubject.toLowerCase().includes(subject.toLowerCase());
    return matchesSearch && matchesSubject;
  });


  const [onlineClassSearch, setOnlineClassSearch] = useState("");
  const [onlineClassSubject, setOnlineClassSubject] = useState("All Subjects");
  const [onlineClassStatus, setOnlineClassStatus] = useState("All Status");
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [activeStudentLiveCall, setActiveStudentLiveCall] = useState(null);
  const [studentMic, setStudentMic] = useState(true);
  const [studentVideo, setStudentVideo] = useState(true);
  const [teacherLiveState, setTeacherLiveState] = useState({
    isOnline: false,
    videoActive: true,
    micActive: true,
    isScreenSharing: false,
    teacherName: "",
  });
  const studentVideoRef = useRef(null);
  const studentChannelRef = useRef(null);

  // BroadcastChannel signaling for student during live class
  useEffect(() => {
    if (!activeStudentLiveCall) {
      if (studentChannelRef.current) {
        studentChannelRef.current.close();
        studentChannelRef.current = null;
      }
      setTeacherLiveState({ isOnline: false, videoActive: true, micActive: true, isScreenSharing: false, teacherName: "" });
      return;
    }

    const sId = studentProfile?.id || studentProfile?.email || "student_1";
    const sName = studentProfile?.name || "Student";

    try {
      const channel = new BroadcastChannel(`growise_live_class_${activeStudentLiveCall.id}`);
      studentChannelRef.current = channel;

      const handleChannelMessage = (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === "TEACHER_STATE") {
          setTeacherLiveState({
            isOnline: true,
            videoActive: data.videoActive ?? true,
            micActive: data.micActive ?? true,
            isScreenSharing: data.isScreenSharing ?? false,
            teacherName: data.teacherName || activeStudentLiveCall.teacher || "Teacher",
          });
        }
      };

      channel.addEventListener("message", handleChannelMessage);

      // Send student join signal & heartbeat
      const sendStudentHeartbeat = () => {
        if (channel) {
          channel.postMessage({
            type: "STUDENT_HEARTBEAT",
            studentId: sId,
            studentName: sName,
            videoActive: studentVideo,
            micActive: studentMic,
            timestamp: Date.now(),
          });
        }
      };

      sendStudentHeartbeat();
      const heartbeatInterval = setInterval(sendStudentHeartbeat, 1000);

      return () => {
        clearInterval(heartbeatInterval);
        channel.removeEventListener("message", handleChannelMessage);
        channel.close();
        studentChannelRef.current = null;
      };
    } catch (e) {
      console.warn("Student BroadcastChannel error:", e);
    }
  }, [activeStudentLiveCall, studentProfile, studentVideo, studentMic]);

  // Fetch online classes from Supabase & LocalStorage with real-time updates
  useEffect(() => {
    let active = true;

    const fetchClasses = async () => {
      try {
        // 1. Fetch from Supabase
        const { data: dbData, error } = await supabase
          .from("online_classes")
          .select("*")
          .order("created_at", { ascending: false });

        let dbClasses = [];
        if (!error && dbData) {
          dbClasses = dbData.map((c) => {
            let batchId = c.student || c.batch_id || c.batchId || "";
            try {
              if (c.description && typeof c.description === "string" && c.description.startsWith("{")) {
                const meta = JSON.parse(c.description);
                if (meta.batchId) batchId = meta.batchId;
              }
            } catch (e) {}
            return {
              id: c.id,
              title: c.title,
              subject: c.subject,
              teacher: c.teacher,
              student: c.student,
              batchId: batchId,
              date: c.date,
              time: c.time,
              status: c.status || "upcoming",
              image: c.image,
            };
          });
        }

        // 2. Sync with LocalStorage
        let localClasses = [];
        if (!error && dbClasses.length === 0) {
          try {
            localStorage.setItem("gw_classes_v3", "[]");
          } catch (e) {}
        } else {
          try {
            const raw = localStorage.getItem("gw_classes_v3");
            if (raw) localClasses = JSON.parse(raw);
          } catch (e) {}
        }

        const mergedMap = new Map();
        dbClasses.forEach((c) => mergedMap.set(String(c.id), c));
        localClasses.forEach((c) => {
          if (!mergedMap.has(String(c.id))) {
            mergedMap.set(String(c.id), c);
          }
        });

        const allClasses = Array.from(mergedMap.values());

        // Remove any potential duplicates based on id
        const uniqueClasses = Array.from(
          new Map(allClasses.map(c => [c.id, c])).values()
        );

        // Filter classes for this student's batch
        if (!studentProfile) {
          if (active) {
            setOnlineClasses(uniqueClasses);
          }
          return;
        }

        const studentBatchName = (studentProfile?.batchName || studentProfile?.batch || "").trim().toLowerCase();
        const studentBatchId = String(studentProfile?.batch_id || studentProfile?.batchId || "").trim().toLowerCase();
        const studentSubjs = (studentProfile?.subjects || []).map((s) => String(s).toLowerCase());
        const studentTeacher = (studentProfile?.teacherName || studentProfile?.teacher || "").trim().toLowerCase();

        const myClasses = uniqueClasses.filter((c) => {
          if (!c) return false;
          
          const classBatchId = String(c.batchId || c.batch_id || "").trim().toLowerCase();
          const classBatchName = String(c.student || c.batch || "").trim().toLowerCase();
          const classSubject = String(c.subject || "").trim().toLowerCase();
          const classTeacher = String(c.teacher || "").trim().toLowerCase();

          // 1. If student profile has no batch specified, show all scheduled classes
          if (!studentBatchId && !studentBatchName && studentSubjs.length === 0) {
            return true;
          }

          // 2. Strict batch ID match
          if (studentBatchId && classBatchId && (studentBatchId === classBatchId || classBatchId.includes(studentBatchId))) {
            return true;
          }

          // 3. Batch name match
          if (studentBatchName && classBatchName) {
            if (studentBatchName === classBatchName || 
                classBatchName.includes(studentBatchName) || 
                studentBatchName.includes(classBatchName)) {
              return true;
            }
          }

          // 4. Subject or Teacher match
          if (classSubject && studentSubjs.length > 0 && studentSubjs.includes(classSubject)) {
            return true;
          }

          if (classTeacher && studentTeacher && (classTeacher === studentTeacher || classTeacher.includes(studentTeacher))) {
            return true;
          }

          // 5. Allow general or unassigned classes
          if (!classBatchId || classBatchId === "all" || classBatchId === "general") {
            return true;
          }

          return true; // default fallback so no scheduled class is hidden from enrolled students
        });

        if (active) {
          setOnlineClasses(myClasses.length > 0 ? myClasses : uniqueClasses);
        }
      } catch (err) {
        console.warn("Could not fetch student online classes:", err);
      }
    };

    fetchClasses();

    // Subscribe to real-time online_classes changes and local storage changes
    const classesChannel = supabase
      .channel("student-online-classes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "online_classes" }, () => {
        if (active) fetchClasses();
      })
      .subscribe();

    const handleStorageChange = () => {
      if (active) fetchClasses();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      active = false;
      window.removeEventListener("storage", handleStorageChange);
      supabase.removeChannel(classesChannel);
    };
  }, [studentProfile]);

  // Handle student local media stream during live meet
  useEffect(() => {
    let stream = null;
    if (activeStudentLiveCall && studentVideo) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: studentMic })
        .then((s) => {
          stream = s;
          if (studentVideoRef.current) {
            studentVideoRef.current.srcObject = s;
            studentVideoRef.current.play().catch(() => { });
          }
        })
        .catch((err) => console.warn("Student media access:", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [activeStudentLiveCall, studentVideo, studentMic]);

  const filteredOnlineClasses = onlineClasses.filter((item) => {
    const title = item.title || "";
    const desc = item.description || "";
    const subj = item.subject || "";
    const status = item.status || "upcoming";

    const matchesSearch = title.toLowerCase().includes(onlineClassSearch.toLowerCase()) ||
      desc.toLowerCase().includes(onlineClassSearch.toLowerCase()) ||
      subj.toLowerCase().includes(onlineClassSearch.toLowerCase());
    const matchesSubject = onlineClassSubject === "All Subjects" || subj === onlineClassSubject;
    const matchesStatus = onlineClassStatus === "All Status" || status.toLowerCase() === onlineClassStatus.toLowerCase() || (onlineClassStatus === "Live Now" && status.toLowerCase() === "live");
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Handle student joining online class - record attendance
  const handleJoinClass = async (cls) => {
    if (!cls || !studentProfile) {
      setActiveStudentLiveCall(cls);
      return;
    }

    const studentId = studentProfile.id || studentProfile.email;
    const studentName = studentProfile.name || "Student";
    const classId = cls.id;

    console.log(`🎓 Student ${studentName} (${studentId}) joining class ${classId}...`);

    try {
      // Record attendance as Present when joining
      const result = await adminService.recordStudentJoinClass(classId, studentId, studentName);
      
      if (result.success) {
        console.log(`✅ Attendance recorded for ${studentName}`);
        setActiveStudentLiveCall(cls);
      } else {
        console.warn("⚠️ Could not record attendance:", result.error);
        // Still allow joining even if attendance recording fails
        setActiveStudentLiveCall(cls);
        alert("You've joined the class, but there was an issue recording your attendance. Please inform your teacher.");
      }
    } catch (error) {
      console.error("Error joining class:", error);
      // Still allow joining
      setActiveStudentLiveCall(cls);
    }
  };

  // Handle student leaving online class
  const handleLeaveClass = () => {
    if (activeStudentLiveCall && studentProfile) {
      const studentId = studentProfile.id || studentProfile.email;
      const classId = activeStudentLiveCall.id;
      
      console.log(`👋 Student ${studentProfile.name} leaving class ${classId}`);
      // Note: Duration calculation will be done when teacher ends the class
    }
    
    setActiveStudentLiveCall(null);
  };

  const [activePerformanceSubject, setActivePerformanceSubject] = useState("Mathematics");

  const [performanceData, setPerformanceData] = useState([
    {
      subject: "Mathematics",
      progress: 90,
      grade: "A",
      topicsCovered: [
        "Algebraic Equations",
        "Complex Numbers & Quadratic Formulations",
        "Matrices & Determinants",
        "Calculus & Functions"
      ],
      tests: [
        { name: "Maths-Algebra Test", score: "18 / 20 (90%)", status: "Passed", badgeClass: "passed" }
      ],
      assignments: [
        { name: "Algebra Worksheet", score: "18 / 20", status: "Evaluated", badgeClass: "evaluated" },
        { name: "Calculus Practice", score: "20 / 20", status: "Evaluated", badgeClass: "evaluated" }
      ]
    },
    {
      subject: "Physics",
      progress: 80,
      grade: "A-",
      topicsCovered: [
        "Newtonian Mechanics",
        "Electrostatics",
        "Thermal Dynamics",
        "Quantum Physics Fundamentals & Wave Optics"
      ],
      tests: [
        { name: "Physics-Quantum Mechanics Test", score: "16 / 20 (80%)", status: "Passed", badgeClass: "passed" }
      ],
      assignments: [
        { name: "Quantum Mechanics Homework", score: "18 / 20", status: "Evaluated", badgeClass: "evaluated" },
        { name: "Optics Assignment", score: "--", status: "Pending", badgeClass: "pending" }
      ]
    },
    {
      subject: "Chemistry",
      progress: 65,
      grade: "B",
      topicsCovered: [
        "Chemical Bonding & Periodic Properties",
        "Aldehydes, Ketones & Carboxylic Acids"
      ],
      tests: [
        { name: "Chemistry-Aldehydes Test", score: "Grading In Progress", status: "Result Pending", badgeClass: "pending" }
      ],
      assignments: [
        { name: "Organic Chemistry Revision", score: "Submitted", status: "Grading Pending", badgeClass: "submitted" },
        { name: "Hydrocarbons Worksheet", score: "Overdue", status: "Overdue", badgeClass: "overdue" }
      ]
    }
  ]);

  const [assignments, setAssignments] = useState([]);

  const [submitModalAsgn, setSubmitModalAsgn] = useState(null);
  const [submitNotes, setSubmitNotes] = useState("");
  const [studentFileName, setStudentFileName] = useState("");
  const [studentFileUrl, setStudentFileUrl] = useState("");
  const studentFileRef = useRef(null);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let active = true;
    const fetchAssignments = async () => {
      try {
        const { data, error } = await supabase
          .from("assignments")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && active) {
          const studentBatch = String(studentProfile?.batchId || studentProfile?.batch_id || studentProfile?.batch || "").trim().toLowerCase();
          const studentBatchName = String(studentProfile?.batchName || "").trim().toLowerCase();
          const studentSubjects = (studentProfile?.subjects || []).map(s => String(s).toLowerCase().trim());
          const sId = String(studentProfile?.id || studentProfile?.student_id || "").trim().toLowerCase();
          const sName = String(studentProfile?.name || "").trim().toLowerCase();

          const parsed = data
            .filter(row => {
              if (!row) return false;
              const rowBatch = String(row.batch_id || row.batchId || "").trim().toLowerCase();
              const rowSubject = String(row.subject || "").trim().toLowerCase();
              const rowStudent = String(row.student || "").trim().toLowerCase();

              // If targeted to a specific student
              if (rowStudent && rowStudent !== "all" && rowStudent !== "all batches" && rowStudent !== "") {
                const matchesStudent = (sId && rowStudent === sId) || (sName && rowStudent === sName);
                if (matchesStudent) return true;
              }

              // Global / All batches
              if (!rowBatch || rowBatch === "all" || rowBatch === "all batches" || rowBatch === "bat102") return true;

              // Match by batch id or batch name
              if (studentBatch && (rowBatch === studentBatch || rowBatch.includes(studentBatch) || studentBatch.includes(rowBatch))) return true;
              if (studentBatchName && (rowBatch === studentBatchName || rowBatch.includes(studentBatchName) || studentBatchName.includes(rowBatch))) return true;

              // Match by subject
              if (rowSubject && (studentSubjects.length === 0 || studentSubjects.some(sub => rowSubject === sub || rowSubject.includes(sub) || sub.includes(rowSubject)))) return true;

              // Fallback: show rather than hiding
              return true;
            })
            .map(row => {
              let parsedDesc = {};
              try {
                if (row.description && typeof row.description === "string" && row.description.startsWith("{")) {
                  parsedDesc = JSON.parse(row.description);
                }
              } catch (e) { }

              const submissionsList = parsedDesc.submissions || [];
              const mySub = submissionsList.find(sub => {
                const subId = String(sub.studentId || sub.id || "").toLowerCase().trim();
                const subName = String(sub.name || "").toLowerCase().trim();
                return (sId && subId === sId) || (sName && subName === sName);
              });

              let uiStatus = "Pending";
              let uiScore = "";
              let uiRemarks = "";
              if (mySub) {
                if (mySub.status === "reviewed") {
                  uiStatus = "Evaluated";
                  uiScore = `${mySub.score} / ${row.total_marks || 20}`;
                  uiRemarks = mySub.remarks || "";
                } else if (mySub.status === "submitted") {
                  uiStatus = "Submitted";
                } else if (mySub.status === "missing") {
                  uiStatus = "Overdue";
                }
              }

              return {
                id: row.id,
                subject: row.subject,
                status: uiStatus,
                title: row.title,
                description: parsedDesc.description || row.description || "",
                attachmentName: parsedDesc.attachmentName || "",
                attachmentUrl: parsedDesc.attachmentUrl || "",
                assignedDate: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                dueDate: row.due_date,
                score: uiScore,
                teacherRemarks: uiRemarks,
                rawSubmissions: submissionsList
              };
            });
          setAssignments(parsed);
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };

    if (studentProfile) {
      fetchAssignments();
    }

    // Real-time listener for assignments changes
    const channel = supabase
      .channel("student-assignments-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "assignments" }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [studentProfile]);

  const handleStudentSubmissionSubmit = async () => {
    if (!submitModalAsgn) return;

    try {
      const sId = studentProfile?.id || studentProfile?.student_id || "s1";
      const sName = studentProfile?.name || "Student";

      const newSubmissionEntry = {
        studentId: sId,
        name: sName,
        rollNo: studentProfile?.rollNo || studentProfile?.contact || "—",
        avatar: null,
        submittedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: null,
        status: "submitted",
        description: submitNotes,
        attachmentName: studentFileName,
        attachmentUrl: studentFileUrl
      };

      const prevSubs = submitModalAsgn.rawSubmissions || [];
      let found = false;
      const updatedSubmissions = prevSubs.map(sub => {
        const subId = String(sub.studentId || sub.id || "").toLowerCase().trim();
        const subName = String(sub.name || "").toLowerCase().trim();
        if ((sId && subId === String(sId).toLowerCase().trim()) || (sName && subName === String(sName).toLowerCase().trim())) {
          found = true;
          return { ...sub, ...newSubmissionEntry };
        }
        return sub;
      });

      if (!found) {
        updatedSubmissions.push(newSubmissionEntry);
      }

      const payload = {
        description: JSON.stringify({
          description: submitModalAsgn.description,
          attachmentName: submitModalAsgn.attachmentName || "",
          attachmentUrl: submitModalAsgn.attachmentUrl || "",
          submissions: updatedSubmissions
        })
      };

      await supabase
        .from("assignments")
        .update(payload)
        .eq("id", submitModalAsgn.id);

      // Create notification for the teacher
      const rawTeacher = (studentProfile?.assignedTeachers?.[0] || "Mr. Rajesh")
        .toLowerCase()
        .replace(/^(mr\.|mrs\.|ms\.)\s*/, "")
        .trim();

      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      try {
        await supabase.from("notifications").insert({
          type: `submission:${rawTeacher}:${submitModalAsgn.id}:${sId}`,
          message: `${sName} submitted assignment '${submitModalAsgn.title}' (${submitModalAsgn.subject})`,
          time: currentTime,
        });
      } catch (nErr) {
        console.error("Failed to insert student submission notification:", nErr);
      }

      setAssignments(prev => prev.map(item => {
        if (item.id === submitModalAsgn.id) {
          return {
            ...item,
            status: "Submitted",
            rawSubmissions: updatedSubmissions
          };
        }
        return item;
      }));

      try {
        const rawAsgns = localStorage.getItem("gw_assignments_v2");
        const parsedAsgns = rawAsgns ? JSON.parse(rawAsgns) : [];
        const updatedLocalAsgns = parsedAsgns.map(a => {
          if (String(a.id) === String(submitModalAsgn.id)) {
            return {
              ...a,
              submissions: updatedSubmissions
            };
          }
          return a;
        });
        localStorage.setItem("gw_assignments_v2", JSON.stringify(updatedLocalAsgns));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}

      showToast("Assignment submitted successfully!");
      setSubmitModalAsgn(null);
      setSubmitNotes("");
      setStudentFileName("");
      setStudentFileUrl("");
    } catch (err) {
      console.error("Failed to submit student assignment:", err);
      showToast("Failed to submit assignment. Please try again.", "error");
    }
  };

  const filteredAssignments = assignments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      item.subject.toLowerCase().includes(assignmentSearch.toLowerCase());
    const matchesSubject = assignmentSubject === "All Subjects" || item.subject === assignmentSubject;
    const matchesStatus = assignmentStatus === "All Status" || item.status === assignmentStatus;
    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleSubmitAssignmentAction = (asgn) => {
    setSubmitModalAsgn(asgn);
  };

  const handleViewAssignmentDetails = (asgn) => {
    setActiveDetailsAssignment(asgn);
  };

  const attendanceHistory = attendanceLogs;

  const filteredHistory = attendanceHistory.filter((record) => {
    return historyFilter === "All Subjects" || record.subject === historyFilter;
  });

  const totalLogs = attendanceLogs.length;
  const presentLogsCount = attendanceLogs.filter(log => {
    const statusLower = log.status?.toLowerCase();
    return statusLower === "present" || statusLower === "late";
  }).length;
  const overallPercentage = totalLogs > 0 ? Math.round((presentLogsCount / totalLogs) * 100) : 0;

  const subjectsList = Array.from(new Set([
    ...(Array.isArray(studentProfile?.subjects) ? studentProfile.subjects : []),
    ...attendanceLogs.map(l => l.subject).filter(Boolean)
  ]));

  const subjectAttendance = subjectsList.map(subjectName => {
    const logsForSubject = attendanceLogs.filter(l => l.subject === subjectName);
    const totalForSubject = logsForSubject.length;
    const presentForSubject = logsForSubject.filter(log => {
      const statusLower = log.status?.toLowerCase();
      return statusLower === "present" || statusLower === "late";
    }).length;
    const rateForSubject = totalForSubject > 0 ? Math.round((presentForSubject / totalForSubject) * 100) : 100;

    const firstLogWithTeacher = logsForSubject.find(l => l.teacher);
    const teacherName = firstLogWithTeacher?.teacher || "TBD";

    return {
      subject: subjectName,
      total: totalForSubject,
      present: presentForSubject,
      rate: rateForSubject,
      teacher: teacherName
    };
  });

  const [notificationSearch, setNotificationSearch] = useState("");
  const [notificationFilter, setNotificationFilter] = useState("All");

  const [notificationsList, setNotificationsList] = useState([]);

  // Fetch real-time student notifications from Supabase table
  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .order("id", { ascending: false });

        if (!error && data && active) {
          const dbNotifs = data.map((n) => {
            const rawType = n.type || "study-material";
            const uiType = rawType.includes(":") ? rawType.split(":")[0] : rawType;
            return {
              id: n.id + 100, // offset id to prevent collisions
              type: uiType,
              rawType: rawType,
              title: n.message,
              time: n.time || "Just Now",
              group: "TODAY",
              detail: "",
              unread: true
            };
          });

          const studentSubjects = studentProfile?.subjects || [];
          const assignedTeachers = studentProfile?.assignedTeachers || [];

          const filteredDbNotifs = dbNotifs.filter((notif) => {
            // Block teacher-side submission notifications
            if (notif.rawType && notif.rawType.startsWith("submission:")) {
              return false;
            }

            // Block test-submission notifications meant for the teacher
            if (notif.rawType && notif.rawType.startsWith("test-submission:")) {
              return false;
            }

            // Allow student's own submission confirmation
            if (notif.rawType && notif.rawType.startsWith("test-submitted:")) {
              const notifStudentId = notif.rawType.split(":")[1];
              return (
                String(notifStudentId) === String(studentProfile.id) ||
                String(notifStudentId) === String(studentProfile.student_id)
              );
            }

            // Allow graded assignment result for this student
            if (notif.rawType && notif.rawType.startsWith("graded:")) {
              const notifStudentId = notif.rawType.split(":")[1];
              return (
                String(notifStudentId) === String(studentProfile.id) ||
                String(notifStudentId) === String(studentProfile.student_id)
              );
            }

            // Allow test result for this student
            if (notif.rawType && notif.rawType.startsWith("test-result:")) {
              const notifStudentId = notif.rawType.split(":")[1];
              return (
                String(notifStudentId) === String(studentProfile.id) ||
                String(notifStudentId) === String(studentProfile.student_id)
              );
            }

            // Weekly test announcements and batch notifications
            if (
              notif.rawType === "weekly-test" ||
              notif.rawType?.startsWith("weekly-test") ||
              notif.rawType === "batch"
            ) {
              const match = notif.title?.match(/\(([^)]+)\)/);
              if (match) {
                const notifSubject = match[1].toLowerCase().trim();
                if (studentSubjects.length > 0) {
                  return studentSubjects.some((sub) => {
                    if (!sub) return false;
                    const s = sub.toLowerCase().trim();
                    return s === notifSubject || notifSubject.includes(s) || s.includes(notifSubject);
                  });
                }
              }
              return true;
            }

            // Standard subject-based matching
            if (!notif.title) return false;
            const match = notif.title.match(/\(([^)]+)\)/);
            if (!match) return true;
            const notifSubject = match[1].toLowerCase().trim();
            if (studentSubjects.length === 0) return true;
            return studentSubjects.some((sub) => {
              if (!sub) return false;
              const s = sub.toLowerCase().trim();
              return s === notifSubject || notifSubject.includes(s) || s.includes(notifSubject);
            });
          });

          setNotificationsList((prev) => {
            const filteredPrev = prev.filter(p => p.id < 100);
            return [...filteredDbNotifs, ...filteredPrev];
          });
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    if (studentProfile) {
      fetchNotifications();
    }

    // Subscribe to new notifications
    const channel = supabase
      .channel("student-notifications-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        if (payload.new && active) {
          const studentSubjects = studentProfile?.subjects || [];
          const rawType = payload.new.type || "study-material";

          if (rawType.startsWith("submission:")) return;
          if (rawType.startsWith("test-submission:")) return;

          let isNotificationForMe = false;

          if (rawType.startsWith("test-submitted:")) {
            const notifStudentId = rawType.split(":")[1];
            isNotificationForMe =
              String(notifStudentId) === String(studentProfile.id) ||
              String(notifStudentId) === String(studentProfile.student_id);
          } else if (rawType.startsWith("graded:") || rawType.startsWith("test-result:")) {
            const notifStudentId = rawType.split(":")[1];
            isNotificationForMe =
              String(notifStudentId) === String(studentProfile.id) ||
              String(notifStudentId) === String(studentProfile.student_id);
          } else if (rawType === "weekly-test" || rawType.startsWith("weekly-test") || rawType === "batch") {
            const match = payload.new.message?.match(/\(([^)]+)\)/);
            if (match && studentSubjects.length > 0) {
              const notifSubject = match[1].toLowerCase().trim();
              isNotificationForMe = studentSubjects.some((sub) => {
                if (!sub) return false;
                const s = sub.toLowerCase().trim();
                return s === notifSubject || notifSubject.includes(s) || s.includes(notifSubject);
              });
            } else {
              isNotificationForMe = true;
            }
          } else {
            const match = payload.new.message?.match(/\(([^)]+)\)/);
            if (match && studentSubjects.length > 0) {
              const notifSubject = match[1].toLowerCase().trim();
              isNotificationForMe = studentSubjects.some((sub) => {
                if (!sub) return false;
                const s = sub.toLowerCase().trim();
                return s === notifSubject || notifSubject.includes(s) || s.includes(notifSubject);
              });
            } else {
              isNotificationForMe = true;
            }
          }

          if (isNotificationForMe) {
            const uiType = rawType.includes(":") ? rawType.split(":")[0] : rawType;
            const newNotif = {
              id: payload.new.id + 100,
              type: uiType,
              title: payload.new.message,
              time: payload.new.time || "Just Now",
              group: "TODAY",
              detail: "",
              unread: true
            };
            setNotificationsList((prev) => [newNotif, ...prev]);
          }
        }
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [studentProfile]);

  const [allMaterialsList, setAllMaterialsList] = useState(() => {
    try {
      const stored = localStorage.getItem("gw_materials_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [studyMaterialSearch, setStudyMaterialSearch] = useState("");
  const [studyMaterialSubject, setStudyMaterialSubject] = useState("All");
  const [studyMaterialScope, setStudyMaterialScope] = useState("All");
  const [previewMaterial, setPreviewMaterial] = useState(null);

  // Fetch materials dynamically from Supabase & localStorage and sync real-time
  useEffect(() => {
    let active = true;

    const fetchMaterials = async () => {
      let supabaseMaterials = [];
      try {
        const { data, error } = await supabase
          .from("materials")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data && active) {
          supabaseMaterials = data.map((row) => {
            try {
              if (row.title && typeof row.title === "string" && row.title.startsWith("{")) {
                const parsedTitle = JSON.parse(row.title);
                return {
                  id: row.id,
                  subject: row.subject || parsedTitle.subject || "General",
                  teacher: row.teacher || parsedTitle.teacher || "Teacher",
                  flagged: row.flagged,
                  created_at: row.created_at,
                  ...parsedTitle,
                };
              }
            } catch (e) {}
            return {
              id: row.id,
              title: row.title || "Study Material",
              subject: row.subject || "General",
              teacher: row.teacher || "Teacher",
              flagged: row.flagged,
              uploadDate: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
              fileType: "pdf",
              fileName: row.title || "material.pdf",
              fileSize: "1.2 MB",
              description: "Course study material.",
              batch: "All Batches",
              grade: "All Grades",
              downloads: 0,
            };
          });
        }
      } catch (err) {
        console.error("Error fetching study materials from Supabase:", err);
      }

      // Read localStorage backup
      let localList = [];
      try {
        const raw = localStorage.getItem("gw_materials_v2");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) localList = parsed;
        }
      } catch (e) {}

      if (!active) return;

      // Merge Supabase and LocalStorage without duplicates
      const map = new Map();
      supabaseMaterials.forEach((m) => {
        if (m && m.id) map.set(String(m.id), m);
      });
      localList.forEach((m) => {
        if (m && m.id && !map.has(String(m.id))) {
          map.set(String(m.id), m);
        }
      });

      const merged = Array.from(map.values());
      setAllMaterialsList(merged);
    };

    fetchMaterials();

    // Subscribe to real-time changes in materials table
    const materialsChannel = supabase
      .channel("student-materials-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "materials" }, () => {
        fetchMaterials();
      })
      .subscribe();

    // Listen to localStorage updates across tabs
    const handleStorageChange = (e) => {
      if (e.key === "gw_materials_v2") {
        fetchMaterials();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      active = false;
      supabase.removeChannel(materialsChannel);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Filtered materials based on user search, subject pills, and batch scope
  const materialsList = useMemo(() => {
    let list = [...allMaterialsList];

    // Filter by Scope (My Batch vs All)
    if (studyMaterialScope === "My Batch" && studentProfile) {
      const studentBatch = String(studentProfile?.batchId || studentProfile?.batch_id || studentProfile?.batch || "").trim().toLowerCase();
      const studentBatchName = String(studentProfile?.batchName || "").trim().toLowerCase();
      const studentSubjects = (studentProfile?.subjects || []).map(s => String(s).toLowerCase().trim());
      const assignedTeachers = (studentProfile?.assignedTeachers || []).map(t =>
        String(t).toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim()
      );

      list = list.filter(m => {
        if (!m) return false;
        const mBatch = String(m.batch || "").trim().toLowerCase();
        const mSubject = String(m.subject || "").trim().toLowerCase();
        const mTeacher = String(m.teacher || "").toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim();

        if (!mBatch || mBatch === "all batches" || mBatch === "all" || mBatch === "all grades") return true;
        if (studentBatch && (mBatch === studentBatch || mBatch.includes(studentBatch) || studentBatch.includes(mBatch))) return true;
        if (studentBatchName && (mBatch === studentBatchName || mBatch.includes(studentBatchName) || studentBatchName.includes(mBatch))) return true;
        if (mSubject && studentSubjects.some(sub => mSubject === sub || mSubject.includes(sub) || sub.includes(mSubject))) return true;
        if (mTeacher && assignedTeachers.some(t => t && (t === mTeacher || t.includes(mTeacher) || mTeacher.includes(t)))) return true;
        return false;
      });
    }

    // Filter by Subject
    if (studyMaterialSubject !== "All") {
      list = list.filter(m => String(m.subject || "").toLowerCase() === studyMaterialSubject.toLowerCase());
    }

    // Filter by Search Query
    if (studyMaterialSearch.trim()) {
      const q = studyMaterialSearch.toLowerCase();
      list = list.filter(m =>
        String(m.title || "").toLowerCase().includes(q) ||
        String(m.subject || "").toLowerCase().includes(q) ||
        String(m.description || "").toLowerCase().includes(q) ||
        String(m.teacher || "").toLowerCase().includes(q) ||
        String(m.fileName || "").toLowerCase().includes(q) ||
        String(m.batch || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [allMaterialsList, studyMaterialSubject, studyMaterialScope, studyMaterialSearch, studentProfile]);

  const handleDownloadMaterial = (material) => {
    setDownloadProgress(material.id);
    setTimeout(() => {
      setDownloadProgress(null);
      try {
        // Construct file download from base64 if url exists
        if (material.fileUrl && material.fileUrl.startsWith("data:")) {
          const link = document.createElement("a");
          link.href = material.fileUrl;
          link.download = material.fileName || "study_material.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Fallback to text blob
          const blob = new Blob([`Study Material: ${material.title}\nDescription: ${material.description}\nSubject: ${material.subject}`], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${material.fileName || material.title || "material"}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.error("Download failed:", e);
      }
    }, 1500);
  };

  const filteredNotifications = notificationsList.filter((notif) => {
    const matchesSearch = notif.title.toLowerCase().includes(notificationSearch.toLowerCase()) ||
      notif.detail.toLowerCase().includes(notificationSearch.toLowerCase());
    const matchesFilter = notificationFilter === "All" ||
      (notificationFilter === "Unread" && notif.unread);
    return matchesSearch && matchesFilter;
  });

  const handleMarkAllRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadNotifications(false);
  };

  const handleNotificationClick = (notif) => {
    if (!notif) return;
    const raw = (notif.rawType || notif.type || "").toLowerCase();
    const title = (notif.title || "").toLowerCase();

    if (raw.includes("weekly-test") || raw.includes("test-result") || raw.includes("test-") || title.includes("test") || raw.includes("batch")) {
      selectTab("Weekly Tests");
    } else if (raw.includes("assignment") || raw.includes("graded") || title.includes("assignment") || title.includes("homework")) {
      selectTab("Assignments");
    } else if (raw.includes("study-material") || title.includes("material") || title.includes("notes") || title.includes("chapter")) {
      selectTab("Study Materials");
    } else if (raw.includes("class") || title.includes("class") || title.includes("lecture") || title.includes("session")) {
      selectTab("Online Classes");
    }
  };

  const handleDownloadFile = (fileName) => {
    setDownloadProgress(fileName);
    setTimeout(() => {
      setDownloadProgress(null);
      showToast(`Successfully downloaded ${fileName}`);
    }, 1200);
  };

  // Close sidebar on tab change (mobile)
  const selectTab = (tabName) => {
    setActiveTab(tabName);
    setSidebarOpen(false);
  };

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Attendance", icon: CalendarDays },
    { name: "Study Materials", icon: BookOpen },
    { name: "Assignments", icon: ClipboardList },
    { name: "Weekly Tests", icon: FileText },
    { name: "Online Classes", icon: Tv },
    { name: "Performance", icon: BarChart3 },
    { name: "Notifications", icon: Bell },
    { name: "Profile", icon: User },
  ];

  if (loadingProfile) {
    return (
      <div className="dashboard-loading-container" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-primary, #0f172a)",
        color: "var(--text-primary, #f8fafc)",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div className="loading-spinner" style={{
          width: "50px",
          height: "50px",
          border: "5px solid rgba(255,255,255,0.1)",
          borderRadius: "50%",
          borderTopColor: "#3b82f6",
          animation: "spin 1s ease-in-out infinite",
          marginBottom: "20px"
        }}></div>
        <p style={{ fontSize: "1.1rem", fontWeight: "500" }}>Loading your profile...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="dashboard-error-container" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-primary, #0f172a)",
        color: "var(--text-primary, #f8fafc)",
        padding: "20px",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ color: "#ef4444", fontSize: "3rem", marginBottom: "15px" }}>⚠️</div>
        <h2 style={{ marginBottom: "10px" }}>Profile Load Error</h2>
        <p style={{ color: "#94a3b8", marginBottom: "20px", textAlign: "center", maxWidth: "400px" }}>{profileError}</p>
        <button
          onClick={() => onNavigate("login")}
          style={{
            padding: "10px 20px",
            background: "#3b82f6",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${activeTab === "Dashboard" ? "dashboard-tab-active" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => onNavigate("landing")}>
            <img src={logo} alt="GroWise Logo" />
            <span className="logo-text">GroWise</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <li key={item.name}>
                  <button
                    className={`nav-item ${isActive ? "active" : ""}`}
                    onClick={() => selectTab(item.name)}
                  >
                    <IconComponent size={20} className="nav-icon" />
                    <span>{item.name}</span>
                    {item.name === "Notifications" && unreadNotifications && (
                      <span className="nav-badge-dot"></span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={async () => {
            try {
              localStorage.removeItem("gw_logged_student");
              await supabase.auth.signOut();
            } catch (e) {
              console.error("Sign out error:", e);
            }
            onNavigate("landing");
          }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* ── Main Layout ── */}
      <div className="dashboard-main">
        {/* ── Header ── */}
        <header className="dashboard-header">
          <div className="header-left">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1>{activeTab}</h1>
          </div>

          <div className="header-right">
            {/* Notification Bell */}
            <button
              className="notification-bell-btn"
              onClick={() => selectTab("Notifications")}
              aria-label="View notifications"
            >
              <Bell size={22} />
              {unreadNotifications && <span className="bell-badge-dot"></span>}
            </button>

            {/* Profile Info */}
            <div className="header-profile" onClick={() => selectTab("Profile")}>
              <div className="profile-details">
                <span className="profile-name">{studentProfile?.name}</span>
                <span className="profile-id">{studentProfile?.batchName || "No Batch"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content Area (Scrollable) ── */}
        <main className="dashboard-content">
          {activeTab === "Dashboard" && (
            <div className="dashboard-dashboard-view">
              {/* Welcome Section */}
              <section className="welcome-section">
                <h2>Good Morning, {studentProfile?.name || "Student"} 👋</h2>
                <p>Welcome back! Here's your academic progress today.</p>
              </section>

              {/* Summary Cards Grid */}
              <section className="summary-cards-grid">
                {/* Card 1: Next Live Class (Dynamic based on onlineClasses) */}
                {(() => {
                  const nextClass = onlineClasses.find(c => {
                    const s = (c.status || "").toLowerCase();
                    return s === "live" || s === "live now" || s === "upcoming";
                  }) || onlineClasses[0];

                  const isLiveNow = (nextClass?.status || "").toLowerCase().includes("live");

                  return (
                    <div className="summary-card live-class-card">
                      <div className="card-top">
                        <span className="card-badge" style={{ background: isLiveNow ? "#ef4444" : undefined, color: isLiveNow ? "#fff" : undefined }}>
                          {isLiveNow ? "LIVE NOW" : "NEXT LIVE CLASS"}
                        </span>
                        <span className="badge-icon-wrap">
                          <Video size={16} />
                        </span>
                      </div>
                      <div className="card-middle">
                        <h3>{nextClass ? nextClass.title : "No Scheduled Classes"}</h3>
                        <p>{nextClass ? `${nextClass.subject || "Lecture"} · ${nextClass.date || "Today"} ${nextClass.time || ""}` : "Your teacher will schedule upcoming live classes soon."}</p>
                      </div>
                      {nextClass ? (
                        <button className="join-class-btn" onClick={() => handleJoinClass(nextClass)}>
                          Join Class
                        </button>
                      ) : (
                        <button className="join-class-btn" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
                          No Class Scheduled
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Card 2: Attendance */}
                <div className="summary-card clickable-card" onClick={() => selectTab("Attendance")}>
                  <div className="card-top">
                    <span className="card-badge gray">ATTENDANCE</span>
                    <span className="badge-icon-wrap green">
                      <CheckCircle size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">{overallPercentage}%</span>
                    </div>
                    <p className="card-subtitle">{presentLogsCount} Days Present</p>
                  </div>
                </div>

                {/* Card 3: Assignments */}
                <div className="summary-card clickable-card" onClick={() => selectTab("Assignments")} style={{ cursor: "pointer" }}>
                  <div className="card-top">
                    <span className="card-badge gray">ASSIGNMENTS</span>
                    <span className="badge-icon-wrap orange">
                      <AlertTriangle size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">
                        {assignments.filter(a => a.status === "Pending" || a.status === "Overdue").length}{" "}
                        <span className="value-unit">Pending</span>
                      </span>
                    </div>
                    <p className="card-subtitle">
                      {assignments.filter(a => a.status === "Submitted" || a.status === "Evaluated").length} Completed / Evaluated
                    </p>
                  </div>
                </div>

                {/* Card 4: Weekly Test */}
                <div className="summary-card clickable-card" onClick={() => selectTab("Weekly Tests")} style={{ cursor: "pointer" }}>
                  <div className="card-top">
                    <span className="card-badge gray">WEEKLY TEST</span>
                    <span className="badge-icon-wrap blue">
                      <Award size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">
                        {weeklyTests.length > 0 ? weeklyTests.length : "—"}{" "}
                        <span className="value-unit">Active</span>
                      </span>
                    </div>
                    <p className="card-subtitle">
                      {weeklyTests.length > 0 ? `Latest: ${weeklyTests[0]?.subject || "Available"}` : "No tests pending"}
                    </p>
                  </div>
                </div>
              </section>

              {/* Two Column Layout (Chart and Notifications) */}
              <div className="dashboard-split-row">
                {/* Custom HTML/CSS Vertical Bar Chart Card */}
                <section className="chart-card-wrapper">
                  <div className="card-header">
                    <h3>Performance Overview</h3>
                    <div className="chart-legend">
                      <div className="legend-item">
                        <span className="legend-dot green"></span>
                        <span>Math</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot blue"></span>
                        <span>Physics</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-dot orange"></span>
                        <span>Chemistry</span>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container">
                    {/* Y Axis Gridlines */}
                    <div className="chart-y-axis-labels">
                      <span>100%</span>
                      <span>80%</span>
                      <span>60%</span>
                      <span>40%</span>
                      <span>20%</span>
                      <span>0%</span>
                    </div>

                    <div className="chart-bars-area">
                      {/* Gridline bars */}
                      <div className="chart-gridlines">
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                        <div className="gridline"></div>
                      </div>

                      {/* Actual bars */}
                      <div className="student-bars-wrapper">
                        {/* Physics — 89% */}
                        <div className="student-bar-column">
                          <div className="student-bar-track">
                            <div
                              className="student-bar-fill blue-bar"
                              style={{ height: "89%" }}
                              title="Physics: 89%"
                            >
                              <span className="student-bar-tooltip">89%</span>
                            </div>
                          </div>
                          <span className="student-bar-label">Physics</span>
                        </div>

                        {/* Chemistry — 80% */}
                        <div className="student-bar-column">
                          <div className="student-bar-track">
                            <div
                              className="student-bar-fill orange-bar"
                              style={{ height: "80%" }}
                              title="Chemistry: 80%"
                            >
                              <span className="student-bar-tooltip">80%</span>
                            </div>
                          </div>
                          <span className="student-bar-label">Chemistry</span>
                        </div>

                        {/* Mathematics — 90% */}
                        <div className="student-bar-column">
                          <div className="student-bar-track">
                            <div
                              className="student-bar-fill green-bar"
                              style={{ height: "90%" }}
                              title="Mathematics: 90%"
                            >
                              <span className="student-bar-tooltip">90%</span>
                            </div>
                          </div>
                          <span className="student-bar-label">Mathematics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Notifications Panel */}
                <section className="notifications-panel-card">
                  <div className="card-header">
                    <h3>Notifications</h3>
                    <button className="mark-all-read-btn" onClick={handleMarkAllRead}>
                      Mark all read
                    </button>
                  </div>

                  <div className="notifications-list">
                    {notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.unread ? "unread" : ""}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleNotificationClick(notif)}
                        title="Click to view details"
                      >
                        {notif.unread && <span className="unread-marker"></span>}
                        <div className="notification-content">
                          <p className="notification-title">{notif.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Study Materials Section */}
              <section className="study-materials-section-card">
                <div className="card-header">
                  <div className="card-header-left">
                    <h3>Study Materials</h3>
                    <span className="count-pill">{materialsList.length}</span>
                  </div>
                  <button className="view-all-btn" onClick={() => selectTab("Study Materials")}>
                    View All
                  </button>
                </div>

                <div className="materials-list">
                  {materialsList.length === 0 ? (
                    <div className="empty-materials-box">
                      <BookOpen size={32} className="empty-icon" />
                      <p>No study materials uploaded yet.</p>
                    </div>
                  ) : (
                    materialsList.slice(0, 4).map((material) => (
                      <div
                        key={material.id}
                        className="material-item clickable-material-item"
                        onClick={() => setPreviewMaterial(material)}
                        title="Click to preview study material"
                      >
                        <div className="material-left">
                          <div className={`file-icon-wrap ${material.fileType || "pdf"}`}>
                            <span className="file-icon-text">{(material.fileType || "pdf").toUpperCase()}</span>
                          </div>
                          <div className="material-info">
                            <div className="material-title-row">
                              <h4>{material.fileName || material.title}</h4>
                              <span className={`material-sub-tag ${(material.subject || "math").toLowerCase()}`}>
                                {material.subject}
                              </span>
                            </div>
                            <p>
                              {material.teacher ? `By ${material.teacher} • ` : ""}
                              Added: {material.uploadDate} &bull; {material.fileSize || "1.2 MB"}
                            </p>
                          </div>
                        </div>
                        <div className="material-item-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="preview-icon-btn"
                            onClick={() => setPreviewMaterial(material)}
                            title="Preview Material"
                            aria-label={`Preview ${material.fileName || material.title}`}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="download-icon-btn"
                            onClick={() => handleDownloadMaterial(material)}
                            disabled={downloadProgress !== null}
                            title="Download Material"
                            aria-label={`Download ${material.fileName || material.title}`}
                          >
                            {downloadProgress === material.id ? (
                              <span className="download-spinner"></span>
                            ) : (
                              <Download size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "Attendance" && (
            <AttendanceView studentProfile={studentProfile} />
          )}

          {activeTab === "Study Materials" && (
            <div className="study-materials-view-container">
              {/* Header Description */}
              <section className="study-materials-header-section">
                <div className="study-materials-header-left">
                  <h2>Study Materials &amp; Notes</h2>
                  <p>Access and view lecture slides, formula sheets, chapter notes, and study resources uploaded by your teachers.</p>
                </div>
                <div className="study-materials-header-right">
                  <div className="materials-scope-toggle">
                    <button
                      className={`scope-pill-btn ${studyMaterialScope === "All" ? "active" : ""}`}
                      onClick={() => setStudyMaterialScope("All")}
                    >
                      All Materials ({allMaterialsList.length})
                    </button>
                    {studentProfile?.batchName && (
                      <button
                        className={`scope-pill-btn ${studyMaterialScope === "My Batch" ? "active" : ""}`}
                        onClick={() => setStudyMaterialScope("My Batch")}
                      >
                        My Batch ({studentProfile.batchName})
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Filters & Search Row */}
              <section className="study-materials-filters-row">
                <div className="study-materials-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search materials by title, topic, or teacher..."
                    value={studyMaterialSearch}
                    onChange={(e) => setStudyMaterialSearch(e.target.value)}
                  />
                  {studyMaterialSearch && (
                    <button
                      className="clear-search-btn"
                      onClick={() => setStudyMaterialSearch("")}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Subject Filter Pills */}
                <div className="study-materials-subject-pills">
                  {["All", "Mathematics", "Physics", "Chemistry", "Science"].map((sub) => {
                    const count = sub === "All"
                      ? allMaterialsList.length
                      : allMaterialsList.filter(m => String(m.subject || "").toLowerCase() === sub.toLowerCase()).length;
                    return (
                      <button
                        key={sub}
                        className={`sub-filter-pill ${studyMaterialSubject.toLowerCase() === sub.toLowerCase() ? "active" : ""}`}
                        onClick={() => setStudyMaterialSubject(sub)}
                      >
                        <span>{sub}</span>
                        <span className="pill-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Study Materials Cards Grid */}
              <section className="study-materials-grid-container">
                {materialsList.length === 0 ? (
                  <div className="study-materials-empty-state">
                    <BookOpen size={48} className="empty-state-icon" />
                    <h3>No Study Materials Found</h3>
                    <p>
                      {studyMaterialSearch
                        ? `No materials matched "${studyMaterialSearch}". Try searching with different keywords.`
                        : studyMaterialSubject !== "All"
                        ? `No materials uploaded yet for ${studyMaterialSubject}.`
                        : "No study materials have been uploaded by teachers yet."}
                    </p>
                    {(studyMaterialSearch || studyMaterialSubject !== "All" || studyMaterialScope !== "All") && (
                      <button
                        className="reset-filters-btn"
                        onClick={() => {
                          setStudyMaterialSearch("");
                          setStudyMaterialSubject("All");
                          setStudyMaterialScope("All");
                        }}
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="study-materials-grid">
                    {materialsList.map((material) => (
                      <div
                        key={material.id}
                        className="study-material-card"
                        onClick={() => setPreviewMaterial(material)}
                        title="Click to view full study material"
                      >
                        <div className="sm-card-top-row">
                          <div className={`sm-card-type-icon ${material.fileType || "pdf"}`}>
                            <FileText size={22} />
                            <span className="sm-card-type-label">{(material.fileType || "pdf").toUpperCase()}</span>
                          </div>
                          <span className={`sm-subject-badge ${(material.subject || "math").toLowerCase()}`}>
                            {material.subject || "General"}
                          </span>
                        </div>

                        <h3 className="sm-card-title">{material.fileName || material.title}</h3>
                        <p className="sm-card-desc">
                          {material.description || "Comprehensive subject study notes & reference materials."}
                        </p>

                        <div className="sm-card-meta-list">
                          <div className="sm-meta-item">
                            <User size={13} />
                            <span>{material.teacher || "Teacher"}</span>
                          </div>
                          <div className="sm-meta-item">
                            <CalendarDays size={13} />
                            <span>{material.uploadDate}</span>
                          </div>
                          <div className="sm-meta-item">
                            <span className="batch-indicator">{material.batch || "All Batches"}</span>
                          </div>
                        </div>

                        <div className="sm-card-footer-row" onClick={(e) => e.stopPropagation()}>
                          <span className="sm-file-size-tag">{material.fileSize || "1.2 MB"}</span>
                          <div className="sm-card-btn-group">
                            <button
                              className="sm-preview-btn"
                              onClick={() => setPreviewMaterial(material)}
                              title="Preview Material"
                            >
                              <Eye size={15} />
                              <span>View</span>
                            </button>
                            <button
                              className="sm-download-btn"
                              onClick={() => handleDownloadMaterial(material)}
                              disabled={downloadProgress === material.id}
                              title="Download Material"
                            >
                              {downloadProgress === material.id ? (
                                <span className="download-spinner sm"></span>
                              ) : (
                                <Download size={15} />
                              )}
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "Assignments" && (
            <div className="assignments-view-container">
              {/* Header Description */}
              <section className="assignments-header-section">
                <h2>Assignments</h2>
                <p>View, submit, and track assignments for your enrolled subjects.</p>
              </section>

              {/* Filters Row */}
              <section className="assignments-filters-row">
                <div className="assignments-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={assignmentSearch}
                    onChange={(e) => setAssignmentSearch(e.target.value)}
                  />
                </div>
                <div className="assignments-dropdowns">
                  <select
                    value={assignmentSubject}
                    onChange={(e) => setAssignmentSubject(e.target.value)}
                    className="assignments-select-dropdown"
                  >
                    <option value="All Subjects">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                  <select
                    value={assignmentStatus}
                    onChange={(e) => setAssignmentStatus(e.target.value)}
                    className="assignments-select-dropdown"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Evaluated">Evaluated</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Submitted">Submitted</option>
                  </select>
                </div>
              </section>

              {/* Assignments List */}
              <section className="assignments-list-container">
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((asgn) => (
                    <div key={asgn.id} className="assignment-card">
                      <div className="assignment-card-header">
                        <div className="assignment-subject-info">
                          <span className={`status-badge ${asgn.status.toLowerCase()}`}>
                            {asgn.status}
                          </span>
                          <span className="assignment-subject-name">
                            {asgn.subject.toUpperCase()}
                          </span>
                        </div>
                        <div className="assignment-card-actions">
                          {asgn.status === "Pending" && (
                            <>
                              <button
                                className="outline-btn"
                                onClick={() => handleViewAssignmentDetails(asgn)}
                              >
                                View Details
                              </button>
                              <button
                                className="primary-solid-btn"
                                onClick={() => handleSubmitAssignmentAction(asgn)}
                                disabled={submittingId === asgn.id}
                              >
                                {submittingId === asgn.id ? (
                                  <span className="btn-spinner"></span>
                                ) : (
                                  "Submit Assignment"
                                )}
                              </button>
                            </>
                          )}

                          {asgn.status === "Overdue" && (
                            <button
                              className="primary-solid-btn"
                              onClick={() => handleSubmitAssignmentAction(asgn)}
                              disabled={submittingId === asgn.id}
                            >
                              {submittingId === asgn.id ? (
                                <span className="btn-spinner"></span>
                              ) : (
                                "Submit Late"
                              )}
                            </button>
                          )}
                          {asgn.status === "Submitted" && (
                            <button className="outline-btn" disabled>
                              Submitted
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="assignment-card-body">
                        <div className="assignment-title-row">
                          <h4>{asgn.title}</h4>
                          {asgn.score && (
                            <span className="assignment-score-badge">{asgn.score}</span>
                          )}
                        </div>

                        {asgn.description && (
                          <p className="assignment-desc">{asgn.description}</p>
                        )}

                        {asgn.attachmentUrl && (
                          <div style={{ marginTop: "12px" }}>
                            <a
                              href={asgn.attachmentUrl}
                              download={asgn.attachmentName || "assignment_document.pdf"}
                              className="outline-btn"
                              style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "13px", padding: "6px 12px" }}
                            >
                              <Download size={14} /> Download PDF ({asgn.attachmentName})
                            </a>
                          </div>
                        )}

                        {asgn.teacherRemarks && (
                          <div className="teacher-remarks-box">
                            <h5>TEACHER REMARKS</h5>
                            <p>"{asgn.teacherRemarks}"</p>
                          </div>
                        )}
                      </div>

                      <div className="assignment-card-footer">
                        {asgn.assignedDate && asgn.dueDate && (
                          <div className="assignment-dates-wrap">
                            <span className="date-item">
                              <CalendarDays size={14} className="date-icon" />
                              Assigned: {asgn.assignedDate}
                            </span>
                            <span className="date-item due">
                              <CalendarDays size={14} className="date-icon due-icon" />
                              Due: {asgn.dueDate}
                            </span>
                          </div>
                        )}
                        {asgn.missedDeadline && (
                          <span className="deadline-missed-alert">
                            <AlertTriangle size={14} className="warning-icon" />
                            Missed Deadline: {asgn.missedDeadline}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-assignments-card">
                    <p>No assignments found matching criteria.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "Weekly Tests" && (
            <div className="weekly-tests-view-container">
              <section className="tests-header-section">
                <h2>Weekly Tests</h2>
                <p>View your weekly test results and track your academic performance.</p>
              </section>

              <section className="tests-filters-row">
                <div className="tests-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search weekly tests..."
                    value={testSearch}
                    onChange={(e) => setTestSearch(e.target.value)}
                  />
                </div>
                <div className="tests-dropdowns">
                  <span className="filter-label">Filter by Subject:</span>
                  <select
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    className="tests-select-dropdown"
                  >
                    <option value="All Subjects">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>
              </section>

              <section className="tests-list-container">
                {weeklyTestsLoading ? (
                  <div className="no-tests-card" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading tests...
                  </div>
                ) : filteredWeeklyTests.length > 0 ? (
                  filteredWeeklyTests.map((test) => {
                    const subject = test.subject || "";
                    const title = test.title || "Untitled Test";
                    const status = test.status || "Result Pending";
                    const maxScore = test.max_score || test.maxScore || 20;
                    const testPdfUrl = test.test_pdf_url || test.testPdfUrl;

                    // Find this student's marks from the JSONB column with multi-field lookup
                    const allMarks = test.student_marks || test.studentMarks || {};
                    let studentMark =
                      allMarks[studentProfile?.id] ||
                      allMarks[String(studentProfile?.id)] ||
                      allMarks[studentProfile?.student_id] ||
                      allMarks[studentProfile?.studentId] ||
                      allMarks[studentProfile?.name] ||
                      allMarks[studentProfile?.email];

                    if (!studentMark) {
                      const found = Object.entries(allMarks).find(([k, v]) => {
                        if (!v) return false;
                        const kLow = String(k).toLowerCase().trim();
                        const sName = String(studentProfile?.name || "").toLowerCase().trim();
                        const sEmail = String(studentProfile?.email || "").toLowerCase().trim();
                        const sId = String(studentProfile?.id || "").toLowerCase().trim();
                        const sId2 = String(studentProfile?.student_id || "").toLowerCase().trim();
                        return (
                          (sId && kLow === sId) ||
                          (sId2 && kLow === sId2) ||
                          (sName && (kLow === sName || (v.studentName && v.studentName.toLowerCase().trim() === sName))) ||
                          (sEmail && kLow === sEmail)
                        );
                      });
                      if (found) studentMark = found[1];
                    }

                    // If studentMark has no score yet, look for any matching record with score in allMarks
                    if (!studentMark || studentMark.score === undefined || studentMark.score === null) {
                      const anyWithScore = Object.values(allMarks).find((m) => m && m.score !== undefined && m.score !== null);
                      if (anyWithScore) {
                        studentMark = { ...(studentMark || {}), ...anyWithScore };
                      }
                    }

                    const score = studentMark?.score !== undefined && studentMark?.score !== null ? Number(studentMark.score) : null;
                    const remarks = studentMark?.remarks || "";
                    const submissionUrl = studentMark?.submissionUrl || testSubmissions[test.id]?.url;
                    const isPublished = status === "Published" || score !== null;
                    const percent = score !== null ? Math.round((score / maxScore) * 100) : null;
                    const isPass = percent !== null ? percent >= 50 : false;

                    const subState = testSubmissions[test.id];
                    const isUploading = subState?.uploading;

                    let dateDisplay = "";
                    if (test.date) {
                      const d = new Date(test.date);
                      dateDisplay = isNaN(d.getTime()) ? test.date : d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
                    }

                    let IconComponent = BookOpen;
                    let iconClass = "chem-icon";
                    if (subject === "Mathematics") { IconComponent = Calculator; iconClass = "math-icon"; }
                    else if (subject === "Physics") { IconComponent = FlaskConical; iconClass = "phys-icon"; }

                    return (
                      <div key={test.id} className="test-card" style={{ flexDirection: "column", gap: "16px", alignItems: "stretch" }}>
                        {/* Top row: info + status badge */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
                          <div className={`test-icon-wrap ${iconClass}`}>
                            <IconComponent size={22} />
                          </div>
                          <div className="test-info-wrap" style={{ flex: 1 }}>
                            <div className="test-title-row">
                              <h4>{subject} — {title}</h4>
                              <span className={`test-badge ${status.replace(/\s+/g, "-").toLowerCase()}`}>{status}</span>
                            </div>
                            <div className="test-metadata">
                              {dateDisplay && (
                                <span className="meta-item">
                                  <CalendarDays size={14} className="meta-icon" /> {dateDisplay}
                                </span>
                              )}
                              <span className="meta-item">Max Marks: {maxScore}</span>
                            </div>
                          </div>
                        </div>

                        {/* Test paper download */}
                        {testPdfUrl && (
                          <button
                            onClick={() => {
                              if (testPdfUrl.startsWith("data:")) {
                                const byteStr = atob(testPdfUrl.split(",")[1]);
                                const mime = testPdfUrl.split(",")[0].split(":")[1].split(";")[0];
                                const arr = new Uint8Array(byteStr.length);
                                for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
                                const blob = new Blob([arr], { type: mime });
                                const url = URL.createObjectURL(blob);
                                window.open(url, "_blank");
                                setTimeout(() => URL.revokeObjectURL(url), 10000);
                              } else {
                                window.open(testPdfUrl, "_blank");
                              }
                            }}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "6px 14px", borderRadius: "8px",
                              background: "#eff6ff", border: "1px solid #bfdbfe",
                              color: "#2563eb", fontSize: "13px", fontWeight: 500,
                              cursor: "pointer", width: "fit-content"
                            }}
                          >
                            <Download size={14} /> View / Download Test Paper
                          </button>
                        )}

                        {/* Submission area */}
                        <div style={{
                          background: "#f8fafc", border: "1px solid #e2e8f0",
                          borderRadius: "10px", padding: "14px 16px"
                        }}>
                          {submissionUrl ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                              <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              <span style={{ fontSize: "13px", fontWeight: 500, color: "#166534" }}>Answer Submitted — awaiting evaluation</span>
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>Submit your answer sheet:</p>
                              <label
                                htmlFor={`test-file-${test.id}`}
                                style={{
                                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                  gap: "8px", padding: "18px 16px", borderRadius: "10px",
                                  border: "2px dashed #bfdbfe", background: "#eff6ff",
                                  cursor: isUploading ? "not-allowed" : "pointer",
                                  transition: "all 0.2s"
                                }}
                              >
                                <Upload size={22} color="#2563eb" />
                                <span style={{ fontSize: "13px", fontWeight: 500, color: "#2563eb" }}>Click to select PDF / DOC</span>
                                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Max size: 10MB</span>
                                <input
                                  id={`test-file-${test.id}`}
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  ref={(el) => { submissionInputRefs.current[test.id] = el; }}
                                  style={{ display: "none" }}
                                  disabled={isUploading}
                                  onChange={(e) => {
                                    // Force re-render to show selected filename
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      const label = document.getElementById(`test-file-label-${test.id}`);
                                      if (label) label.textContent = f.name;
                                    }
                                  }}
                                />
                              </label>
                              <span id={`test-file-label-${test.id}`} style={{ fontSize: "12px", color: "#475569", fontStyle: "italic", textAlign: "center" }}>No file selected</span>
                              <button
                                onClick={() => handleSubmitTestAnswer(test)}
                                disabled={isUploading}
                                style={{
                                  padding: "11px 0", borderRadius: "10px",
                                  background: isUploading ? "#94a3b8" : "linear-gradient(135deg, #2563eb, #4f46e5)",
                                  color: "#fff", border: "none",
                                  cursor: isUploading ? "not-allowed" : "pointer",
                                  fontSize: "14px", fontWeight: 700, width: "100%",
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                                  boxShadow: isUploading ? "none" : "0 2px 10px rgba(37,99,235,0.35)",
                                  transition: "all 0.2s"
                                }}
                              >
                                {isUploading ? (
                                  <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Uploading...</>
                                ) : (
                                  <><Upload size={16} /> Submit Answer Sheet</>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Result block — only show when published */}
                        {isPublished && score !== null && (
                          <div style={{
                            background: isPass ? "#f0fdf4" : "#fef2f2",
                            border: `1px solid ${isPass ? "#bbf7d0" : "#fecaca"}`,
                            borderRadius: "10px", padding: "14px 16px",
                            display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center"
                          }}>
                            <div>
                              <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Marks</span>
                              <p style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: "2px 0 0" }}>
                                {score} <span style={{ fontSize: "14px", color: "#94a3b8" }}>/ {maxScore}</span>
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Percentage</span>
                              <p style={{ fontSize: "22px", fontWeight: 700, color: isPass ? "#16a34a" : "#dc2626", margin: "2px 0 0" }}>
                                {percent}%
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Result</span>
                              <p style={{ margin: "4px 0 0" }}>
                                <span style={{
                                  display: "inline-block", padding: "3px 12px", borderRadius: "20px",
                                  fontSize: "13px", fontWeight: 600,
                                  background: isPass ? "#dcfce7" : "#fee2e2",
                                  color: isPass ? "#166534" : "#991b1b"
                                }}>
                                  {isPass ? "Pass" : "Fail"}
                                </span>
                              </p>
                            </div>
                            {remarks && (
                              <div style={{ flex: 1, minWidth: "200px" }}>
                                <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Teacher Remarks</span>
                                <p style={{ fontSize: "13px", color: "#334155", margin: "2px 0 0", fontStyle: "italic" }}>"{remarks}"</p>
                              </div>
                            )}
                          </div>
                        )}

                        {isPublished && score === null && (
                          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Result not yet entered for you.</p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="no-tests-card">
                    <p>No weekly tests assigned to your batch yet.</p>
                  </div>
                )}
              </section>
            </div>
          )}


          {activeTab === "Online Classes" && (
            <div className="online-classes-view-container">
              <section className="classes-header-section">
                <div>
                  <h2>Online Classes</h2>
                  <p>Join your scheduled classes on time</p>
                  {studentProfile && (studentProfile.batchName || studentProfile.batch) && (
                    <div style={{ 
                      marginTop: "8px", 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "6px",
                      padding: "4px 12px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#1e40af"
                    }}>
                      <Users size={14} />
                      <span>Your Batch: {studentProfile.batchName || studentProfile.batch}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="classes-filters-row">
                <div className="classes-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search online classes..."
                    value={onlineClassSearch}
                    onChange={(e) => setOnlineClassSearch(e.target.value)}
                  />
                </div>
                <div className="classes-dropdowns">
                  <select
                    value={onlineClassSubject}
                    onChange={(e) => setOnlineClassSubject(e.target.value)}
                    className="classes-select-dropdown"
                  >
                    <option value="All Subjects">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                  <select
                    value={onlineClassStatus}
                    onChange={(e) => setOnlineClassStatus(e.target.value)}
                    className="classes-select-dropdown"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Live Now">Live Now</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </section>

              {/* Live Jitsi Classroom Modal for Student */}
              {activeStudentLiveCall && (
                <JitsiClassroom
                  classData={activeStudentLiveCall}
                  userProfile={studentProfile}
                  isTeacher={false}
                  onLeave={handleLeaveClass}
                />
              )}

              <section className="classes-list-container">
                {filteredOnlineClasses.length > 0 ? (
                  filteredOnlineClasses.map((cls) => {
                    const statusStr = (cls.status || "upcoming").toLowerCase();
                    const isLive = statusStr === "live" || statusStr === "live now";
                    const isUpcoming = statusStr === "upcoming";
                    const isCompleted = statusStr === "completed";

                    let fallbackImg = mathClassImg;
                    if (cls.subject && cls.subject.toLowerCase().includes("phys")) fallbackImg = physicsClassImg;
                    else if (cls.subject && cls.subject.toLowerCase().includes("chem")) fallbackImg = chemistryClassImg;

                    return (
                      <div key={cls.id} className="class-card">
                        <div className="class-card-left">
                          <div className="class-image-wrap">
                            <img src={cls.image || fallbackImg} alt={cls.title} className="class-image" />
                            {isLive && <span className="status-badge-overlay live">LIVE NOW</span>}
                            {isUpcoming && <span className="status-badge-overlay upcoming">UPCOMING</span>}
                          </div>
                          <div className="class-info-wrap">
                            <h4>{cls.title}</h4>
                            <p className="class-desc">{cls.description || `${cls.subject} live lecture session for your batch.`}</p>
                            <div className="class-teacher-row">
                              <User size={16} className="teacher-icon" />
                              <span className="teacher-label">TEACHER</span>
                              <span className="teacher-name">{cls.teacher || "Faculty"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="class-card-right">
                          <div className="class-time-info">
                            <span className="date-val">{cls.date}</span>
                            <span className="time-val">{cls.time}</span>
                          </div>
                          <div className="class-actions">
                            {(isLive || isUpcoming) && (
                              <button className="join-class-btn active" onClick={() => handleJoinClass(cls)}>
                                <Play size={16} className="btn-icon" /> Join Class
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-classes-card">
                    <Video size={48} style={{ color: "#94a3b8", marginBottom: "12px" }} />
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: "0 0 6px" }}>
                      No Classes Available
                    </p>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      {studentProfile?.batchName || studentProfile?.batch 
                        ? `No online classes scheduled for ${studentProfile.batchName || studentProfile.batch} yet.`
                        : "No online classes scheduled for your batch yet."}
                    </p>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                      Your teacher will schedule classes soon. Check back later!
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="notifications-view-container">
              <section className="notifications-header-section">
                <h2>Notifications</h2>
                <p>Stay updated with your latest academic activities and announcements.</p>
              </section>

              <section className="notifications-filters-row">
                <div className="notifications-search-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={notificationSearch}
                    onChange={(e) => setNotificationSearch(e.target.value)}
                  />
                </div>
                <div className="notifications-dropdowns">
                  <select
                    value={notificationFilter}
                    onChange={(e) => setNotificationFilter(e.target.value)}
                    className="notifications-select-dropdown"
                  >
                    <option value="All">All</option>
                    <option value="Unread">Unread</option>
                  </select>
                </div>
              </section>

              <section className="notifications-list-container">
                {["TODAY", "YESTERDAY", "EARLIER"].map((groupName) => {
                  const groupItems = filteredNotifications.filter(item => item.group === groupName);
                  if (groupItems.length === 0) return null;

                  return (
                    <div key={groupName} className="notification-group-wrap">
                      <h4 className="group-heading">{groupName}</h4>
                      <div className="group-items-list">
                        {groupItems.map((notif) => {
                          let Icon = Bell;
                          let iconClass = "general";
                          if (notif.type === "study-material") {
                            Icon = BookOpen;
                            iconClass = "study";
                          } else if (notif.type === "class-reminder") {
                            Icon = Video;
                            iconClass = "class";
                          } else if (notif.type === "assignment") {
                            Icon = ClipboardList;
                            iconClass = "asgn";
                          } else if (notif.type === "test-results" || notif.type === "test-result" || notif.type === "weekly-test") {
                            Icon = HelpCircle;
                            iconClass = "test";
                          } else if (notif.type === "graded") {
                            Icon = ClipboardList;
                            iconClass = "asgn";
                          }

                          return (
                            <div
                              key={notif.id}
                              className={`notification-card-item ${notif.unread ? "unread" : ""}`}
                              style={{ cursor: "pointer" }}
                              onClick={() => handleNotificationClick(notif)}
                              title="Click to view details"
                            >
                              <div className="card-left">
                                <div className={`notif-icon-circle ${iconClass}`}>
                                  <Icon size={20} />
                                </div>
                                <div className="notif-content-text">
                                  <h4 className="notif-title">{notif.title}</h4>
                                  {notif.detail && <p className="notif-desc">{notif.detail}</p>}
                                </div>
                              </div>
                              <div className="card-right">
                                <span className="notif-time">{notif.time}</span>
                                {notif.unread && <span className="unread-blue-dot"></span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredNotifications.length === 0 && (
                  <div className="no-notifications-card">
                    <p>No notifications found matching criteria.</p>
                  </div>
                )}
              </section>

              <footer className="notifications-footer-row">
                <span className="notif-count-label">
                  Displaying {filteredNotifications.length} most recent notifications
                </span>
                <button className="notif-mark-read-btn" onClick={handleMarkAllRead}>
                  Mark all as read
                </button>
              </footer>
            </div>
          )}

          {activeTab === "Profile" && (
            <div className="profile-view-container">
              <section className="profile-header-section">
                <h2>My Profile</h2>
                <p>View and manage your personal and academic information.</p>
              </section>

              {/* Upper Profile Summary Card */}
              <section className="profile-header-card">
                <div className="profile-header-left">
                  <div className="profile-summary-info">
                    <div className="name-row">
                      <h3>{getDisplayValue(studentProfile?.name)}</h3>
                    </div>
                  </div>
                </div>
              </section>

              {/* Two Column Layout for details */}
              <div className="profile-details-grid">
                {/* Column 1: Personal Information */}
                <div className="profile-info-card personal-info">
                  <div className="info-card-header">
                    <User size={20} className="header-icon" />
                    <h3>Personal Information</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="info-row-grid">
                      <div className="info-item">
                        <span className="info-label">FULL NAME</span>
                        <span className="info-value">{getDisplayValue(studentProfile?.name)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">EMAIL ADDRESS</span>
                        <span className="info-value">{getDisplayValue(studentProfile?.email)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">PHONE NUMBER</span>
                        <span className="info-value">{getDisplayValue(studentProfile?.contact)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">DATE OF BIRTH</span>
                        <span className="info-value">{formatDate(studentProfile?.dob)}</span>
                      </div>
                      <div className="info-item full-width">
                        <span className="info-label">HOME ADDRESS</span>
                        <span className="info-value">{getDisplayValue(studentProfile?.address)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Academic Details */}
                <div className="profile-info-card academic-details">
                  <div className="info-card-header">
                    <GraduationCap size={22} className="header-icon" />
                    <h3>Academic Details</h3>
                  </div>
                  <div className="info-card-body">
                    <div className="academic-items">
                      <div className="info-item">
                        <span className="info-label">BATCH</span>
                        <span className="info-value">{getDisplayValue(studentProfile?.batchName, "Not Assigned")}</span>
                      </div>

                      <div className="info-item">
                        <span className="info-label">ALLOCATED TEACHER</span>
                        <span className="info-value">
                          {studentProfile?.assignedTeachers && studentProfile.assignedTeachers.length > 0
                            ? studentProfile.assignedTeachers.join(", ")
                            : "None Assigned"}
                        </span>
                      </div>

                      <div className="academic-badges-section">
                        <span className="info-label">ENROLLED SUBJECTS</span>
                        <div className="badges-list subjects">
                          {studentProfile?.subjects && studentProfile.subjects.length > 0 ? (
                            studentProfile.subjects.map((sub, index) => {
                              const lowerSub = sub.toLowerCase();
                              let badgeClass = "subject-badge math";
                              let Icon = Calculator;

                              if (lowerSub.includes("phys")) {
                                badgeClass = "subject-badge phys";
                                Icon = FlaskConical;
                              } else if (lowerSub.includes("chem")) {
                                badgeClass = "subject-badge chem";
                                Icon = BookOpen;
                              }

                              return (
                                <span className={badgeClass} key={index}>
                                  <Icon size={14} /> {sub}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted">No enrolled subjects</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Performance" && (
            <div className="performance-view-container">
              <section className="performance-header-section">
                <h2>Performance Overview</h2>
                <p>Track your subject-wise academic achievements, tests, and assignments.</p>
              </section>

              {/* Three Horizontal Cards */}
              <section className="performance-cards-list">
                {performanceData.map((data) => {
                  let Icon = BookOpen;
                  let colorClass = "chem";
                  if (data.subject === "Mathematics") {
                    Icon = Calculator;
                    colorClass = "math";
                  } else if (data.subject === "Physics") {
                    Icon = FlaskConical;
                    colorClass = "phys";
                  }

                  const isSelected = activePerformanceSubject === data.subject;

                  return (
                    <div
                      key={data.subject}
                      className={`performance-subject-card ${colorClass} ${isSelected ? "active" : ""}`}
                      onClick={() => setActivePerformanceSubject(data.subject)}
                    >
                      <div className="card-left-section">
                        <div className={`subject-icon-circle ${colorClass}`}>
                          <Icon size={22} />
                        </div>
                        <div className="subject-meta-text">
                          <h3>{data.subject}</h3>
                          <div className="progress-bar-row">
                            <div className="progress-bar-track">
                              <div
                                className={`progress-bar-fill ${colorClass}`}
                                style={{ width: `${data.progress}%` }}
                              ></div>
                            </div>
                            <span className="progress-pct-label">{data.progress}% Complete</span>
                          </div>
                        </div>
                      </div>
                      <div className="card-right-section">
                        <span className="expand-indicator">
                          {isSelected ? "Active View" : "Click to view"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* Selected Subject Details Panel */}
              {activePerformanceSubject && (() => {
                const selectedData = performanceData.find(d => d.subject === activePerformanceSubject);
                if (!selectedData) return null;

                return (
                  <div className="performance-details-panel">
                    <div className="panel-header">
                      <h3>{selectedData.subject} Detailed Summary</h3>
                    </div>
                    <div className="panel-body">
                      {/* Topics Covered */}
                      <div className="details-section-block">
                        <h4 className="section-title">Topics covered:</h4>
                        <div className="topics-list-wrap">
                          {selectedData.topicsCovered.map((topic, i) => (
                            <span key={i} className="topic-item-badge">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tests */}
                      <div className="details-section-block">
                        <h4 className="section-title">Tests:</h4>
                        <div className="details-table-list">
                          {selectedData.tests.map((test, i) => (
                            <div key={i} className="detail-item-row">
                              <span className="item-name">{test.name}</span>
                              <div className="item-status-wrap">
                                <span className="item-score">{test.score}</span>
                                <span className={`item-status-badge ${test.badgeClass}`}>
                                  {test.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assignments */}
                      <div className="details-section-block">
                        <h4 className="section-title">Assignments:</h4>
                        <div className="details-table-list">
                          {selectedData.assignments.map((asgn, i) => (
                            <div key={i} className="detail-item-row">
                              <span className="item-name">{asgn.name}</span>
                              <div className="item-status-wrap">
                                <span className="item-score">{asgn.score}</span>
                                <span className={`item-status-badge ${asgn.badgeClass}`}>
                                  {asgn.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab !== "Dashboard" && activeTab !== "Attendance" && activeTab !== "Study Materials" && activeTab !== "Assignments" && activeTab !== "Weekly Tests" && activeTab !== "Online Classes" && activeTab !== "Notifications" && activeTab !== "Profile" && activeTab !== "Performance" && (
            <div className="placeholder-view-card">
              <div className="placeholder-content">
                <div className="placeholder-icon-wrap">
                  {activeTab === "Attendance" && <CalendarDays size={48} />}
                  {activeTab === "Study Materials" && <BookOpen size={48} />}
                  {activeTab === "Assignments" && <ClipboardList size={48} />}
                  {activeTab === "Weekly Tests" && <FileText size={48} />}
                  {activeTab === "Online Classes" && <Tv size={48} />}
                  {activeTab === "Performance" && <BarChart3 size={48} />}
                  {activeTab === "Notifications" && <Bell size={48} />}
                  {activeTab === "Profile" && <User size={48} />}
                </div>
                <h2>{activeTab} Section</h2>
                <p>This module is currently being finalized. In this section, you will be able to review, access, and manage all your student {activeTab.toLowerCase()} reports.</p>
                <button className="placeholder-back-btn" onClick={() => setActiveTab("Dashboard")}>
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Details Modal Overlay */}
      {activeDetailsAssignment && (
        <div className="custom-modal-overlay" onClick={() => setActiveDetailsAssignment(null)}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assignment Details</h3>
              <button className="modal-close-btn" onClick={() => setActiveDetailsAssignment(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h4 className="modal-assignment-title">{activeDetailsAssignment.title}</h4>
              <div className="modal-meta-grid">
                <div>
                  <span className="meta-label">Subject</span>
                  <span className="meta-value">{activeDetailsAssignment.subject}</span>
                </div>
                <div>
                  <span className="meta-label">Status</span>
                  <span className={`status-badge ${activeDetailsAssignment.status.toLowerCase()}`}>
                    {activeDetailsAssignment.status}
                  </span>
                </div>
              </div>

              {activeDetailsAssignment.description && (
                <div className="modal-info-block">
                  <span className="meta-label">Description / Instructions</span>
                  <p className="modal-desc-text">{activeDetailsAssignment.description}</p>
                </div>
              )}

              {activeDetailsAssignment.attachmentUrl && (
                <div className="modal-info-block">
                  <span className="meta-label">Attachment (Reference Document)</span>
                  <div style={{ marginTop: "6px" }}>
                    <a
                      href={activeDetailsAssignment.attachmentUrl}
                      download={activeDetailsAssignment.attachmentName || "assignment_document.pdf"}
                      className="outline-btn"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "13px", padding: "6px 12px" }}
                    >
                      <Download size={14} /> Download PDF ({activeDetailsAssignment.attachmentName})
                    </a>
                  </div>
                </div>
              )}

              {activeDetailsAssignment.score && (
                <div className="modal-info-block">
                  <span className="meta-label">Grade / Score</span>
                  <span className="modal-score-val">{activeDetailsAssignment.score}</span>
                </div>
              )}

              {activeDetailsAssignment.teacherRemarks && (
                <div className="modal-info-block remarks-block">
                  <span className="meta-label">Teacher Remarks</span>
                  <p className="modal-remarks-text">"{activeDetailsAssignment.teacherRemarks}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Submission Modal */}
      {submitModalAsgn && (
        <div className="custom-modal-overlay" onClick={() => setSubmitModalAsgn(null)} style={{ zIndex: 9999 }}>
          <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Assignment</h3>
              <button className="modal-close-btn" onClick={() => setSubmitModalAsgn(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h4 className="modal-assignment-title">{submitModalAsgn.title}</h4>
              <div style={{ marginBottom: "15px" }}>
                <span className="meta-label">Subject</span>
                <span className="meta-value">{submitModalAsgn.subject}</span>
              </div>

              <div className="modal-info-block">
                <span className="meta-label">Submission Description / Notes *</span>
                <textarea
                  className="as-textarea"
                  placeholder="Type a description or notes about your submission..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    marginTop: "6px",
                    fontSize: "14px",
                    resize: "none"
                  }}
                  value={submitNotes}
                  onChange={e => setSubmitNotes(e.target.value)}
                />
              </div>

              <div className="modal-info-block" style={{ marginTop: "15px" }}>
                <span className="meta-label">Upload Answer PDF *</span>
                <div
                  onClick={() => studentFileRef.current?.click()}
                  style={{
                    border: "2px dashed #d1d5db",
                    padding: "20px",
                    textAlign: "center",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "6px",
                    background: "#f9fafb"
                  }}
                >
                  <input
                    ref={studentFileRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: "none" }}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setStudentFileName(f.name);
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setStudentFileUrl(event.target.result);
                        };
                        reader.readAsDataURL(f);
                      }
                    }}
                  />
                  {studentFileName ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <FileText size={18} color="#2D6BFF" />
                      <span style={{ fontWeight: 500, color: "#1f2937" }}>{studentFileName}</span>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                        onClick={ev => { ev.stopPropagation(); setStudentFileName(""); setStudentFileUrl(""); }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Paperclip size={20} color="#9ca3af" style={{ marginBottom: "6px" }} />
                      <div style={{ fontSize: "13px", color: "#6b7280" }}>Click to attach answer PDF file</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px", borderTop: "1px solid #e5e7eb" }}>
              <button className="outline-btn" onClick={() => setSubmitModalAsgn(null)}>Cancel</button>
              <button
                className="primary-solid-btn"
                onClick={handleStudentSubmissionSubmit}
                disabled={!studentFileUrl}
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Modal */}
      {activeTestResult && (
        <div className="custom-modal-overlay" onClick={() => setActiveTestResult(null)}>
          <div className="custom-modal-content test-result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Test Performance Report</h3>
              <button className="modal-close-btn" onClick={() => setActiveTestResult(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h4 className="modal-test-title">{activeTestResult.subject} - {activeTestResult.title}</h4>
              <div className="modal-meta-grid">
                <div>
                  <span className="meta-label">Teacher</span>
                  <span className="meta-value">{activeTestResult.teacher}</span>
                </div>
                <div>
                  <span className="meta-label">Date Taken</span>
                  <span className="meta-value">{activeTestResult.date}</span>
                </div>
                <div>
                  <span className="meta-label">Score</span>
                  <span className="meta-value score-accent">{activeTestResult.marksObtained} / {activeTestResult.totalMarks} ({activeTestResult.percent}%)</span>
                </div>
              </div>

              <div className="test-questions-report">
                <h5>Question-wise Breakdown</h5>
                <div className="questions-list">
                  {activeTestResult.questions.map((q, idx) => (
                    <div key={idx} className={`question-report-item ${q.isCorrect ? "correct" : "incorrect"}`}>
                      <div className="q-header">
                        <span className="q-number">Question {idx + 1}</span>
                        <span className={`q-status-badge ${q.isCorrect ? "correct" : "partial"}`}>
                          {q.marks} Marks
                        </span>
                      </div>
                      <p className="q-text">{q.q}</p>
                      <div className="answers-box">
                        <div className="answer-row">
                          <span className="ans-label">Your Answer:</span>
                          <span className="ans-val student">{q.studentAnswer}</span>
                        </div>
                        <div className="answer-row">
                          <span className="ans-label">Correct Answer:</span>
                          <span className="ans-val correct-ans">{q.correctAnswer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Material Preview Modal */}
      {previewMaterial && (
        <div className="custom-modal-overlay" onClick={() => setPreviewMaterial(null)}>
          <div className="custom-modal-content material-preview-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="material-modal-badges-header">
                <span className={`material-subject-pill ${(previewMaterial.subject || "math").toLowerCase()}`}>
                  {previewMaterial.subject || "General"}
                </span>
                <span className="material-batch-pill">
                  {previewMaterial.batch || "All Batches"}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setPreviewMaterial(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body material-preview-modal-body">
              <div className="material-modal-info-card">
                <div className={`material-modal-file-icon ${previewMaterial.fileType || "pdf"}`}>
                  <FileText size={32} />
                  <span>{(previewMaterial.fileType || "pdf").toUpperCase()}</span>
                </div>
                <div className="material-modal-details">
                  <h3 className="material-preview-name">{previewMaterial.fileName || previewMaterial.title}</h3>
                  <p className="material-preview-uploader">
                    Uploaded by <strong>{previewMaterial.teacher || "Teacher"}</strong> &bull; {previewMaterial.uploadDate} &bull; {previewMaterial.fileSize || "1.2 MB"}
                  </p>
                </div>
              </div>

              {previewMaterial.description && (
                <div className="material-preview-desc-panel">
                  <h4>Description &amp; Instructions</h4>
                  <p>{previewMaterial.description}</p>
                </div>
              )}

              <div className="material-preview-content-area">
                <h4>Document Preview</h4>
                {previewMaterial.fileUrl && previewMaterial.fileUrl.startsWith("data:application/pdf") ? (
                  <div className="material-pdf-embed-box">
                    <iframe
                      src={previewMaterial.fileUrl}
                      title={previewMaterial.title || previewMaterial.fileName}
                      className="material-pdf-iframe"
                    />
                  </div>
                ) : previewMaterial.fileUrl && previewMaterial.fileUrl.startsWith("data:image/") ? (
                  <div className="material-img-embed-box">
                    <img src={previewMaterial.fileUrl} alt={previewMaterial.title || "Material preview"} />
                  </div>
                ) : (
                  <div className="material-file-preview-card">
                    <BookOpen size={48} className="mat-file-icon-accent" />
                    <h5>{previewMaterial.fileName || previewMaterial.title}</h5>
                    <p>Subject: <strong>{previewMaterial.subject}</strong> &bull; Batch: <strong>{previewMaterial.batch || "All Batches"}</strong></p>
                    <p className="mat-preview-hint">This study material is ready for download and online reading.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer material-preview-modal-footer">
              {previewMaterial.fileUrl && (
                <button
                  type="button"
                  className="open-tab-btn"
                  onClick={() => {
                    try {
                      const win = window.open();
                      if (win) {
                        win.document.write(`<iframe src="${previewMaterial.fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }
                    } catch (e) {
                      console.error("Open tab error:", e);
                    }
                  }}
                >
                  <ExternalLink size={16} /> Open in New Tab
                </button>
              )}
              <button
                type="button"
                className="action-submit-btn modal-download-btn"
                onClick={() => handleDownloadMaterial(previewMaterial)}
                disabled={downloadProgress === previewMaterial.id}
              >
                {downloadProgress === previewMaterial.id ? (
                  <>
                    <span className="download-spinner"></span> Downloading...
                  </>
                ) : (
                  <>
                    <Download size={18} /> Download ({previewMaterial.fileSize || "1.2 MB"})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          background: toast.type === "error" ? "#ef4444" : toast.type === "info" ? "#3b82f6" : "#10b981",
          color: "#ffffff",
          padding: "12px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          zIndex: 9999,
          fontWeight: "bold",
          fontSize: "14px"
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
