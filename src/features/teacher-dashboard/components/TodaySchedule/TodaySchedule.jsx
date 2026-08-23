import { Video } from "lucide-react";
import "./TodaySchedule.css";

const TodaySchedule = ({ onlineClasses = [], batches = [], setActiveNav }) => {
  const getBatch = (bId) => batches.find((b) => b.id === bId || b.name === bId);

  const schedule = onlineClasses.length > 0
    ? onlineClasses.slice(0, 4).map((c) => {
        const batchObj = getBatch(c.batchId);
        return {
          time: c.time || "09:00 AM",
          subject: c.subject || c.title || "Subject Session",
          grade: batchObj?.grade || "All Grades",
          batch: batchObj?.name || c.batch || "Batch A",
        };
      })
    : [
        { time: "09:00 AM", subject: "Mathematics", grade: "Grade 10", batch: "Batch A" },
        { time: "11:00 AM", subject: "Science", grade: "Grade 9", batch: "Batch C" },
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
        {schedule.map((item, idx) => (
          <div key={idx} className="schedule-item">
            {/* Timeline column */}
            <div className="schedule-timeline-col">
              <div className="schedule-dot" />
              {idx < schedule.length - 1 && <div className="schedule-line" />}
            </div>

            {/* Card */}
            <div className="schedule-card">
              <div className="schedule-card-left">
                <p className="schedule-time">{item.time}</p>
                <h3 className="schedule-subject">{item.subject}</h3>
                <div className="schedule-meta">
                  <span className="schedule-badge">{item.grade}</span>
                  <span className="schedule-badge">{item.batch}</span>
                </div>
              </div>
              <button
                className="schedule-join-btn"
                onClick={() => setActiveNav && setActiveNav("classes")}
              >
                <Video size={14} />
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaySchedule;
