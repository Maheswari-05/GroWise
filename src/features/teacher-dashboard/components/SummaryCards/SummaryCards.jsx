import { GraduationCap, Users, Video, ClipboardCheck, TrendingUp } from "lucide-react";
import "./SummaryCards.css";

const cards = [
  {
    id: "batches",
    icon: GraduationCap,
    title: "Assigned Batches",
    value: "02",
    trend: "+2 this month",
    trendUp: true,
    color: "blue",
  },
  {
    id: "students",
    icon: Users,
    title: "Assigned Students",
    value: "15",
    trend: "+14 new enrollments",
    trendUp: true,
    color: "green",
  },
  {
    id: "classes",
    icon: Video,
    title: "Today's Online Classes",
    value: "04",
    trend: "Next at 11:00 AM",
    trendUp: null,
    color: "purple",
  },
  {
    id: "evaluations",
    icon: ClipboardCheck,
    title: "Pending Evaluations",
    value: "18",
    trend: "6 due today",
    trendUp: false,
    color: "orange",
  },
];

const SummaryCards = () => {
  return (
    <div className="summary-cards">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.id} className={`summary-card summary-card--${card.color}`}>
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
