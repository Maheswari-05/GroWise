import { GraduationCap, Users, Video, ClipboardCheck } from "lucide-react";
import "./SummaryCards.css";

const SummaryCards = ({ batches = [], students = [], onlineClasses = [], assignments = [], teacherProfile = {}, setActiveNav }) => {
  const batchCount = batches.length;
  const studentCount = students.length;

  const todayClassesCount = onlineClasses.filter(
    (c) => c.status === "upcoming" || c.status === "live" || c.date === "Today"
  ).length;

  let pendingCount = 0;
  assignments.forEach((a) => {
    if (a.submissions && Array.isArray(a.submissions)) {
      pendingCount += a.submissions.filter((s) => s.status === "submitted" || s.status === "pending").length;
    }
  });

  const navTargetMap = {
    batches: "batches",
    students: "batches",
    classes: "classes",
    evaluations: "assignments",
  };

  const cards = [
    {
      id: "batches",
      icon: GraduationCap,
      title: "Assigned Batches",
      value: batchCount,
      color: "blue",
    },
    {
      id: "students",
      icon: Users,
      title: "Assigned Students",
      value: studentCount,
      color: "green",
    },
    {
      id: "classes",
      icon: Video,
      title: "Today's Online Classes",
      value: todayClassesCount,
      color: "purple",
    },
    {
      id: "evaluations",
      icon: ClipboardCheck,
      title: "Pending Evaluations",
      value: pendingCount,
      color: "orange",
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card) => {
        const Icon = card.icon;
        const targetNav = navTargetMap[card.id];
        return (
          <div
            key={card.id}
            className={`summary-card summary-card--${card.color}`}
            onClick={() => setActiveNav && targetNav && setActiveNav(targetNav)}
            style={{ cursor: "pointer" }}
          >
            {/* Icon Container */}
            <div className={`summary-card__icon-wrap summary-card__icon-wrap--${card.color}`}>
              <Icon size={22} />
            </div>

            {/* Content */}
            <div className="summary-card__content">
              <p className="summary-card__title">{card.title}</p>
              <p className="summary-card__value">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
