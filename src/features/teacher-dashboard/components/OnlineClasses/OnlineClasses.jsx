import { useState } from "react";
import { Search, Plus, Filter, BookOpen, Calendar, Clock, Video, X, Edit, Trash2, Check, Play, RefreshCw, AlertTriangle, Users, Mic, MicOff, VideoOff, PhoneOff } from "lucide-react";
import "./OnlineClasses.css";

const OnlineClasses = ({ onlineClasses, setOnlineClasses, attendanceRecords, setAttendanceRecords, students, batches }) => {
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
    // Update class status to live
    const updated = onlineClasses.map((c) => {
      if (c.id === classId) return { ...c, status: "live" };
      return c;
    });
    setOnlineClasses(updated);
    setActiveCallClassId(classId);
  };

  const handleEndClass = () => {
    const liveClass = onlineClasses.find((c) => c.id === activeCallClassId);
    if (!liveClass) return;

    // 1. Update class status to completed
    const updatedClasses = onlineClasses.map((c) => {
      if (c.id === activeCallClassId) return { ...c, status: "completed" };
      return c;
    });
    setOnlineClasses(updatedClasses);

    // 2. Automatically record attendance for students in this batch (simulation)
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

    // Auto mark present (90% chance present for demo, 10% absent)
    batchStudents.forEach((student) => {
      const isPresent = Math.random() > 0.1;
      newAttendanceRecord.records[student.id] = isPresent ? "present" : "absent";
      newAttendanceRecord.remarks[student.id] = isPresent 
        ? "Auto-recorded via live session attendance" 
        : "Absent from live session";
    });

    setAttendanceRecords([newAttendanceRecord, ...attendanceRecords]);
    setActiveCallClassId(null);

    alert(`Class ended! Attendance has been auto-recorded for ${batchStudents.length} students in ${batches.find(b => b.id === liveClass.batchId)?.name || 'Batch'}.`);
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
              {/* Main feed (Teacher - Sarah) */}
              <div className="oc-video-feed teacher-feed">
                {videoActive ? (
                  <div className="oc-video-simulation">
                    <img 
                      src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60" 
                      alt="Teacher video feed" 
                      className="oc-video-img"
                    />
                    <div className="oc-feed-name">Mrs. Sarah (You)</div>
                  </div>
                ) : (
                  <div className="oc-video-avatar-placeholder">
                    <div className="oc-video-avatar-initials">S</div>
                    <div className="oc-feed-name">Mrs. Sarah (Camera Off)</div>
                  </div>
                )}
                <div className="oc-mic-status">
                  {micActive ? <Mic size={14} className="mic-on" /> : <MicOff size={14} className="mic-off" />}
                </div>
              </div>

              {/* Student Feeds grid */}
              <div className="oc-students-grid">
                {activeCallBatchStudents.map((student, i) => (
                  <div key={student.id} className="oc-video-feed student-feed">
                    <div className="oc-video-simulation">
                      {/* Simulating random video feeds */}
                      <img 
                        src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${student.name}&backgroundColor=c0aede`} 
                        alt="Student avatar" 
                        className="oc-student-call-avatar"
                      />
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
              >
                {micActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button 
                className={`oc-control-btn ${!videoActive ? "control-disabled" : ""}`}
                onClick={() => setVideoActive(!videoActive)}
              >
                {videoActive ? <Video size={20} /> : <VideoOff size={20} />}
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
