import { Video } from "lucide-react";
import "./TodaySchedule.css";

const schedule = [
  {
    time: "09:00 AM",
    subject: "Mathematics",
    grade: "Grade 10",
    batch: "Batch A",
    color: "blue",
    status: "upcoming",
  },
  {
    time: "11:00 AM",
    subject: "Science",
    grade: "Grade 9",
    batch: "Batch C",
    color: "green",
    status: "upcoming",
  },
  {
    time: "02:00 PM",
    subject: "Physics",
    grade: "Grade 11",
    batch: "Batch B",
    color: "purple",
    status: "upcoming",
  },
];

const subjectColors = {
  blue:   { dot: "#2D6BFF", bg: "rgba(45,107,255,0.08)", badge: "rgba(45,107,255,0.12)", text: "#2D6BFF" },
  green:  { dot: "#37C871", bg: "rgba(55,200,113,0.08)", badge: "rgba(55,200,113,0.14)", text: "#27a55e" },
  purple: { dot: "#8b5cf6", bg: "rgba(139,92,246,0.08)", badge: "rgba(139,92,246,0.12)", text: "#7c3aed" },
};

const TodaySchedule = () => {
  return (
    <div className="td-card today-schedule">
      <div className="td-card-header">
        <h2 className="td-card-title">Today's Schedule</h2>
        <button className="td-view-all-btn">View All</button>
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
                <button className="schedule-join-btn" style={{ background: c.text }}>
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
