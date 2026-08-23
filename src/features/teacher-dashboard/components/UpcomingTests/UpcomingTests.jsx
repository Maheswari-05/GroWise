import { CalendarClock, BookOpen, FlaskConical, Atom, FileText } from "lucide-react";
import "./UpcomingTests.css";

const colorMap = {
  blue:   { bg: "rgba(45,107,255,0.08)",   badge: "rgba(45,107,255,0.12)",   text: "#2D6BFF",  border: "rgba(45,107,255,0.15)"  },
  green:  { bg: "rgba(55,200,113,0.08)",   badge: "rgba(55,200,113,0.14)",   text: "#27a55e",  border: "rgba(55,200,113,0.18)"  },
  purple: { bg: "rgba(139,92,246,0.08)",   badge: "rgba(139,92,246,0.12)",   text: "#7c3aed",  border: "rgba(139,92,246,0.16)"  },
};

const renderSubjectIcon = (subject, colorText) => {
  const s = String(subject || "").toLowerCase();
  if (s.includes("math")) return <BookOpen size={18} style={{ color: colorText }} />;
  if (s.includes("science") || s.includes("chem")) return <FlaskConical size={18} style={{ color: colorText }} />;
  if (s.includes("phys")) return <Atom size={18} style={{ color: colorText }} />;
  return <FileText size={18} style={{ color: colorText }} />;
};

const UpcomingTests = ({ weeklyTests = [], batches = [], teacherProfile = {}, setActiveNav }) => {
  const getBatch = (bId) => batches.find((b) => b.id === bId || b.name === bId);
  const colors = ["blue", "green", "purple"];
  const subjects = teacherProfile.subjects || ["Mathematics", "Science"];

  // Generate one upcoming test for each subject the teacher teaches
  const tests = subjects.map((sub, i) => {
    const matchingTest = weeklyTests.find(t => t.subject === sub);
    const batchObj = batches.find(b => b.subject === sub) || batches[0];

    return {
      subject: sub,
      when: matchingTest?.date || (i === 0 ? "Tomorrow" : i === 1 ? "Friday" : "Next Monday"),
      grade: batchObj?.grade || "All Grades",
      color: colors[i % colors.length],
    };
  });
  return (
    <div className="td-card upcoming-tests">
      <div className="td-card-header">
        <h2 className="td-card-title">Upcoming Tests</h2>
        <button className="td-view-all-btn" onClick={() => setActiveNav && setActiveNav("tests")}>
          View All
        </button>
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
              <div className="upcoming-test-icon">{renderSubjectIcon(test.subject, c.text)}</div>
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
      <button className="upcoming-test-create-btn" onClick={() => setActiveNav && setActiveNav("tests")}>
        + Schedule New Test
      </button>
    </div>
  );
};

export default UpcomingTests;
