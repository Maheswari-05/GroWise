import {
  Upload,
  ClipboardEdit,
  Video,
  ClipboardCheck,
  PenLine,
  BarChart3,
} from "lucide-react";
import "./QuickActions.css";

const actions = [
  {
    icon: Upload,
    title: "Upload Study Material",
    desc: "Share notes & resources",
    color: "blue",
  },
  {
    icon: ClipboardEdit,
    title: "Create Assignment",
    desc: "Assign work to students",
    color: "green",
  },
  {
    icon: Video,
    title: "Schedule Online Class",
    desc: "Set up a live session",
    color: "purple",
  },
  {
    icon: ClipboardCheck,
    title: "Take Attendance",
    desc: "Mark today's attendance",
    color: "teal",
  },
  {
    icon: PenLine,
    title: "Create Weekly Test",
    desc: "Design assessments",
    color: "orange",
  },
  {
    icon: BarChart3,
    title: "View Reports",
    desc: "Analytics & insights",
    color: "indigo",
  },
];

const colorMap = {
  blue:   { icon: "#2D6BFF", iconBg: "rgba(45,107,255,0.10)",  gradient: "linear-gradient(135deg,#2D6BFF,#5b8eff)" },
  green:  { icon: "#27a55e", iconBg: "rgba(55,200,113,0.12)",  gradient: "linear-gradient(135deg,#37C871,#27a55e)" },
  purple: { icon: "#7c3aed", iconBg: "rgba(139,92,246,0.10)",  gradient: "linear-gradient(135deg,#8b5cf6,#6d28d9)" },
  teal:   { icon: "#0d9488", iconBg: "rgba(13,148,136,0.10)",   gradient: "linear-gradient(135deg,#14b8a6,#0d9488)" },
  orange: { icon: "#ea580c", iconBg: "rgba(234,88,12,0.10)",   gradient: "linear-gradient(135deg,#f97316,#ea580c)" },
  indigo: { icon: "#4f46e5", iconBg: "rgba(79,70,229,0.10)",   gradient: "linear-gradient(135deg,#6366f1,#4f46e5)" },
};

const actionNavMap = {
  "Upload Study Material": "materials",
  "Create Assignment": "assignments",
  "Schedule Online Class": "classes",
  "Take Attendance": "attendance",
  "Create Weekly Test": "tests",
  "View Reports": "reports",
};

const QuickActions = ({ setActiveNav }) => {
  return (
    <div className="quick-actions-section">
      <div className="quick-actions-header">
        <h2 className="td-card-title">Quick Actions</h2>
        <p className="quick-actions-sub">Everything you need at your fingertips</p>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action, idx) => {
          const c = colorMap[action.color];
          const Icon = action.icon;
          const targetNav = actionNavMap[action.title];
          return (
            <button
              key={idx}
              className="quick-action-card"
              style={{ "--action-gradient": c.gradient }}
              onClick={() => setActiveNav && targetNav && setActiveNav(targetNav)}
            >
              <div
                className="quick-action-icon"
                style={{ background: c.iconBg, color: c.icon }}
              >
                <Icon size={26} />
              </div>
              <div className="quick-action-text">
                <p className="quick-action-title">{action.title}</p>
                <p className="quick-action-desc">{action.desc}</p>
              </div>
              <div className="quick-action-arrow">→</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
