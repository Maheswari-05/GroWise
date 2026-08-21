import { GraduationCap, Users, Video, ClipboardCheck, TrendingUp } from "lucide-react";
import "./SummaryCards.css";

const SummaryCards = ({ batches = [], students = [], onlineClasses = [], assignments = [], setActiveNav }) => {
  const batchCount = String(batches.length).padStart(2, "0");
  const studentCount = String(students.length).padStart(2, "0");

  const todayClassesCount = String(
    onlineClasses.filter((c) => c.status === "upcoming" || c.status === "live" || c.date === "Today").length
  ).padStart(2, "0");

  let pendingCount = 0;
  assignments.forEach((a) => {
    if (a.submissions && Array.isArray(a.submissions)) {
      pendingCount += a.submissions.filter((s) => s.status === "submitted" || s.status === "pending").length;
    }
  });
  const pendingFormatted = String(pendingCount).padStart(2, "0");

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
      trend: "Active batches",
      trendUp: true,
      color: "blue",
    },
    {
      id: "students",
      icon: Users,
      title: "Assigned Students",
      value: studentCount,
      trend: "Total enrolled",
      trendUp: true,
      color: "green",
    },
    {
      id: "classes",
      icon: Video,
      title: "Today's Online Classes",
      value: todayClassesCount,
      trend: "Scheduled today",
      trendUp: null,
      color: "purple",
    },
    {
      id: "evaluations",
      icon: ClipboardCheck,
      title: "Pending Evaluations",
      value: pendingFormatted,
      trend: "Submissions to review",
      trendUp: false,
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

            {/* Trend */}
            <div className="summary-card__trend">
              <TrendingUp
                size={12}
                className={`summary-card__trend-icon ${
                  card.trendUp === true
                    ? "trend-up"
                    : card.trendUp === false
                    ? "trend-down"
                    : "trend-neutral"
                }`}
              />
              <span
                className={`summary-card__trend-text ${
                  card.trendUp === true
                    ? "trend-up"
                    : card.trendUp === false
                    ? "trend-down"
                    : "trend-neutral"
                }`}
              >
                {card.trend}
              </span>
            </div>

            {/* Background decoration */}
            <div className={`summary-card__bg-deco summary-card__bg-deco--${card.color}`} />
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
