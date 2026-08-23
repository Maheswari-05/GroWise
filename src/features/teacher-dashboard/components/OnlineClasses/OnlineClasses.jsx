import { useState, useEffect, useRef } from "react";
import {
  Search, Plus, Filter, BookOpen, Calendar, Clock, Video, X,
  Trash2, Check, Play, RefreshCw, AlertTriangle, Users, Mic, MicOff,
  VideoOff, PhoneOff, Monitor, Radio, CheckCircle, UserCheck
} from "lucide-react";
import * as adminService from "../../../../services/adminService";
import supabase from "../../../../lib/supabase";
import "./OnlineClasses.css";

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
  const [newTime, setNewTime] = useState("09:00 AM - 10:00 AM");

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

  // WebRTC / MediaStream references
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

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

    const newClassData = {
      title: newTitle.trim(),
      subject: newSubject,
      teacher: teacherName,
      student: batchIdentifier,
      batchId: selectedBatchObj?.id || newBatch || "b1",
      date: newDate,
      time: newTime,
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
      } catch (e) {}

      // 3. Send notification for students
      try {
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const notifMsg = `Live class scheduled: "${newTitle.trim()}" (${newSubject}) for ${newDate} at ${newTime}`;

        await supabase.from("notifications").insert([
          {
            type: `online-class:${teacherName}`,
            message: notifMsg,
            time: currentTime,
          },
          {
            type: "class-reminder",
            message: notifMsg,
            time: currentTime,
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
      await adminService.updateOnlineClass(classId, { status: "live" });
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

    const updatedClasses = (onlineClasses || []).map((c) => {
      if (c.id === activeCallClassId) return { ...c, status: "completed" };
      return c;
    });
    setOnlineClasses(updatedClasses);

    // Get assigned students for this batch
    const batchStudents = getBatchStudents(liveClass.batchId || liveClass.student);
    const dateToday = liveClass.date || new Date().toISOString().split("T")[0];

    // Create teacher attendance record
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

    batchStudents.forEach((student) => {
      newAttendanceRecord.records[student.id] = "present";
      newAttendanceRecord.remarks[student.id] = "Attended live online class session";
    });

    setAttendanceRecords([newAttendanceRecord, ...(attendanceRecords || [])]);

    // Update class status in DB
    try {
      await adminService.updateOnlineClass(liveClass.id, { status: "completed" });
    } catch (err) {
      console.warn("Error updating class status:", err);
    }

    // Save attendance logs in Supabase
    if (batchStudents.length > 0) {
      try {
        const logs = batchStudents.map((student) => ({
          date: dateToday,
          subject: liveClass.subject,
          teacher: teacherName,
          student: student.name || student.id,
          status: "Present",
        }));
        await adminService.addBatchAttendance(logs);
      } catch (err) {
        console.warn("Error recording attendance logs:", err);
      }
    }

    setActiveCallClassId(null);
    setIsScreenSharing(false);

    alert(`Class ended! Live attendance successfully recorded for ${batchStudents.length} assigned students.`);
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

  const handleRescheduleClass = async (classId) => {
    const newTimePrompt = prompt("Enter new date & time slot (e.g. 2026-08-25 at 11:00 AM - 12:00 PM):");
    if (newTimePrompt) {
      const parts = newTimePrompt.split(" at ");
      const datePart = parts[0] || new Date().toISOString().split("T")[0];
      const timePart = parts[1] || "10:00 AM - 11:00 AM";

      const updated = (onlineClasses || []).map((c) => {
        if (c.id === classId) return { ...c, date: datePart, time: timePart, status: "upcoming" };
        return c;
      });
      setOnlineClasses(updated);

      try {
        await adminService.updateOnlineClass(classId, { date: datePart, time: timePart, status: "upcoming" });
      } catch (err) {
        console.warn("Could not reschedule class in DB:", err);
      }
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
      {/* 1. Live Meeting Call Interface */}
      {activeCallClass && (
        <div className="oc-call-overlay">
          <div className="oc-call-window">
            {/* Header info */}
            <div className="oc-call-header">
              <div className="oc-call-header-left">
                <span className="oc-live-badge">
                  <Radio size={12} className="oc-live-pulse" /> LIVE SESSION
                </span>
                <h3>{activeCallClass.title}</h3>
                <span className="oc-call-subtitle">
                  {activeCallClass.subject} · {batches.find((b) => String(b.id) === String(activeCallClass.batchId))?.name || activeCallClass.student || "Assigned Batch"}
                </span>
              </div>
              <div className="oc-call-header-right">
                <Users size={16} />{" "}
                <span>
                  {activeCallBatchStudents.length + 1} participant{activeCallBatchStudents.length !== 0 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Main Video Arena */}
            <div className="oc-call-arena">
              {/* Main feed (Teacher) */}
              <div className="oc-video-feed teacher-feed">
                {videoActive ? (
                  <div className="oc-video-simulation">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="oc-video-img"
                      style={{ display: cameraError ? "none" : "block" }}
                    />
                    {cameraError && (
                      <div className="oc-video-avatar-placeholder">
                        {teacherProfile?.avatar ? (
                          <img src={teacherProfile.avatar} alt="Teacher avatar" className="oc-video-img" />
                        ) : (
                          <div className="oc-video-avatar-initials">{teacherInitial}</div>
                        )}
                        <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px" }}>
                          {cameraError}
                        </p>
                      </div>
                    )}
                    <div className="oc-feed-name">
                      {teacherName} {isScreenSharing ? "(Screen Sharing)" : "(You - Host)"}
                    </div>
                  </div>
                ) : (
                  <div className="oc-video-avatar-placeholder">
                    {teacherProfile?.avatar ? (
                      <img
                        src={teacherProfile.avatar}
                        alt="Teacher avatar"
                        style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="oc-video-avatar-initials">{teacherInitial}</div>
                    )}
                    <div className="oc-feed-name">{teacherName} (Camera Off)</div>
                  </div>
                )}

                {/* Audio Status & Level Indicator */}
                <div className={`oc-mic-status ${micActive ? "oc-mic-status--active" : ""}`}>
                  {micActive ? (
                    <>
                      <Mic size={14} className="mic-on" />
                      {audioLevel > 5 && (
                        <div className="oc-audio-waveform">
                          <span style={{ height: `${Math.max(20, audioLevel)}%` }} />
                          <span style={{ height: `${Math.max(40, audioLevel * 1.3)}%` }} />
                          <span style={{ height: `${Math.max(25, audioLevel * 0.9)}%` }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <MicOff size={14} className="mic-off" />
                  )}
                </div>
              </div>

              {/* Assigned Student Feeds Grid */}
              <div className="oc-students-grid">
                {activeCallBatchStudents.length > 0 ? (
                  activeCallBatchStudents.map((student) => (
                    <div key={student.id} className="oc-video-feed student-feed">
                      <div className="oc-video-simulation">
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="oc-student-call-avatar"
                          />
                        ) : (
                          <div className="oc-student-call-initials">
                            {student.name ? student.name.charAt(0).toUpperCase() : "S"}
                          </div>
                        )}
                        <div className="oc-feed-name">{student.name}</div>
                      </div>
                      <div className="oc-mic-status">
                        <UserCheck size={13} style={{ color: "#22c55e" }} title="Assigned Student (Connected)" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="oc-video-feed student-feed" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", color: "#94a3b8", fontSize: "12px", textAlign: "center", padding: "10px" }}>
                    <span>Waiting for assigned batch students to connect...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="oc-call-controls">
              <button
                className={`oc-control-btn ${!micActive ? "control-disabled" : ""}`}
                onClick={() => setMicActive(!micActive)}
                title={micActive ? "Mute Microphone" : "Unmute Microphone"}
              >
                {micActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                className={`oc-control-btn ${!videoActive ? "control-disabled" : ""}`}
                onClick={() => setVideoActive(!videoActive)}
                title={videoActive ? "Turn Off Camera" : "Turn On Camera"}
              >
                {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button
                className={`oc-control-btn ${isScreenSharing ? "control-active" : ""}`}
                onClick={handleToggleScreenShare}
                title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
              >
                <Monitor size={20} />
              </button>

              <button className="oc-hangup-btn" onClick={handleEndClass}>
                <PhoneOff size={18} /> End Class & Record Attendance
              </button>
            </div>
          </div>
        </div>
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
                            <button className="oc-btn-icon" title="Reschedule" onClick={() => handleRescheduleClass(c.id)}>
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
                        {statusLower === "completed" && (
                          <span className="oc-status-text-completed">
                            <Check size={16} /> Attendance Saved
                          </span>
                        )}
                        {statusLower === "cancelled" && (
                          <span className="oc-status-text-cancelled">Class Cancelled</span>
                        )}
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

              <div className="oc-form-row" style={{ marginTop: "16px" }}>
                <div className="oc-form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>

                <div className="oc-form-group">
                  <label>Time Slot</label>
                  <select value={newTime} onChange={(e) => setNewTime(e.target.value)}>
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                  </select>
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
    </div>
  );
};

export default OnlineClasses;
