import { useState, useEffect } from "react";
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock, Filter, BarChart3 } from "lucide-react";
import * as adminService from "../../../services/adminService";
import "./AttendanceView.css";

const AttendanceView = ({ studentProfile }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedMonth, setSelectedMonth] = useState("All Time");

  useEffect(() => {
    if (studentProfile) {
      fetchAttendance();
    }
  }, [studentProfile]);

  const fetchAttendance = async () => {
    if (!studentProfile) return;

    setLoading(true);
    try {
      const studentId = studentProfile.id || studentProfile.email;
      const result = await adminService.getStudentAttendance(studentId);

      if (result.data) {
        setAttendanceData(result.data);
        setStats(result.stats);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance data
  const filteredAttendance = attendanceData.filter((record) => {
    const matchesSubject = selectedSubject === "All Subjects" || record.subject === selectedSubject;
    
    if (selectedMonth === "All Time") return matchesSubject;
    
    const recordDate = new Date(record.date);
    const currentDate = new Date();
    
    if (selectedMonth === "This Month") {
      return matchesSubject && 
        recordDate.getMonth() === currentDate.getMonth() &&
        recordDate.getFullYear() === currentDate.getFullYear();
    }
    
    if (selectedMonth === "Last 30 Days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      return matchesSubject && recordDate >= thirtyDaysAgo;
    }
    
    return matchesSubject;
  });

  // Calculate filtered stats
  const filteredStats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(a => a.status === "Present").length,
    absent: filteredAttendance.filter(a => a.status === "Absent").length,
    late: filteredAttendance.filter(a => a.status === "Late").length,
    percentage: filteredAttendance.length > 0
      ? Math.round((filteredAttendance.filter(a => a.status === "Present").length / filteredAttendance.length) * 100)
      : 0
  };

  // Get unique subjects
  const subjects = ["All Subjects", ...new Set(attendanceData.map(a => a.subject).filter(Boolean))];

  const getStatusBadge = (status) => {
    const statusConfig = {
      Present: { icon: CheckCircle, color: "#16a34a", bg: "#dcfce7" },
      Absent: { icon: XCircle, color: "#dc2626", bg: "#fee2e2" },
      Late: { icon: Clock, color: "#ea580c", bg: "#ffedd5" }
    };

    const config = statusConfig[status] || statusConfig.Present;
    const Icon = config.icon;

    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 600,
        color: config.color,
        background: config.bg
      }}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="attendance-view-container">
        <div className="attendance-loading">
          <BarChart3 size={48} className="loading-icon" />
          <p>Loading your attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-view-container">
      {/* Header */}
      <div className="attendance-header">
        <div>
          <h2>My Attendance</h2>
          <p>Track your attendance across all classes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="attendance-stats-grid">
        <div className="attendance-stat-card stat-total">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Classes</span>
            <h3 className="stat-value">{filteredStats.total}</h3>
          </div>
        </div>

        <div className="attendance-stat-card stat-present">
          <div className="stat-icon">
            <CheckCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Present</span>
            <h3 className="stat-value">{filteredStats.present}</h3>
          </div>
        </div>

        <div className="attendance-stat-card stat-absent">
          <div className="stat-icon">
            <XCircle size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Absent</span>
            <h3 className="stat-value">{filteredStats.absent}</h3>
          </div>
        </div>

        <div className="attendance-stat-card stat-percentage">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Attendance Rate</span>
            <h3 className="stat-value">{filteredStats.percentage}%</h3>
          </div>
          <div className="stat-progress">
            <div 
              className="stat-progress-bar" 
              style={{ 
                width: `${filteredStats.percentage}%`,
                background: filteredStats.percentage >= 75 ? "#16a34a" : filteredStats.percentage >= 60 ? "#ea580c" : "#dc2626"
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="attendance-filters">
        <div className="filter-group">
          <Filter size={16} />
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="filter-select"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <Calendar size={16} />
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-select"
          >
            <option value="All Time">All Time</option>
            <option value="This Month">This Month</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="attendance-records-card">
        <h3 className="records-title">Attendance History</h3>
        
        {filteredAttendance.length === 0 ? (
          <div className="no-records">
            <Calendar size={48} />
            <p>No attendance records found</p>
            <span>Your attendance will appear here once classes are conducted</span>
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record, index) => (
                  <tr key={record.id || index}>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span className="subject-badge">{record.subject || "N/A"}</span>
                    </td>
                    <td>{record.teacher || "N/A"}</td>
                    <td>
                      {record.isOnlineClass ? (
                        <span className="type-badge online">Online</span>
                      ) : (
                        <span className="type-badge offline">In-Person</span>
                      )}
                    </td>
                    <td>{getStatusBadge(record.status)}</td>
                    <td>
                      {record.durationMinutes ? (
                        <span style={{ fontSize: "13px", color: "#64748b" }}>
                          {record.durationMinutes} min
                        </span>
                      ) : (
                        <span style={{ fontSize: "13px", color: "#94a3b8" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Insights */}
      {filteredStats.total > 0 && (
        <div className="attendance-insights">
          <h3>Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <span className="insight-label">Your attendance rate is</span>
              <span className="insight-value" style={{
                color: filteredStats.percentage >= 75 ? "#16a34a" : filteredStats.percentage >= 60 ? "#ea580c" : "#dc2626"
              }}>
                {filteredStats.percentage >= 75 ? "Excellent" : filteredStats.percentage >= 60 ? "Good" : "Needs Improvement"}
              </span>
            </div>
            
            {filteredStats.percentage < 75 && (
              <div className="insight-card">
                <span className="insight-label">Classes needed for 75%</span>
                <span className="insight-value">
                  {Math.ceil((0.75 * filteredStats.total - filteredStats.present) / 0.25)}
                </span>
              </div>
            )}
            
            {filteredStats.late > 0 && (
              <div className="insight-card">
                <span className="insight-label">Late arrivals</span>
                <span className="insight-value" style={{ color: "#ea580c" }}>
                  {filteredStats.late}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
