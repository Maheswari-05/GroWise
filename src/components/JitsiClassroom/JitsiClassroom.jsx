import { useState, useEffect, useRef } from "react";
import {
  Video,
  X,
  ExternalLink,
  Users,
  CheckCircle,
  Clock,
  BookOpen,
  Maximize2,
  Minimize2,
  ShieldCheck
} from "lucide-react";
import "./JitsiClassroom.css";

export const generateJitsiRoomName = (classObj) => {
  if (!classObj) return "GroWise_Class_Live";
  const sanitize = (str) => String(str || "").replace(/[^a-zA-Z0-9]/g, "");
  const subject = sanitize(classObj.subject || "Subject");
  const batch = sanitize(classObj.student || classObj.batchName || classObj.batchId || "Batch");
  const id = sanitize(classObj.id || "1");
  return `GroWise_${subject}_${batch}_${id}`;
};

export default function JitsiClassroom({
  classData,
  userProfile,
  isTeacher = false,
  onLeave,
  onEndClass
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const containerRef = useRef(null);

  const roomName = generateJitsiRoomName(classData);
  const userName = isTeacher
    ? `${userProfile?.name || "Teacher"} (Host)`
    : `${userProfile?.name || "Student"}`;

  // Build Jitsi meet iframe URL
  const jitsiDomain = "meet.jit.si";
  const jitsiConfig = [
    `userInfo.displayName="${encodeURIComponent(userName)}"`,
    "config.prejoinPageEnabled=false",
    "config.startWithAudioMuted=false",
    "config.startWithVideoMuted=false",
    "config.disableDeepLinking=true",
    "config.enableWelcomePage=false",
    "config.enableClosePage=false",
    "config.defaultRemoteDisplayName='GroWise Member'",
  ].join("&");

  const jitsiUrl = `https://${jitsiDomain}/${roomName}#${jitsiConfig}`;

  // Track timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="jitsi-modal-overlay" ref={containerRef}>
      {/* Top GroWise Live Classroom Header */}
      <header className="jitsi-classroom-header">
        <div className="jitsi-header-left">
          <div className="jitsi-live-indicator">
            <span className="jitsi-live-dot" />
            <span>LIVE CLASS</span>
          </div>

          <div className="jitsi-class-details">
            <h2 className="jitsi-class-title">{classData?.title || "Live Class Session"}</h2>
            <div className="jitsi-class-badges">
              <span className="jitsi-badge">
                <BookOpen size={13} /> {classData?.subject || "Subject"}
              </span>
              <span className="jitsi-badge">
                <Users size={13} /> {classData?.student || classData?.batchName || "Assigned Batch"}
              </span>
              <span className="jitsi-badge teacher-badge">
                <strong>Teacher:</strong> {classData?.teacher || "Faculty"}
              </span>
            </div>
          </div>
        </div>

        <div className="jitsi-header-right">
          <div className="jitsi-attendance-badge" title="Attendance automatically recorded for this session">
            <ShieldCheck size={15} style={{ color: "#22c55e" }} />
            <span>Attendance Logged Automatically</span>
          </div>

          <div className="jitsi-timer-badge">
            <Clock size={14} />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            className="jitsi-action-icon-btn"
            onClick={() => window.open(jitsiUrl, "_blank")}
            title="Open Meet in new window"
          >
            <ExternalLink size={16} />
          </button>

          <button
            className="jitsi-action-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {isTeacher ? (
            <div className="jitsi-teacher-actions">
              <button className="jitsi-btn-leave" onClick={onLeave}>
                Leave Meet
              </button>
              {onEndClass && (
                <button className="jitsi-btn-end" onClick={onEndClass}>
                  End Class for All
                </button>
              )}
            </div>
          ) : (
            <button className="jitsi-btn-leave" onClick={onLeave}>
              Leave Meet
            </button>
          )}
        </div>
      </header>

      {/* Embedded Jitsi Meet Container */}
      <main className="jitsi-frame-container">
        <iframe
          src={jitsiUrl}
          title="GroWise Jitsi Live Classroom"
          className="jitsi-iframe"
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; ambient-light-sensor; speaker"
        />
      </main>
    </div>
  );
}
