import { CalendarClock } from "lucide-react";
import "./UpcomingTests.css";

const tests = [
  {
    subject: "Mathematics",
    when: "Tomorrow",
    grade: "Grade 10",
    color: "blue",
    icon: "📐",
  },
  {
    subject: "Science",
    when: "Friday",
    grade: "Grade 9",
    color: "green",
    icon: "🔬",
  },
  {
    subject: "Physics",
    when: "Monday",
    grade: "Grade 11",
    color: "purple",
    icon: "⚛️",
  },
];

const colorMap = {
  blue:   { bg: "rgba(45,107,255,0.08)",   badge: "rgba(45,107,255,0.12)",   text: "#2D6BFF",  border: "rgba(45,107,255,0.15)"  },
  green:  { bg: "rgba(55,200,113,0.08)",   badge: "rgba(55,200,113,0.14)",   text: "#27a55e",  border: "rgba(55,200,113,0.18)"  },
  purple: { bg: "rgba(139,92,246,0.08)",   badge: "rgba(139,92,246,0.12)",   text: "#7c3aed",  border: "rgba(139,92,246,0.16)"  },
};

const UpcomingTests = () => {
  return (
    <div className="td-card upcoming-tests">
      <div className="td-card-header">
        <h2 className="td-card-title">Upcoming Tests</h2>
        <button className="td-view-all-btn">View All</button>
      </div>

      <div className="upcoming-tests__list">
        {tests.map((test, idx) => {
          const c = colorMap[test.color];
          return (
            <div
              key={idx}
              className="upcoming-test-item"
              style={{
                background: c.bg,
                borderColor: c.border,
              }}
            >
              <div className="upcoming-test-icon">{test.icon}</div>
              <div className="upcoming-test-info">
                <p className="upcoming-test-subject" style={{ color: c.text }}>
                  {test.subject}
                </p>
                <p className="upcoming-test-grade">{test.grade}</p>
              </div>
              <div className="upcoming-test-when">
                <CalendarClock size={13} style={{ color: c.text }} />
                <span style={{ color: c.text }}>{test.when}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create test CTA */}
      <button className="upcoming-test-create-btn">
        + Schedule New Test
      </button>
    </div>
  );
};

export default UpcomingTests;
