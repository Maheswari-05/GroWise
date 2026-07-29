import { Eye, CheckCircle2, Clock3, AlertCircle } from "lucide-react";
import AvatarPlaceholder from "../MyBatches/AvatarPlaceholder";
import "./RecentSubmissions.css";

const submissions = [
  {
    student: "Emma Watson",
    avatar: null,
    assignment: "Chapter 5 Worksheet",
    subject: "Mathematics",
    time: "10 min ago",
    status: "submitted",
  },
  {
    student: "James Smith",
    avatar: null,
    assignment: "Algebra Quiz",
    subject: "Mathematics",
    time: "35 min ago",
    status: "reviewed",
  },
  {
    student: "Sophia Lee",
    avatar: null,
    assignment: "Physics Assignment",
    subject: "Physics",
    time: "1 hour ago",
    status: "pending",
  },
];

const statusConfig = {
  submitted: { label: "Submitted",  icon: CheckCircle2, color: "#2D6BFF", bg: "rgba(45,107,255,0.10)" },
  reviewed:  { label: "Reviewed",   icon: CheckCircle2, color: "#27a55e", bg: "rgba(55,200,113,0.12)" },
  pending:   { label: "Pending",    icon: Clock3,       color: "#ea580c", bg: "rgba(234,88,12,0.10)"  },
};

const RecentSubmissions = () => {
  return (
    <div className="td-card recent-submissions">
      <div className="td-card-header">
        <h2 className="td-card-title">Recent Student Submissions</h2>
        <button className="td-view-all-btn">View All</button>
      </div>

      <div className="rs-table-wrap">
        <table className="rs-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Assignment</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((row, idx) => {
              const s = statusConfig[row.status];
              const StatusIcon = s.icon;
              return (
                <tr key={idx}>
                  <td>
                    <div className="rs-student">
                      <AvatarPlaceholder src={row.avatar} name={row.student} size={32} className="rs-avatar" />
                      <span className="rs-student-name">{row.student}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rs-assignment-cell">
                      <span className="rs-assignment-name">{row.assignment}</span>
                      <span className="rs-subject-tag">{row.subject}</span>
                    </div>
                  </td>
                  <td>
                    <span className="rs-time">{row.time}</span>
                  </td>
                  <td>
                    <span
                      className="rs-status-badge"
                      style={{ color: s.color, background: s.bg }}
                    >
                      <StatusIcon size={11} />
                      {s.label}
                    </span>
                  </td>
                  <td>
                    <button className="rs-action-btn">
                      <Eye size={15} />
                      Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSubmissions;
