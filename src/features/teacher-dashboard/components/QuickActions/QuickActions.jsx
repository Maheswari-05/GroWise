import { PlusCircle, Upload, ClipboardEdit, Video, ClipboardCheck, PenLine, BarChart3 } from "lucide-react";
import "./QuickActions.css";

const actions = [
  {
    icon: Upload,
    title: "Upload Material",
    navTarget: "materials",
  },
  {
    icon: ClipboardEdit,
    title: "Create Assignment",
    navTarget: "assignments",
  },
  {
    icon: Video,
    title: "Schedule Class",
    navTarget: "classes",
  },
  {
    icon: ClipboardCheck,
    title: "Take Attendance",
    navTarget: "attendance",
  },
  {
    icon: PenLine,
    title: "Create Test",
    navTarget: "tests",
  },
  {
    icon: BarChart3,
    title: "View Reports",
    navTarget: "reports",
  },
];

const QuickActions = ({ setActiveNav }) => {
  return (
    <div className="quick-actions-section">
      <h3 className="quick-actions-title">Quick Actions</h3>
      <div className="quick-actions-grid">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="quick-action-btn"
            onClick={() => setActiveNav && action.navTarget && setActiveNav(action.navTarget)}
          >
            <PlusCircle size={18} />
            <span>{action.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
