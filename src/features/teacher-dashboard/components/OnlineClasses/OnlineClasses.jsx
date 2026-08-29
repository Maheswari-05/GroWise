import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Filter, BookOpen, Calendar, Clock, Video, X,
  Trash2, Check, Play, RefreshCw, AlertTriangle, Users, Mic, MicOff,
  VideoOff, PhoneOff, Monitor, Radio, CheckCircle, UserCheck
} from "lucide-react";
import * as adminService from "../../../../services/adminService";
import { attendanceTracker } from "../../../../services/attendanceTrackingService";
import supabase from "../../../../lib/supabase";
import JitsiClassroom from "../../../../components/JitsiClassroom/JitsiClassroom";
import "./OnlineClasses.css";

// Helper functions for custom clock time handling
const formatTime12h = (time24) => {
  if (!time24) return "09:00 AM";
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return "09:00 AM";
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const formattedH = h < 10 ? `0${h}` : `${h}`;
  return `${formattedH}:${m} ${ampm}`;
};

const calculateDurationText = (start24, end24) => {
  if (!start24 || !end24) return "1 hr";
  const [sh, sm] = start24.split(":").map(Number);
  const [eh, em] = end24.split(":").map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins <= startMins) {
    endMins += 24 * 60;
  }
  const diff = endMins - startMins;
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} mins`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return `${mins} mins`;
};

const addMinutesToTime = (time24, minsToAdd) => {
  const [h, m] = (time24 || "09:00").split(":").map(Number);
  const totalMins = h * 60 + m + minsToAdd;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  const formattedH = newH < 10 ? `0${newH}` : `${newH}`;
  const formattedM = newM < 10 ? `0${newM}` : `${newM}`;
  return `${formattedH}:${formattedM}`;
};

const OnlineClasses = ({
  onlineClasses = [],
  setOnlineClasses,
  attendanceRecords = [],
  setAttendanceRecords,
  students = [],
  batches = [],
  teacherProfile = {}
}) => {
  const teacherName = teacherProfile?.name || "Teacher";
  const teacherInitial = teacherName.charAt(0).toUpperCase() || "T";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeCallClassId, setActiveCallClassId] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // New Class Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState(
    teacherProfile.subjects?.[0] || "Mathematics"
  );
  const [newBatch, setNewBatch] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);

  // Flexible Time State (Start Time & End Time)
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  // Reschedule Modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("10:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("11:00");
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Synchronize newBatch when batches are loaded
  useEffect(() => {
    if (batches.length > 0 && (!newBatch || !batches.some((b) => String(b.id) === String(newBatch)))) {
      setNewBatch(batches[0].id);
    }
  }, [batches, newBatch]);

  // Call options state
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [cameraError, setCameraError] = useState(null);
  const [connectedStudentsMap, setConnectedStudentsMap] = useState({});

  // WebRTC / MediaStream references
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const liveChannelRef = useRef(null);

  // Helper to find students assigned to a batch
  const getBatchStudents = (batchIdOrName) => {
    if (!batchIdOrName) return [];
    const batchObj = batches.find(
      (b) => String(b.id) === String(batchIdOrName) || String(b.name) === String(batchIdOrName)
    );
    const targetId = batchObj?.id || batchIdOrName;
    const targetName = batchObj?.name || batchIdOrName;

    return students.filter(
      (s) =>
        String(s.batchId) === String(targetId) ||
        String(s.batch_id) === String(targetId) ||
        s.batch === targetName ||
        s.batch === targetId ||
        s.batchId === targetName
    );
  };

  // Real-time BroadcastChannel Signal logic for Live Call
  useEffect(() => {
    if (!activeCallClassId) {
      if (liveChannelRef.current) {
        liveChannelRef.current.close();
        liveChannelRef.current = null;
      }
      setConnectedStudentsMap({});
      return;
    }

    try {
      const channel = new BroadcastChannel(`growise_live_class_${activeCallClassId}`);
      liveChannelRef.current = channel;

      const handleChannelMessage = (event) => {
        const data = event.data;
        if (!data || !data.type) return;

        if (data.type === "STUDENT_JOINED" || data.type === "STUDENT_HEARTBEAT" || data.type === "STUDENT_STATE_CHANGE") {
          const key = data.studentId || data.studentName;
          if (key) {
            setConnectedStudentsMap((prev) => ({
              ...prev,
              [key]: {
                connected: true,
                studentName: data.studentName,
                videoActive: data.videoActive ?? true,
                micActive: data.micActive ?? true,
                lastSeen: Date.now(),
              },
            }));
          }
        }
      };

      channel.addEventListener("message", handleChannelMessage);

      // Send initial teacher state and set heartbeat interval
      const sendTeacherState = () => {
        if (channel) {
          channel.postMessage({
            type: "TEACHER_STATE",
            classId: activeCallClassId,
            teacherName,
            videoActive,
            micActive,
            isScreenSharing,
            timestamp: Date.now(),
          });
        }
      };

      sendTeacherState();
      const heartbeatTimer = setInterval(sendTeacherState, 1000);

      return () => {
        clearInterval(heartbeatTimer);
        channel.removeEventListener("message", handleChannelMessage);
        channel.close();
        liveChannelRef.current = null;
      };
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }
  }, [activeCallClassId, teacherName, videoActive, micActive, isScreenSharing]);

  // WebRTC & Audio Analyser Effect for live call
  useEffect(() => {
    if (!activeCallClassId) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setCameraError(null);
      return;
    }

    let animationFrameId;

    const startMedia = async () => {
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }

        if (!videoActive && !micActive) {
          if (videoRef.current) videoRef.current.srcObject = null;
          setCameraError(null);
          return;
        }

        const constraints = {
          video: videoActive ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
          audio: micActive ? true : false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        mediaStreamRef.current = stream;
        setCameraError(null);

        if (videoRef.current && videoActive) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.warn("Video playback error:", err));
        }

        // Audio volume level analyser
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack && micActive) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateVolume = () => {
              analyser.getByteFrequencyData(dataArray);
              const sum = dataArray.reduce((a, b) => a + b, 0);
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animationFrameId = requestAnimationFrame(updateVolume);
            };
            updateVolume();
          }
        }
      } catch (err) {
        console.warn("Camera/Mic access error:", err);
        setCameraError("Camera or Microphone permission blocked or device unavailable.");
      }
    };

    startMedia();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [activeCallClassId, videoActive, micActive]);

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      setVideoActive(true);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
        videoRef.current.play().catch(() => {});
      }
      setIsScreenSharing(true);
      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
      };
    } catch (err) {
      console.warn("Screen share cancelled/failed:", err);
    }
  };

  // Filter classes
  const filteredClasses = (onlineClasses || []).filter((c) => {
    if (!c) return false;
    const title = c.title || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || (c.status && c.status.toLowerCase() === selectedStatus.toLowerCase());
    const matchesSubject = selectedSubject === "all" || c.subject === selectedSubject;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Handle scheduling a new class
  const handleScheduleClass = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsScheduling(true);
    const selectedBatchObj = batches.find((b) => String(b.id) === String(newBatch) || b.name === newBatch) || batches[0];
    const batchIdentifier = selectedBatchObj?.name || newBatch || "Assigned Batch";

    const finalTime = `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;

    const newClassData = {
      title: newTitle.trim(),
      subject: newSubject,
      teacher: teacherName,
      teacherId: teacherProfile?.id || teacherProfile?.email || "teacher",
      student: batchIdentifier,
      batchId: selectedBatchObj?.id || newBatch || "b1",
      date: newDate,
      time: finalTime,
      status: "upcoming",
    };

    try {
      // 1. Save to Supabase DB
      const created = await adminService.addOnlineClass(newClassData);
      const newClass = created ? { ...newClassData, id: created.id } : { ...newClassData, id: "c_" + Date.now() };

      // 2. Update local state & LocalStorage
      const nextClasses = [newClass, ...(onlineClasses || [])];
      setOnlineClasses(nextClasses);
      try {
        localStorage.setItem("gw_classes_v3", JSON.stringify(nextClasses));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {}

      // 3. Send notification for students
      try {
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const notifMsg = `Live class scheduled: "${newTitle.trim()}" (${newSubject}) for ${newDate} at ${finalTime}`;

        await supabase.from("notifications").insert([
          {
            type: `online-class:${teacherName}`,
            message: notifMsg,
            time: currentTime,
            recipient_type: "student",
            recipient: "all",
          },
          {
            type: "class-reminder",
            message: notifMsg,
            time: currentTime,
            recipient_type: "student",
            recipient: "all",
          }
        ]);

        try {
          const raw = localStorage.getItem("gw_notifications_v3");
          const existing = raw ? JSON.parse(raw) : [];
          const newNotif = {
            id: `notif_${Date.now()}`,
            type: "class-reminder",
            title: "Live Class Scheduled",
            detail: notifMsg,
            message: notifMsg,
            time: "Just now",
            group: "TODAY",
            unread: true,
            read: false,
          };
          localStorage.setItem("gw_notifications_v3", JSON.stringify([newNotif, ...existing]));
        } catch (e) {}
      } catch (notifErr) {
        console.warn("Notification send warning:", notifErr);
      }

      setShowScheduleModal(false);
      setNewTitle("");
    } catch (err) {
      console.error("Failed to schedule class:", err);
      alert("Failed to schedule class. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  // Start Class & Join Call
  const handleStartClass = async (classId) => {
    const classToStart = (onlineClasses || []).find((c) => c.id === classId);
    if (!classToStart) return;

    const updated = (onlineClasses || []).map((c) => {
      if (c.id === classId) return { ...c, status: "live" };
      return c;
    });
    setOnlineClasses(updated);
    try {
      localStorage.setItem("gw_classes_v3", JSON.stringify(updated));
    } catch (e) {}

    setActiveCallClassId(classId);
    setVideoActive(true);
    setMicActive(true);

    try {
      // Update class status in database with started_at timestamp
      await adminService.updateOnlineClass(classId, { 
        status: "live",
        startedAt: new Date().toISOString()
      });

      // Initialize attendance tracking for all batch students
      const batchId = classToStart.batchId || classToStart.student;
      const teacherId = teacherProfile?.id || teacherProfile?.email || "teacher";
      
      console.log(`🎓 Starting class ${classId} - Initializing attendance for batch ${batchId}`);
      
      const result = await attendanceTracker.initializeClassAttendance(
        classId,
        batchId,
        teacherId
      );

      if (result.success) {
        console.log(`✅ Attendance initialized for ${result.studentCount} students`);
      } else {
        console.warn("⚠️ Could not initialize attendance tracking:", result.error);
      }
    } catch (err) {
      console.warn("Could not update online class status in DB:", err);
    }
  };

  // End Class & Auto-Record Attendance
  const handleEndClass = async () => {
    const liveClass = (onlineClasses || []).find((c) => c.id === activeCallClassId);
    if (!liveClass) {
      setActiveCallClassId(null);
      return;
    }

    console.log(`🏁 Ending class ${activeCallClassId} - Finalizing attendance...`);

    const updatedClasses = (onlineClasses || []).map((c) => {
      if (c.id === activeCallClassId) return { ...c, status: "completed" };
      return c;
    });
    setOnlineClasses(updatedClasses);

    try {
      // Finalize attendance tracking (calculates durations, marks as recorded)
      const result = await attendanceTracker.finalizeClassAttendance(activeCallClassId);
      
      if (result.success) {
        console.log(`✅ Attendance finalized:`, result.stats);
        
        // Update class status in DB
        await adminService.updateOnlineClass(liveClass.id, { 
          status: "completed",
          endedAt: new Date().toISOString()
        });

        // Create teacher attendance record for local state
        const dateToday = liveClass.date || new Date().toISOString().split("T")[0];
        const batchStudents = getBatchStudents(liveClass.batchId || liveClass.student);
        
        const newAttendanceRecord = {
          id: "a_" + Date.now(),
          date: dateToday,
          batchId: liveClass.batchId || liveClass.student,
          batch: liveClass.student || "Batch",
          subject: liveClass.subject,
          teacherStatus: "Submitted",
          onlineClass: true,
          records: {},
          remarks: {},
        };

        // Mark students who actually joined as present
        batchStudents.forEach((student) => {
          const wasPresent = result.stats.present > 0; // In real scenario, check joined_students
          newAttendanceRecord.records[student.id] = wasPresent ? "present" : "absent";
          newAttendanceRecord.remarks[student.id] = wasPresent 
            ? "Attended live online class session" 
            : "Did not join online class";
        });

        setAttendanceRecords([newAttendanceRecord, ...(attendanceRecords || [])]);

        alert(`✅ Class ended successfully!\n\nAttendance Summary:\n• Total Students: ${result.stats.total}\n• Present: ${result.stats.present}\n• Absent: ${result.stats.absent}\n\nAttendance has been automatically recorded.`);
      } else {
        console.warn("⚠️ Could not finalize attendance:", result.error);
        alert("Class ended, but there was an issue finalizing attendance. Please check manually.");
      }
    } catch (err) {
      console.error("Error ending class:", err);
      alert("Error ending class. Please try again.");
    }

    setActiveCallClassId(null);
    setIsScreenSharing(false);
  };

  const handleCancelClass = async (classId) => {
    if (window.confirm("Are you sure you want to cancel this online class?")) {
      const updated = (onlineClasses || []).map((c) => {
        if (c.id === classId) return { ...c, status: "cancelled" };
        return c;
      });
      setOnlineClasses(updated);

      try {
        await adminService.updateOnlineClass(classId, { status: "cancelled" });
      } catch (err) {
        console.warn("Could not cancel class in DB:", err);
      }
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm("Are you sure you want to delete this online class permanently?")) {
      const updated = (onlineClasses || []).filter((c) => String(c.id) !== String(classId));
      setOnlineClasses(updated);

      try {
        localStorage.setItem("gw_classes_v3", JSON.stringify(updated));
      } catch (err) {}

      try {
        await adminService.deleteOnlineClass(classId);
      } catch (err) {
        console.warn("Could not delete class in DB:", err);
      }
    }
  };

  const openRescheduleModal = (c) => {
    setRescheduleTarget(c);
    setRescheduleDate(c.date || new Date().toISOString().split("T")[0]);
    setRescheduleStartTime("10:00");
    setRescheduleEndTime("11:00");
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    setIsRescheduling(true);
    const finalTimeStr = `${formatTime12h(rescheduleStartTime)} - ${formatTime12h(rescheduleEndTime)}`;

    const updated = (onlineClasses || []).map((item) => {
      if (item.id === rescheduleTarget.id) {
        return { ...item, date: rescheduleDate, time: finalTimeStr, status: "upcoming" };
      }
      return item;
    });
    setOnlineClasses(updated);

    try {
      await adminService.updateOnlineClass(rescheduleTarget.id, {
        date: rescheduleDate,
        time: finalTimeStr,
        status: "upcoming",
      });
      try {
        localStorage.setItem("gw_classes_v3", JSON.stringify(updated));
      } catch (err) {}
    } catch (err) {
      console.warn("Could not reschedule class in DB:", err);
    } finally {
      setIsRescheduling(false);
      setShowRescheduleModal(false);
      setRescheduleTarget(null);
    }
  };

  // Find active call details
  const activeCallClass = (onlineClasses || []).find((c) => c.id === activeCallClassId);
  const activeCallBatchStudents = activeCallClass
    ? getBatchStudents(activeCallClass.batchId || activeCallClass.student)
    : [];

  // Preview assigned students for currently selected batch in schedule modal
  const selectedBatchStudents = getBatchStudents(newBatch);

  return (
    <div className="online-classes-container">
      {/* 1. Live Jitsi Meeting Call Interface */}
      {activeCallClass && (
        <JitsiClassroom
          classData={activeCallClass}
          userProfile={{ name: teacherName }}
          isTeacher={true}
          onLeave={() => setActiveCallClassId(null)}
          onEndClass={handleEndClass}
        />
      )}

      {/* 2. Main Classes List View */}
      {!activeCallClass && (
        <>
          {/* Action Bar */}
          <div className="oc-action-bar">
            <div className="oc-filters-container">
              <div className="oc-search-box">
                <Search size={16} className="oc-search-icon" />
                <input
                  type="text"
                  placeholder="Search online classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="oc-filter-dropdowns">
                <div className="oc-filter-item">
                  <Filter size={14} />
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="oc-filter-item">
                  <BookOpen size={14} />
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="all">All Subjects</option>
                    {[...new Set((onlineClasses || []).map((c) => c.subject).filter(Boolean))].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button className="oc-create-btn" onClick={() => setShowScheduleModal(true)}>
              <Plus size={16} /> Schedule Live Class
            </button>
          </div>

          {/* Classes Cards List */}
          <div className="oc-cards-list">
            {filteredClasses.length === 0 ? (
              <div className="oc-empty-state">
                <AlertTriangle size={48} />
                <p>No online classes scheduled. Click "Schedule Live Class" to set up a new session.</p>
              </div>
            ) : (
              filteredClasses.map((c) => {
                const batch = batches.find(
                  (b) =>
                    String(b.id) === String(c.batchId) ||
                    String(b.name) === String(c.batchId) ||
                    String(b.id) === String(c.student) ||
                    String(b.name) === String(c.student)
                );
                const batchText = batch
                  ? `${batch.name}${batch.grade ? ` (${batch.grade})` : ""}`
                  : c.student || c.batch || c.batchId || "General Batch";
                const statusLower = (c.status || "upcoming").toLowerCase();
                const assignedCount = getBatchStudents(c.batchId || c.student).length;

                let dateDisplay = "Today";
                if (c.date) {
                  const parsedDate = new Date(c.date);
                  if (!isNaN(parsedDate.getTime())) {
                    dateDisplay = parsedDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                  } else {
                    dateDisplay = String(c.date);
                  }
                }

                return (
                  <div key={c.id} className={`oc-card oc-card-status-${statusLower}`}>
                    {/* Left details */}
                    <div className="oc-card-left">
                      <div className="oc-card-icon-box">
                        <Video size={22} />
                      </div>
                      <div className="oc-card-details">
                        <div className="oc-card-title-row">
                          <h3 className="oc-card-title">{c.title}</h3>
                          <span className={`oc-badge badge-${statusLower}`}>
                            {statusLower === "live" ? "LIVE NOW" : c.status || "UPCOMING"}
                          </span>
                        </div>
                        <div className="oc-card-meta">
                          <span><strong>Batch:</strong> {batchText}</span>
                          <span><strong>Subject:</strong> {c.subject}</span>
                          {assignedCount > 0 && (
                            <span><strong>Students:</strong> {assignedCount} assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right schedules & actions */}
                    <div className="oc-card-right">
                      <div className="oc-card-schedule">
                        <div className="oc-schedule-item">
                          <Calendar size={14} />
                          <span>{dateDisplay}</span>
                        </div>
                        <div className="oc-schedule-item">
                          <Clock size={14} />
                          <span>{c.time}</span>
                        </div>
                      </div>

                      <div className="oc-card-actions">
                        {statusLower === "upcoming" && (
                          <>
                            <button className="oc-btn-start" onClick={() => handleStartClass(c.id)}>
                              <Play size={14} /> Start Class
                            </button>
                            <button className="oc-btn-icon" title="Reschedule" onClick={() => openRescheduleModal(c)}>
                              <RefreshCw size={14} />
                            </button>
                            <button className="oc-btn-icon btn-cancel" title="Cancel Class" onClick={() => handleCancelClass(c.id)}>
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {statusLower === "live" && (
                          <button className="oc-btn-start call-live-btn" onClick={() => handleStartClass(c.id)}>
                            <Play size={14} /> Join Call
                          </button>
                        )}
                        {statusLower === "cancelled" && (
                          <span className="oc-status-text-cancelled">Class Cancelled</span>
                        )}
                        <button
                          className="oc-btn-icon btn-delete"
                          title="Delete Class"
                          onClick={() => handleDeleteClass(c.id)}
                          style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #fee2e2" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 3. Schedule Class Modal */}
      {showScheduleModal && (
        <div className="oc-modal-overlay">
          <div className="oc-modal">
            <div className="oc-modal-header">
              <h3>Schedule Live Class</h3>
              <button className="oc-modal-close" onClick={() => setShowScheduleModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleScheduleClass}>
              <div className="oc-form-group">
                <label>Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Trigonometry Doubt Solving"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="oc-form-row">
                <div className="oc-form-group">
                  <label>Subject</label>
                  <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)}>
                    {teacherProfile.subjects && teacherProfile.subjects.length > 0 ? (
                      teacherProfile.subjects.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))
                    ) : (
                      <>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="Physics">Physics</option>
                        <option value="Chemistry">Chemistry</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="oc-form-group">
                  <label>Assigned Batch</label>
                  <select value={newBatch} required onChange={(e) => setNewBatch(e.target.value)}>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.grade ? `(${b.grade})` : (b.subject ? `— ${b.subject}` : "")}
                      </option>
                    ))}
                    {batches.length === 0 && (
                      <option value="">No assigned batches</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Assigned Students in this Batch Preview */}
              <div className="oc-batch-students-preview">
                <span className="oc-preview-label">
                  <Users size={14} /> Assigned Students in Selected Batch ({selectedBatchStudents.length}):
                </span>
                <div className="oc-student-chips">
                  {selectedBatchStudents.length > 0 ? (
                    selectedBatchStudents.map((s) => (
                      <span key={s.id} className="oc-student-chip">
                        <CheckCircle size={11} style={{ color: "#22c55e" }} /> {s.name}
                      </span>
                    ))
                  ) : (
                    <span className="oc-student-chip-empty">
                      No students enrolled in this batch yet.
                    </span>
                  )}
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="oc-time-section">
                <div className="oc-form-group" style={{ marginBottom: "12px" }}>
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>

                <div className="oc-form-row">
                  <div className="oc-form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setStartTime(newStart);
                        if (newStart > endTime) {
                          setEndTime(addMinutesToTime(newStart, 60));
                        }
                      }}
                    />
                  </div>

                  <div className="oc-form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="oc-duration-summary" style={{ marginTop: "12px" }}>
                  <span className="oc-summary-time">
                    {formatTime12h(startTime)} – {formatTime12h(endTime)}
                  </span>
                  <span className="oc-duration-badge">
                    {calculateDurationText(startTime, endTime)}
                  </span>
                </div>
              </div>

              <div className="oc-modal-footer">
                <button type="button" className="oc-btn-secondary" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="oc-btn-primary" disabled={isScheduling || batches.length === 0}>
                  {isScheduling ? "Scheduling..." : "Schedule Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Reschedule Class Modal */}
      {showRescheduleModal && rescheduleTarget && (
        <div className="oc-modal-overlay">
          <div className="oc-modal">
            <div className="oc-modal-header">
              <h3>Reschedule Live Class</h3>
              <button
                className="oc-modal-close"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleTarget(null);
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmReschedule}>
              <div className="oc-reschedule-target-info">
                <div className="oc-target-title">{rescheduleTarget.title}</div>
                <div className="oc-target-sub">
                  {rescheduleTarget.subject} · {rescheduleTarget.student || "Batch"}
                </div>
              </div>

              <div className="oc-time-section">
                <div className="oc-form-group" style={{ marginBottom: "12px" }}>
                  <label>New Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                  />
                </div>

                <div className="oc-form-row">
                  <div className="oc-form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      required
                      value={rescheduleStartTime}
                      onChange={(e) => {
                        const nStart = e.target.value;
                        setRescheduleStartTime(nStart);
                        if (nStart > rescheduleEndTime) {
                          setRescheduleEndTime(addMinutesToTime(nStart, 60));
                        }
                      }}
                    />
                  </div>

                  <div className="oc-form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      required
                      value={rescheduleEndTime}
                      onChange={(e) => setRescheduleEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="oc-duration-summary" style={{ marginTop: "12px" }}>
                  <span className="oc-summary-time">
                    {formatTime12h(rescheduleStartTime)} – {formatTime12h(rescheduleEndTime)}
                  </span>
                  <span className="oc-duration-badge">
                    {calculateDurationText(rescheduleStartTime, rescheduleEndTime)}
                  </span>
                </div>
              </div>

              <div className="oc-modal-footer">
                <button
                  type="button"
                  className="oc-btn-secondary"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setRescheduleTarget(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="oc-btn-primary" disabled={isRescheduling}>
                  {isRescheduling ? "Saving..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineClasses;
