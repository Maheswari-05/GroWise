import { useState, useEffect, useRef } from "react";
import { Search, Plus, Filter, BookOpen, Calendar, Clock, Video, X, Edit, Trash2, Check, Play, RefreshCw, AlertTriangle, Users, Mic, MicOff, VideoOff, PhoneOff, Monitor } from "lucide-react";
import "./OnlineClasses.css";

const OnlineClasses = ({ onlineClasses, setOnlineClasses, attendanceRecords, setAttendanceRecords, students, batches, teacherProfile = {} }) => {
  const teacherName = teacherProfile?.name || "Teacher";
  const teacherInitial = teacherName.charAt(0).toUpperCase() || "T";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeCallClassId, setActiveCallClassId] = useState(null);

  // New Class Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Mathematics");
  const [newBatch, setNewBatch] = useState("b1");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("09:00 AM - 10:00 AM");

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

  // WebRTC & Audio Analyser Effect
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

        // Web Audio volume level analyser
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
  const filteredClasses = onlineClasses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || c.status === selectedStatus;
    const matchesSubject = selectedSubject === "all" || c.subject === selectedSubject;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleScheduleClass = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newClass = {
      id: "c" + (onlineClasses.length + 1),
      title: newTitle,
      subject: newSubject,
      batchId: newBatch,
      date: newDate,
      time: newTime,
      status: "upcoming"
    };

    setOnlineClasses([newClass, ...onlineClasses]);
    setShowScheduleModal(false);
    setNewTitle("");
  };

  const handleStartClass = (classId) => {
    const updated = onlineClasses.map((c) => {
      if (c.id === classId) return { ...c, status: "live" };
      return c;
    });
    setOnlineClasses(updated);
    setActiveCallClassId(classId);
    setVideoActive(true);
    setMicActive(true);
  };

  const handleEndClass = () => {
    const liveClass = onlineClasses.find((c) => c.id === activeCallClassId);
    if (!liveClass) return;

    const updatedClasses = onlineClasses.map((c) => {
      if (c.id === activeCallClassId) return { ...c, status: "completed" };
      return c;
    });
    setOnlineClasses(updatedClasses);

    const batchStudents = students.filter((s) => s.batchId === liveClass.batchId);
    const newAttendanceRecord = {
      id: "a" + (attendanceRecords.length + 1),
      date: liveClass.date,
      batchId: liveClass.batchId,
      subject: liveClass.subject,
      teacherStatus: "Submitted",
      onlineClass: true,
      records: {},
      remarks: {}
    };

    batchStudents.forEach((student) => {
      const isPresent = Math.random() > 0.1;
      newAttendanceRecord.records[student.id] = isPresent ? "present" : "absent";
      newAttendanceRecord.remarks[student.id] = isPresent 
        ? "Auto-recorded via live session attendance" 
        : "Absent from live session";
    });

    setAttendanceRecords([newAttendanceRecord, ...attendanceRecords]);
    setActiveCallClassId(null);
    setIsScreenSharing(false);

    alert(`Class ended! Attendance auto-recorded for ${batchStudents.length} students.`);
  };

  const handleCancelClass = (classId) => {
    if (window.confirm("Are you sure you want to cancel this online class?")) {
      const updated = onlineClasses.map((c) => {
        if (c.id === classId) return { ...c, status: "cancelled" };
        return c;
      });
      setOnlineClasses(updated);
    }
  };

  const handleRescheduleClass = (classId) => {
    const newTimePrompt = prompt("Enter new date & time (e.g. 2026-07-31 at 10:00 AM - 11:00 AM):");
    if (newTimePrompt) {
      const parts = newTimePrompt.split(" at ");
      const datePart = parts[0] || new Date().toISOString().split("T")[0];
      const timePart = parts[1] || "10:00 AM - 11:00 AM";

      const updated = onlineClasses.map((c) => {
        if (c.id === classId) return { ...c, date: datePart, time: timePart, status: "upcoming" };
        return c;
      });
      setOnlineClasses(updated);
    }
  };

  // Find active call details
  const activeCallClass = onlineClasses.find((c) => c.id === activeCallClassId);
  const activeCallBatchStudents = activeCallClass ? students.filter((s) => s.batchId === activeCallClass.batchId) : [];

  return (
    <div className="online-classes-container">
      {/* 1. Live Jitsi Call Mock Interface */}
      {activeCallClass && (
        <div className="oc-call-overlay">
          <div className="oc-call-window">
            {/* Header info */}
            <div className="oc-call-header">
              <div className="oc-call-header-left">
                <span className="oc-live-badge">LIVE CALL</span>
                <h3>{activeCallClass.title}</h3>
                <span className="oc-call-subtitle">{activeCallClass.subject} · {batches.find(b => b.id === activeCallClass.batchId)?.name}</span>
              </div>
              <div className="oc-call-header-right">
                <Users size={16} /> <span>{activeCallBatchStudents.length + 1} connected</span>
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
                      {teacherName} {isScreenSharing ? "(Screen Sharing)" : "(You)"}
                    </div>
                  </div>
                ) : (
                  <div className="oc-video-avatar-placeholder">
                    {teacherProfile?.avatar ? (
                      <img src={teacherProfile.avatar} alt="Teacher avatar" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover" }} />
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

              {/* Student Feeds grid */}
              <div className="oc-students-grid">
                {activeCallBatchStudents.map((student) => (
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
                      <Mic size={12} className="mic-on" />
                    </div>
                  </div>
                ))}
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
                <PhoneOff size={20} /> End Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main List View */}
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
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="oc-filter-item">
                  <BookOpen size={14} />
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="all">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
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
                <p>No online classes scheduled. Create one to get started.</p>
              </div>
            ) : (
              filteredClasses.map((c) => {
                const batch = batches.find((b) => b.id === c.batchId);
                const statusLower = c.status.toLowerCase();

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
                            {c.status}
                          </span>
                        </div>
                        <div className="oc-card-meta">
                          <span><strong>Batch:</strong> {batch?.name} ({batch?.grade})</span>
                          <span><strong>Subject:</strong> {c.subject}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right schedules & actions */}
                    <div className="oc-card-right">
                      <div className="oc-card-schedule">
                        <div className="oc-schedule-item">
                          <Calendar size={14} />
                          <span>{new Date(c.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
                          <button className="oc-btn-start call-live-btn" onClick={() => setActiveCallClassId(c.id)}>
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
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div className="oc-form-group">
                  <label>Batch</label>
                  <select value={newBatch} onChange={(e) => setNewBatch(e.target.value)}>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="oc-form-row">
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
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="oc-modal-footer">
                <button type="button" className="oc-btn-secondary" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="oc-btn-primary">
                  Schedule Class
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
