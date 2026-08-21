import { Video } from "lucide-react";
import "./TodaySchedule.css";

const subjectColors = {
  blue:   { dot: "#2D6BFF", bg: "rgba(45,107,255,0.08)", badge: "rgba(45,107,255,0.12)", text: "#2D6BFF" },
  green:  { dot: "#37C871", bg: "rgba(55,200,113,0.08)", badge: "rgba(55,200,113,0.14)", text: "#27a55e" },
  purple: { dot: "#8b5cf6", bg: "rgba(139,92,246,0.08)", badge: "rgba(139,92,246,0.12)", text: "#7c3aed" },
};

const TodaySchedule = ({ onlineClasses = [], batches = [], setActiveNav }) => {
  const getBatch = (bId) => batches.find((b) => b.id === bId || b.name === bId);

  const colors = ["blue", "green", "purple"];
  const schedule = onlineClasses.length > 0
    ? onlineClasses.slice(0, 4).map((c, i) => {
        const batchObj = getBatch(c.batchId);
        return {
          time: c.time || "09:00 AM",
          subject: c.subject || c.title || "Subject Session",
          grade: batchObj?.grade || "All Grades",
          batch: batchObj?.name || c.batch || "Batch A",
          color: colors[i % colors.length],
        };
      })
    : [
        { time: "09:00 AM", subject: "Mathematics", grade: "Grade 10", batch: "Batch A", color: "blue" },
        { time: "11:00 AM", subject: "Science", grade: "Grade 9", batch: "Batch C", color: "green" },
      ];
  return (
    <div className="td-card today-schedule">
      <div className="td-card-header">
        <h2 className="td-card-title">Today's Schedule</h2>
        <button className="td-view-all-btn" onClick={() => setActiveNav && setActiveNav("classes")}>
          View All
        </button>
      </div>

      <div className="schedule-timeline">
        {schedule.map((item, idx) => {
          const c = subjectColors[item.color];
          return (
            <div key={idx} className="schedule-item">
              {/* Timeline line & dot */}
              <div className="schedule-timeline-col">
                <div className="schedule-dot" style={{ background: c.dot }} />
                {idx < schedule.length - 1 && (
                  <div className="schedule-line" style={{ background: `${c.dot}30` }} />
                )}
              </div>

              {/* Card */}
              <div className="schedule-card" style={{ background: c.bg }}>
                <div className="schedule-card-left">
                  <p className="schedule-time">{item.time}</p>
                  <h3 className="schedule-subject" style={{ color: c.text }}>
                    {item.subject}
                  </h3>
                  <div className="schedule-meta">
                    <span
                      className="schedule-badge"
                      style={{ background: c.badge, color: c.text }}
                    >
                      {item.grade}
                    </span>
                    <span
                      className="schedule-badge"
                      style={{ background: c.badge, color: c.text }}
                    >
                      {item.batch}
                    </span>
                  </div>
                </div>
                <button
                  className="schedule-join-btn"
                  style={{ background: c.text }}
                  onClick={() => setActiveNav && setActiveNav("classes")}
                >
                  <Video size={14} />
                  Join Meeting
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaySchedule;
