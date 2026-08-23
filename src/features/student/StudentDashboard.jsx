import { useState, useEffect, useRef } from "react";
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
  Upload
} from "lucide-react";
import logo from "../../assets/logo.png";
import avatarImg from "../../assets/avatar.png";
import mathClassImg from "../../assets/math_class.png";
import physicsClassImg from "../../assets/physics_class.png";
import chemistryClassImg from "../../assets/chemistry_class.png";
import supabase from "../../lib/supabase";
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
          } catch (e) {}
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

        let student = null;
        try {
          const { data } = await supabase
            .from("students")
            .select("*")
            .ilike("email", normalizedEmail)
            .maybeSingle();
          if (data) student = data;
        } catch (e) {}

        if (!student) {
          try {
            const rawLocal = localStorage.getItem("gw_students_v2");
            if (rawLocal) {
              const list = JSON.parse(rawLocal);
              const matched = list.find((s) => (s.email && s.email.toLowerCase() === normalizedEmail) || (s.name && s.name.toLowerCase().includes(normalizedEmail.split("@")[0])));
              if (matched) student = matched;
            }
          } catch (e) {}
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

        const batchTarget = student.batch_id || student.batch;
        if (batchTarget) {
          const { data: batchData } = await supabase
            .from("batches")
            .select("*")
            .or(`id.eq.${batchTarget},name.eq.${batchTarget}`)
            .maybeSingle();

          if (batchData) {
            batchName = batchData.name;
            batchSchedule = batchData.schedule || "—";
            if (batchData.teacher && !assignedTeachers.includes(batchData.teacher)) {
              assignedTeachers.push(batchData.teacher);
            }
          }
        }

        const teacherTarget = student.teacher_id || student.teacherId || student.teacher;
        if (teacherTarget) {
          const { data: teacherData } = await supabase
            .from("teachers")
            .select("*")
            .or(`id.eq.${teacherTarget},name.eq.${teacherTarget}`)
            .maybeSingle();

          if (teacherData && teacherData.name && !assignedTeachers.includes(teacherData.name)) {
            assignedTeachers.push(teacherData.name);
          } else if (typeof teacherTarget === "string" && teacherTarget.trim() && !teacherTarget.includes("TCH") && !assignedTeachers.includes(teacherTarget)) {
            assignedTeachers.push(teacherTarget);
          }
        }

        if (assignedTeachers.length === 0 && student.subjects && Array.isArray(student.subjects)) {
          const { data: allTeachers } = await supabase.from("teachers").select("*");
          if (allTeachers && Array.isArray(allTeachers)) {
            const studentSubjs = student.subjects.map(s => String(s).toLowerCase());
            allTeachers.forEach((t) => {
              const tSubjs = (t.subjects || []).map(s => String(s).toLowerCase());
              if (tSubjs.some(sub => studentSubjs.includes(sub))) {
                if (t.name && !assignedTeachers.includes(t.name)) {
                  assignedTeachers.push(t.name);
                }
              }
            });
          }
        }

        // Fetch attendance logs for this student name
        let attLogs = [];
        let attError = null;
        try {
          const { data, error } = await supabase
            .from("attendance_logs")
            .select("*")
            .eq("student", student.name)
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

        if (active) {
          setStudentProfile(normalizeStudentProfile(student, batchName, assignedTeachers, batchSchedule));
          setAttendanceLogs(attLogs);
          if (attError) {
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

    return () => {
      active = false;
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

  // Fetch weekly tests for this student's batch from Supabase
  useEffect(() => {
    if (!studentProfile?.batch_id) return;
    setWeeklyTestsLoading(true);
    supabase
      .from("weekly_tests")
      .select("*")
      .then(({ data, error }) => {
        setWeeklyTestsLoading(false);
        if (error || !data) return;
        // Filter tests for this student's batch
        const studentBatchId = String(studentProfile.batch_id);
        const myTests = data.filter(
          (t) => String(t.batch_id) === studentBatchId
        );
        setWeeklyTests(myTests);
      });
  }, [studentProfile]);

  const handleSubmitTestAnswer = async (test) => {
    const fileInput = submissionInputRefs.current[test.id];
    if (!fileInput || !fileInput.files[0]) return;
    const file = fileInput.files[0];
    const studentId = studentProfile?.id || studentProfile?.student_id;
    if (!studentId) return;

    setTestSubmissions((prev) => ({ ...prev, [test.id]: { uploading: true, url: null } }));
    try {
      // Upload file to Supabase Storage
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `submissions/${test.id}_${studentId}_${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("weekly-tests")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("weekly-tests").getPublicUrl(path);
      const submissionUrl = urlData?.publicUrl;

      // Update the studentMarks JSONB in weekly_tests to record submission
      const currentMarks = test.student_marks || {};
      const updatedMarks = {
        ...currentMarks,
        [studentId]: {
          ...(currentMarks[studentId] || {}),
          submissionUrl,
          submittedAt: new Date().toISOString(),
        },
      };
      await supabase
        .from("weekly_tests")
        .update({ student_marks: updatedMarks })
        .eq("id", test.id);

      setTestSubmissions((prev) => ({ ...prev, [test.id]: { uploading: false, url: submissionUrl } }));
      // Refresh the test list
      setWeeklyTests((prev) =>
        prev.map((t) => t.id === test.id ? { ...t, student_marks: updatedMarks } : t)
      );
    } catch (err) {
      console.error("Submission upload failed:", err);
      setTestSubmissions((prev) => ({ ...prev, [test.id]: { uploading: false, url: null } }));
      showToast("Upload failed. Please try again.", "error");
    }
  };

  const filteredWeeklyTests = weeklyTests.filter((test) => {
    const title = test.title || "";
    const subject = test.subject || "";
    const matchesSearch =
      title.toLowerCase().includes(testSearch.toLowerCase()) ||
      subject.toLowerCase().includes(testSearch.toLowerCase());
    const matchesSubject = testSubject === "All Subjects" || subject === testSubject;
    return matchesSearch && matchesSubject;
  });


  const [onlineClassSearch, setOnlineClassSearch] = useState("");
  const [onlineClassSubject, setOnlineClassSubject] = useState("All Subjects");
  const [onlineClassStatus, setOnlineClassStatus] = useState("All Status");
  const [onlineClasses, setOnlineClasses] = useState([]);
  const [activeStudentLiveCall, setActiveStudentLiveCall] = useState(null);
  const [studentMic, setStudentMic] = useState(true);
  const [studentVideo, setStudentVideo] = useState(true);
  const studentVideoRef = useRef(null);

  // Fetch online classes from Supabase for this student's assigned batch alone
  useEffect(() => {
    if (!studentProfile) return;
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from("online_classes")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const studentBatchName = (studentProfile.batchName || "").trim().toLowerCase();
          const studentBatchId = String(studentProfile.batch_id || "").trim().toLowerCase();

          const myClasses = data.filter((c) => {
            if (!c) return false;
            const classTarget = String(c.student || c.batch_id || c.batchId || "").trim().toLowerCase();
            if (!classTarget || classTarget === "all" || classTarget === "general") return true;
            return (
              classTarget === studentBatchName ||
              classTarget === studentBatchId ||
              (studentBatchName && classTarget.includes(studentBatchName)) ||
              (studentBatchId && classTarget.includes(studentBatchId))
            );
          });
          setOnlineClasses(myClasses);
        }
      } catch (err) {
        console.warn("Could not fetch student online classes:", err);
      }
    };

    fetchClasses();
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
            studentVideoRef.current.play().catch(() => {});
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
          const studentBatch = studentProfile?.batchId;
          const studentSubjects = studentProfile?.subjects || [];
          const parsed = data
            .filter(row => {
              if (row.batch_id === studentBatch || row.batch_id === "ALL") return true;
              const rowSubject = (row.subject || "").toLowerCase().trim();
              return studentSubjects.some(sub => sub.toLowerCase().trim() === rowSubject);
            })
            .map(row => {
              let parsedDesc = {};
              try {
                if (row.description && row.description.startsWith("{")) {
                  parsedDesc = JSON.parse(row.description);
                }
              } catch (e) {}

              const submissionsList = parsedDesc.submissions || [];
              const mySub = submissionsList.find(sub => sub.studentId === studentProfile.id);

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
      const newSubmissionEntry = {
        studentId: studentProfile.id,
        name: studentProfile.name,
        rollNo: studentProfile.rollNo || studentProfile.contact || "—",
        avatar: null,
        submittedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: null,
        status: "submitted",
        description: submitNotes,
        attachmentName: studentFileName,
        attachmentUrl: studentFileUrl
      };

      const updatedSubmissions = submitModalAsgn.rawSubmissions.map(sub => {
        if (sub.studentId === studentProfile.id) {
          return newSubmissionEntry;
        }
        return sub;
      });

      const exists = submitModalAsgn.rawSubmissions.some(sub => sub.studentId === studentProfile.id);
      if (!exists) {
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
          type: `submission:${rawTeacher}:${submitModalAsgn.id}:${studentProfile.id}`,
          message: `${studentProfile.name} submitted assignment '${submitModalAsgn.title}' (${submitModalAsgn.subject})`,
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
            // Case 1: Do not show submission notifications to students
            if (notif.rawType && notif.rawType.startsWith("submission:")) {
              return false;
            }

            // Case 2: If type starts with graded:, match student ID
            if (notif.rawType && notif.rawType.startsWith("graded:")) {
              const notifStudentId = notif.rawType.split(":")[1];
              return notifStudentId === studentProfile.id;
            }

            // Case 3: Standard subject-based matching
            if (!notif.title) return false;
            const match = notif.title.match(/\(([^)]+)\)/);
            if (!match) return false;
            const notifSubject = match[1].toLowerCase().trim();
            const isSubjectMatched = studentSubjects.some((sub) => {
              if (!sub) return false;
              return sub.toLowerCase().trim() === notifSubject;
            });
            if (!isSubjectMatched) return false;

            // If type has a teacher suffix, match loosely
            if (notif.rawType && notif.rawType.includes(":")) {
              const notifTeacher = notif.rawType.split(":")[1];
              return assignedTeachers.some(tName => {
                if (!tName || !notifTeacher) return false;
                const n1 = tName.toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim();
                const n2 = notifTeacher.toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim();
                return n1 === n2 || n1.includes(n2) || n2.includes(n1);
              });
            }
            return true;
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

    if (studentProfile?.subjects) {
      fetchNotifications();
    }

    // Subscribe to new notifications
    const channel = supabase
      .channel("student-notifications-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        if (payload.new && active) {
          const studentSubjects = studentProfile?.subjects || [];
          const assignedTeachers = studentProfile?.assignedTeachers || [];
          const rawType = payload.new.type || "study-material";
          
          if (rawType.startsWith("submission:")) {
            return;
          }
          
          let isNotificationForMe = false;
          
          if (rawType.startsWith("graded:")) {
            const notifStudentId = rawType.split(":")[1];
            isNotificationForMe = notifStudentId === studentProfile.id;
          } else {
            const match = payload.new.message?.match(/\(([^)]+)\)/);
            if (match) {
              const notifSubject = match[1].toLowerCase().trim();
              const isSubjectMatched = studentSubjects.some((sub) => {
                if (!sub) return false;
                return sub.toLowerCase().trim() === notifSubject;
              });
              if (isSubjectMatched) {
                let isTeacherMatched = true;
                if (rawType.includes(":")) {
                  const notifTeacher = rawType.split(":")[1];
                  isTeacherMatched = assignedTeachers.some(tName => {
                    if (!tName || !notifTeacher) return false;
                    const n1 = tName.toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim();
                    const n2 = notifTeacher.toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim();
                    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
                  });
                }
                isNotificationForMe = isTeacherMatched;
              }
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

  const [materialsList, setMaterialsList] = useState([]);

  // Fetch materials dynamically from Supabase
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const { data, error } = await supabase
          .from("materials")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          const parsed = data.map((row) => {
            try {
              if (row.title.startsWith("{")) {
                const parsedTitle = JSON.parse(row.title);
                return {
                  id: row.id,
                  subject: row.subject,
                  teacher: row.teacher,
                  flagged: row.flagged,
                  created_at: row.created_at,
                  ...parsedTitle,
                };
              }
            } catch (e) {}
            return {
              id: row.id,
              title: row.title,
              subject: row.subject,
              teacher: row.teacher,
              flagged: row.flagged,
              uploadDate: new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              fileType: "pdf",
              fileName: row.title,
              fileSize: "1.2 MB",
              description: "Course study material.",
              batch: "All Batches",
              grade: "All Grades",
              downloads: 0,
            };
          });

          // Filter by student's batch or subject + loose teacher allocation
          const studentBatch = studentProfile?.batchId;
          const studentSubjects = studentProfile?.subjects || [];
          const assignedTeachers = studentProfile?.assignedTeachers || [];

          const filtered = parsed.filter(m => {
            // Case 1: Match student's batch exactly
            if (m.batch === studentBatch || m.batch === studentProfile?.batchName) return true;
            
            // Case 2: Match student's enrolled subject AND the material's teacher is assigned to the student loosely!
            const isTeacherMatched = assignedTeachers.some(tName => {
              if (!tName || !m.teacher) return false;
              const n1 = tName.toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim();
              const n2 = m.teacher.toLowerCase().replace(/^(mr\.|mrs\.|ms\.)\s*/, "").trim();
              return n1 === n2 || n1.includes(n2) || n2.includes(n1);
            });
            const isSubjectMatched = studentSubjects.some(sub => {
              if (!sub || !m.subject) return false;
              return sub.toLowerCase().trim() === m.subject.toLowerCase().trim();
            });
            if (isSubjectMatched && isTeacherMatched) return true;

            // Case 3: Global/All batches
            if (!m.batch || m.batch === "All Batches") return true;

            return false;
          });
          setMaterialsList(filtered);
        }
      } catch (err) {
        console.error("Error fetching study materials:", err);
      }
    };

    if (studentProfile) {
      fetchMaterials();
    }
  }, [studentProfile]);

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
                {/* Card 1: Next Live Class (Solid Color Accent) */}
                <div className="summary-card live-class-card">
                  <div className="card-top">
                    <span className="card-badge">NEXT LIVE CLASS</span>
                    <span className="badge-icon-wrap">
                      <Video size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <h3>Physics: Quantum Mechanics</h3>
                    <p>Today, 4:00 PM</p>
                  </div>
                  <button className="join-class-btn" onClick={() => showToast("Joining Live Class...")}>
                    Join Class
                  </button>
                </div>

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
                <div className="summary-card">
                  <div className="card-top">
                    <span className="card-badge gray">ASSIGNMENTS</span>
                    <span className="badge-icon-wrap orange">
                      <AlertTriangle size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">2 <span className="value-unit">Pending</span></span>
                    </div>
                    <p className="card-subtitle">8 Recently Submitted</p>
                  </div>
                </div>

                {/* Card 4: Weekly Test */}
                <div className="summary-card">
                  <div className="card-top">
                    <span className="card-badge gray">WEEKLY TEST</span>
                    <span className="badge-icon-wrap blue">
                      <Award size={16} />
                    </span>
                  </div>
                  <div className="card-middle">
                    <div className="card-value-row">
                      <span className="card-value-large">89 <span className="value-divider">/ 100</span></span>
                    </div>
                    <p className="card-subtitle">Latest: Mathematics</p>
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
                      <div key={notif.id} className={`notification-item ${notif.unread ? "unread" : ""}`}>
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
                  <h3>Study Materials</h3>
                  <button className="view-all-btn" onClick={() => selectTab("Study Materials")}>
                    View All
                  </button>
                </div>

                <div className="materials-list">
                  {materialsList.length === 0 ? (
                    <p style={{ padding: "12px", color: "var(--muted-color, #94a3b8)", fontSize: "0.9rem" }}>No study materials uploaded yet.</p>
                  ) : (
                    materialsList.slice(0, 3).map((material) => (
                      <div key={material.id} className="material-item">
                        <div className="material-left">
                          <div className={`file-icon-wrap ${material.fileType || "pdf"}`}>
                            <span className="file-icon-text">{(material.fileType || "pdf").toUpperCase()}</span>
                          </div>
                          <div className="material-info">
                            <h4>{material.fileName || material.title}</h4>
                            <p>Added: {material.uploadDate} &bull; {material.fileSize || "1.2 MB"}</p>
                          </div>
                        </div>
                        <button
                          className="download-icon-btn"
                          onClick={() => handleDownloadMaterial(material)}
                          disabled={downloadProgress !== null}
                          aria-label={`Download ${material.fileName || material.title}`}
                        >
                          {downloadProgress === material.id ? (
                            <span className="download-spinner"></span>
                          ) : (
                            <Download size={20} />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "Attendance" && (
            <div className="attendance-view-container">
              {/* Header section */}
              <section className="attendance-header-section">
                <h2>Attendance Overview</h2>
                <p>Track your attendance here!</p>
              </section>

              {loadingAttendance ? (
                <div className="attendance-loading" style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 20px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: "0 6px 24px rgba(30, 42, 70, 0.05)",
                  color: "#64748b"
                }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    border: "4px solid rgba(0,0,0,0.05)",
                    borderRadius: "50%",
                    borderTopColor: "#2D6BFF",
                    animation: "spin 1s linear infinite",
                    marginBottom: "16px"
                  }}></div>
                  <p style={{ fontSize: "15px", fontWeight: 600 }}>Loading attendance records...</p>
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : attendanceError ? (
                <div className="attendance-error" style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 20px",
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: "0 6px 24px rgba(30, 42, 70, 0.05)",
                  color: "#dc2626"
                }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>⚠️</div>
                  <p style={{ fontSize: "15px", fontWeight: 600 }}>{attendanceError}</p>
                </div>
              ) : attendanceLogs.length === 0 ? (
                <div className="attendance-empty" style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 40px",
                  textAlign: "center",
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1px solid rgba(226, 232, 240, 0.8)",
                  boxShadow: "0 6px 24px rgba(30, 42, 70, 0.05)"
                }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    backgroundColor: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    color: "#94a3b8"
                  }}>
                    <CalendarDays size={32} />
                  </div>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1e2a46", marginBottom: "8px" }}>No Attendance Records Found</h3>
                  <p style={{ color: "#64748b", fontSize: "14.5px", maxWidth: "340px", margin: "0 auto 16px" }}>You do not have any registered attendance records in the database.</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards Row (3 Cards) */}
                  <section className="attendance-summary-cards">
                    {/* Card 1: Overall Attendance */}
                    <div className="attendance-summary-card">
                      <div className="attendance-card-info">
                        <span className="card-badge gray">OVERALL ATTENDANCE</span>
                        <span className="attendance-large-val">{overallPercentage}%</span>
                        {overallPercentage >= 90 ? (
                          <span className="attendance-badge-text green">Excellent Attendance</span>
                        ) : overallPercentage >= 75 ? (
                          <span className="attendance-badge-text" style={{ color: "#d97706" }}>Good Attendance</span>
                        ) : (
                          <span className="attendance-badge-text" style={{ color: "#dc2626" }}>Low Attendance</span>
                        )}
                      </div>
                      <div className="circular-progress-wrapper">
                        <svg className="circular-svg" viewBox="0 0 36 36">
                          <path
                            className="circle-bg"
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="circle-fill-bar"
                            strokeDasharray={`${overallPercentage}, 100`}
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="circle-text">{overallPercentage}%</div>
                      </div>
                    </div>

                    {/* Card 2: Classes Attended */}
                    <div className="attendance-summary-card">
                      <div className="attendance-card-info">
                        <span className="card-badge gray">CLASSES ATTENDED</span>
                        <span className="attendance-large-val">{presentLogsCount}</span>
                        <span className="attendance-badge-subtitle">Out of {totalLogs} classes</span>
                      </div>
                      <div className="attendance-card-icon-wrap blue-icon">
                        <CheckCircle size={24} />
                      </div>
                    </div>

                    {/* Card 3: Enrolled Subjects */}
                    <div className="attendance-summary-card">
                      <div className="attendance-card-info">
                        <span className="card-badge gray">ENROLLED SUBJECTS</span>
                        <span className="attendance-large-val">{subjectsList.length}</span>
                        <span className="attendance-badge-subtitle" style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "160px"
                        }}>
                          {subjectsList.join(", ")}
                        </span>
                      </div>
                      <div className="attendance-card-icon-wrap indigo-icon">
                        <BookOpen size={24} />
                      </div>
                    </div>
                  </section>

                  {/* Subject-wise Attendance */}
                  <section className="subject-attendance-section">
                    <h3 className="section-title">Subject-wise Attendance</h3>
                    <div className="subject-cards-grid">
                      {subjectAttendance.map((sub, index) => {
                        const styleTheme = (() => {
                          const norm = sub.subject.toLowerCase();
                          if (norm.includes("math")) {
                            return {
                              boxClass: "math-box",
                              pctClass: "math-pct",
                              fillClass: "math-fill",
                              icon: <BookOpen size={20} />
                            };
                          } else if (norm.includes("phys")) {
                            return {
                              boxClass: "phys-box",
                              pctClass: "phys-pct",
                              fillClass: "phys-fill",
                              icon: <Award size={20} />
                            };
                          } else if (norm.includes("chem")) {
                            return {
                              boxClass: "chem-box",
                              pctClass: "chem-pct",
                              fillClass: "chem-fill",
                              icon: <ClipboardList size={20} />
                            };
                          }
                          const fallbacks = [
                            { boxClass: "math-box", pctClass: "math-pct", fillClass: "math-fill", icon: <BookOpen size={20} /> },
                            { boxClass: "phys-box", pctClass: "phys-pct", fillClass: "phys-fill", icon: <Award size={20} /> },
                            { boxClass: "chem-box", pctClass: "chem-pct", fillClass: "chem-fill", icon: <ClipboardList size={20} /> }
                          ];
                          return fallbacks[index % 3];
                        })();

                        return (
                          <div className="subject-attendance-card" key={index}>
                            <div className="subject-card-top">
                              <div className={`subject-icon-box ${styleTheme.boxClass}`}>
                                {styleTheme.icon}
                              </div>
                              <div className="subject-title-details">
                                <h4>{sub.subject}</h4>
                                <p>{sub.teacher}</p>
                              </div>
                              <span className={`subject-pct-val ${styleTheme.pctClass}`}>{sub.rate}%</span>
                            </div>
                            <div className="subject-progress-track">
                              <div className={`subject-progress-fill ${styleTheme.fillClass}`} style={{ width: `${sub.rate}%` }}></div>
                            </div>
                            <div className="subject-card-bottom">
                              <span>Present: {sub.present} Sessions</span>
                              <span>Total: {sub.total}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Attendance History Card */}
                  <section className="attendance-history-card">
                    <div className="history-card-header">
                      <h3>Attendance History</h3>
                      <div className="history-filters">
                        <select
                          value={historyFilter}
                          onChange={(e) => setHistoryFilter(e.target.value)}
                          className="history-select-dropdown"
                        >
                          <option value="All Subjects">All Subjects</option>
                          {subjectsList.map((sub, index) => (
                            <option key={index} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="history-table-container">
                      <table className="history-table">
                        <thead>
                          <tr>
                            <th>DATE</th>
                            <th>SUBJECT</th>
                            <th>TEACHER</th>
                            <th>BATCH</th>
                            <th>TIME</th>
                            <th>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredHistory.length > 0 ? (
                            filteredHistory.map((row, idx) => {
                              const statusLower = row.status?.toLowerCase();
                              const lateStyle = statusLower === "late" ? { backgroundColor: "#fffbeb", color: "#d97706" } : {};
                              
                              return (
                                <tr key={idx}>
                                  <td>{formatDate(row.date)}</td>
                                  <td className="subject-cell">{row.subject}</td>
                                  <td>{row.teacher}</td>
                                  <td>{studentProfile?.batchName || "—"}</td>
                                  <td>{studentProfile?.batchSchedule || "—"}</td>
                                  <td>
                                    <span className={`status-badge ${statusLower}`} style={lateStyle}>
                                      {row.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="6" className="no-records-cell">
                                No attendance records found matching criteria.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="history-pagination">
                      <button className="pag-btn" disabled>Previous</button>
                      <button className="pag-btn" disabled>Next</button>
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {activeTab === "Study Materials" && (
            <div className="study-materials-view-container">
              <section className="study-materials-section-card">
                <div className="card-header">
                  <h3>Study Materials</h3>
                  <button className="view-all-btn" onClick={() => setActiveTab("Dashboard")}>
                    Back to Dashboard
                  </button>
                </div>

                <div className="materials-list">
                  {materialsList.length === 0 ? (
                    <p style={{ padding: "12px", color: "var(--muted-color, #94a3b8)", fontSize: "0.9rem" }}>No study materials uploaded yet.</p>
                  ) : (
                    materialsList.map((material) => (
                      <div key={material.id} className="material-item">
                        <div className="material-left">
                          <div className={`file-icon-wrap ${material.fileType || "pdf"}`}>
                            <span className="file-icon-text">{(material.fileType || "pdf").toUpperCase()}</span>
                          </div>
                          <div className="material-info">
                            <h4>{material.fileName || material.title}</h4>
                            <p>Added: {material.uploadDate} &bull; {material.fileSize || "1.2 MB"}</p>
                          </div>
                        </div>
                        <button
                          className="download-icon-btn"
                          onClick={() => handleDownloadMaterial(material)}
                          disabled={downloadProgress !== null}
                          aria-label={`Download ${material.fileName || material.title}`}
                        >
                          {downloadProgress === material.id ? (
                            <span className="download-spinner"></span>
                          ) : (
                            <Download size={20} />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
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
                          {asgn.status === "Evaluated" && (
                            <button
                              className="outline-btn"
                              onClick={() => handleViewAssignmentDetails(asgn)}
                            >
                              View Submission
                            </button>
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

                    // Find this student's marks from the JSONB column
                    const studentId = studentProfile?.id;
                    const studentMark = (test.student_marks || test.studentMarks || {})[studentId];
                    const score = studentMark?.score ?? null;
                    const remarks = studentMark?.remarks || "";
                    const submissionUrl = studentMark?.submissionUrl || testSubmissions[test.id]?.url;
                    const isPublished = status === "Published";
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
                          <a
                            href={testPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "6px 14px", borderRadius: "8px",
                              background: "#eff6ff", border: "1px solid #bfdbfe",
                              color: "#2563eb", fontSize: "13px", fontWeight: 500,
                              textDecoration: "none", width: "fit-content"
                            }}
                          >
                            <Download size={14} /> Download Test Paper (PDF)
                          </a>
                        )}

                        {/* Submission area */}
                        <div style={{
                          background: "#f8fafc", border: "1px solid #e2e8f0",
                          borderRadius: "10px", padding: "14px 16px"
                        }}>
                          {submissionUrl ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                              <CheckCircle size={16} style={{ color: "#22c55e" }} />
                              <span style={{ fontSize: "13px", fontWeight: 500, color: "#166534" }}>Answer Submitted</span>
                              <a
                                href={submissionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "12px", color: "#2563eb", textDecoration: "underline"
                                }}
                              >
                                View my submission
                              </a>
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                              <p style={{ fontSize: "13px", fontWeight: 500, color: "#475569", margin: 0 }}>
                                Submit your answer:
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  ref={(el) => { submissionInputRefs.current[test.id] = el; }}
                                  style={{ fontSize: "13px", flex: 1, minWidth: "180px" }}
                                  disabled={isUploading}
                                />
                                <button
                                  onClick={() => handleSubmitTestAnswer(test)}
                                  disabled={isUploading}
                                  style={{
                                    padding: "7px 18px", borderRadius: "8px",
                                    background: isUploading ? "#94a3b8" : "#2563eb",
                                    color: "#fff", border: "none", cursor: isUploading ? "not-allowed" : "pointer",
                                    fontSize: "13px", fontWeight: 600
                                  }}
                                >
                                  {isUploading ? "Uploading..." : "Submit"}
                                </button>
                              </div>
                              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>PDF, DOC or DOCX accepted</p>
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
                <h2>Online Classes</h2>
                <p>Join your scheduled classes on time</p>
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

              {/* Live Meeting Room Modal for Student */}
              {activeStudentLiveCall && (
                <div style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(15, 23, 42, 0.95)", zIndex: 9999,
                  display: "flex", flexDirection: "column", padding: "20px"
                }}>
                  {/* Meet Header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 24px", background: "#1e293b", borderRadius: "12px", marginBottom: "16px", color: "#fff"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700 }}>
                          LIVE CLASS
                        </span>
                        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700 }}>{activeStudentLiveCall.title}</h3>
                      </div>
                      <span style={{ fontSize: "13px", color: "#94a3b8" }}>
                        {activeStudentLiveCall.subject} · Teacher: {activeStudentLiveCall.teacher || "Faculty"}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveStudentLiveCall(null)}
                      style={{
                        background: "#dc2626", color: "#fff", border: "none",
                        padding: "8px 18px", borderRadius: "8px", cursor: "pointer",
                        fontWeight: 600, fontSize: "13px"
                      }}
                    >
                      Leave Meet
                    </button>
                  </div>

                  {/* Video Grid */}
                  <div style={{
                    flex: 1, display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px", minHeight: 0
                  }}>
                    {/* Teacher / Main Stage Feed */}
                    <div style={{
                      background: "#0f172a", borderRadius: "12px", border: "1px solid #334155",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      position: "relative", overflow: "hidden", color: "#fff"
                    }}>
                      <div style={{
                        width: "100px", height: "100px", borderRadius: "50%",
                        background: "#3b82f6", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "36px", fontWeight: 700, marginBottom: "12px"
                      }}>
                        {activeStudentLiveCall.teacher ? activeStudentLiveCall.teacher.charAt(0).toUpperCase() : "T"}
                      </div>
                      <h4 style={{ margin: "0 0 4px", fontSize: "18px" }}>{activeStudentLiveCall.teacher || "Teacher"} (Presenter)</h4>
                      <p style={{ margin: 0, color: "#22c55e", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                        Broadcasting Live Lecture
                      </p>
                    </div>

                    {/* Student Self Feed & Info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{
                        flex: 1, background: "#1e293b", borderRadius: "12px", border: "1px solid #334155",
                        position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {studentVideo ? (
                          <video
                            ref={studentVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ textAlign: "center", color: "#94a3b8" }}>
                            <User size={48} style={{ opacity: 0.5, marginBottom: "8px" }} />
                            <p style={{ margin: 0, fontSize: "13px" }}>Camera Off</p>
                          </div>
                        )}
                        <span style={{
                          position: "absolute", bottom: "10px", left: "10px",
                          background: "rgba(0,0,0,0.6)", color: "#fff", padding: "2px 8px", borderRadius: "6px", fontSize: "12px"
                        }}>
                          {studentProfile?.name || "You"}
                        </span>
                      </div>

                      {/* Meet Info Card */}
                      <div style={{
                        background: "#1e293b", borderRadius: "12px", border: "1px solid #334155", padding: "16px", color: "#fff"
                      }}>
                        <h5 style={{ margin: "0 0 8px", fontSize: "13px", color: "#94a3b8", textTransform: "uppercase" }}>Class Info</h5>
                        <p style={{ margin: "0 0 6px", fontSize: "13px" }}><strong>Batch:</strong> {studentProfile?.batchName || "Assigned Batch"}</p>
                        <p style={{ margin: "0 0 6px", fontSize: "13px" }}><strong>Time:</strong> {activeStudentLiveCall.time}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#22c55e" }}>✓ Attendance automatically being recorded</p>
                      </div>
                    </div>
                  </div>

                  {/* Student Controls Bar */}
                  <div style={{
                    display: "flex", justifyContent: "center", gap: "16px", padding: "16px 0 0"
                  }}>
                    <button
                      onClick={() => setStudentMic(!studentMic)}
                      style={{
                        padding: "12px 24px", borderRadius: "30px", border: "none", cursor: "pointer",
                        background: studentMic ? "#334155" : "#ef4444", color: "#fff", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "8px", fontSize: "13px"
                      }}
                    >
                      {studentMic ? "Mute Mic" : "Unmute Mic"}
                    </button>
                    <button
                      onClick={() => setStudentVideo(!studentVideo)}
                      style={{
                        padding: "12px 24px", borderRadius: "30px", border: "none", cursor: "pointer",
                        background: studentVideo ? "#334155" : "#ef4444", color: "#fff", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "8px", fontSize: "13px"
                      }}
                    >
                      {studentVideo ? "Turn Off Video" : "Turn On Video"}
                    </button>
                  </div>
                </div>
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
                            {isCompleted && <span className="status-badge-overlay completed">COMPLETED</span>}
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
                            {isLive && (
                              <button className="join-class-btn active" onClick={() => setActiveStudentLiveCall(cls)}>
                                <Play size={16} className="btn-icon" /> Join Class
                              </button>
                            )}
                            {isUpcoming && (
                              <>
                                <button className="outline-btn" onClick={() => showToast(`Class: ${cls.title} · Subject: ${cls.subject} · Time: ${cls.time}`, "info")}>
                                  View Details
                                </button>
                                <button className="join-class-btn locked" disabled>
                                  <Lock size={16} className="btn-icon" /> Join Class
                                </button>
                              </>
                            )}
                            {isCompleted && (
                              <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                                <Check size={16} /> Class Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-classes-card">
                    <p>No online classes scheduled for your batch yet.</p>
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
                          } else if (notif.type === "test-results") {
                            Icon = HelpCircle;
                            iconClass = "test";
                          }

                          return (
                            <div key={notif.id} className={`notification-card-item ${notif.unread ? "unread" : ""}`}>
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
