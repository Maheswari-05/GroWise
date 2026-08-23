import { CalendarClock, FileText } from "lucide-react";
import "./UpcomingTests.css";

const UpcomingTests = ({ weeklyTests = [], batches = [], teacherProfile = {}, setActiveNav }) => {
  const getBatch = (bId) => batches.find((b) => b.id === bId || b.name === bId);

  const tests = weeklyTests.length > 0
    ? weeklyTests.slice(0, 3).map((t) => {
        const batchObj = getBatch(t.batchId);
        return {
          subject: t.subject || t.title || "Test",
          when: t.date || "Upcoming",
          grade: batchObj?.grade || batchObj?.name || "All Grades",
        };
      })
    : [
        { subject: "Mathematics", when: "Tomorrow", grade: "Grade 10" },
        { subject: "Science", when: "Friday", grade: "Grade 9" },
      ];
  return (
    <div className="td-card upcoming-tests">
      <div className="td-card-header">
        <h2 className="td-card-title">Upcoming Tests</h2>
        <button className="td-view-all-btn" onClick={() => setActiveNav && setActiveNav("tests")}>
          View All
        </button>
      </div>

      <div className="upcoming-tests__list">
        {tests.map((test, idx) => (
          <div key={idx} className="upcoming-test-item">
            <div className="upcoming-test-icon">
              <FileText size={16} />
            </div>
            <div className="upcoming-test-info">
              <p className="upcoming-test-subject">{test.subject}</p>
              <p className="upcoming-test-grade">{test.grade}</p>
            </div>
            <div className="upcoming-test-when">
              <CalendarClock size={12} />
              <span>{test.when}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create test CTA */}
      <button className="upcoming-test-create-btn" onClick={() => setActiveNav && setActiveNav("tests")}>
        + Schedule New Test
      </button>
    </div>
  );
};

export default UpcomingTests;
