import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, Video, FlaskConical, Users } from "lucide-react";
import "./WeeklyCalendar.css";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Monday-based start of the week for the given date.
const startOfWeek = (d) => {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Sunday -> previous Monday
  date.setDate(date.getDate() + diff);
  return date;
};

const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Compare a class date string (ISO/local) to an ISO yyyy-mm-dd weekday.
const classOnDate = (dateStr, iso) => {
  if (!dateStr) return false;
  const v = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v === iso;
  const parsed = new Date(v);
  if (isNaN(parsed)) return false;
  return toISODate(parsed) === iso;
};

const normStatus = (s) => String(s || "").trim().toLowerCase();

const statusMeta = (c) => {
  const s = normStatus(c?.status);
  if (s === "live" || s === "live now") return { key: "live", label: "Live Now", color: "#ef4444", bg: "#fef2f2" };
  if (s === "completed") return { key: "completed", label: "Completed", color: "#16a34a", bg: "#f0fdf4" };
  if (s === "cancelled" || s === "cancel") return { key: "cancelled", label: "Cancelled", color: "#64748b", bg: "#f1f5f9" };
  if (s === "missed") return { key: "missed", label: "Missed", color: "#f59e0b", bg: "#fffbeb" };
  return { key: "upcoming", label: "Upcoming", color: "#2D6BFF", bg: "#eff6ff" };
};

const parseTime = (t) => {
  const first = String(t || "").split(" - ")[0].trim();
  const m = first.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
  if (m) {
    let h = parseInt(m[1], 10);
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + parseInt(m[2], 10);
  }
  const m2 = first.match(/(\d{1,2}):(\d{2})/);
  if (m2) return parseInt(m2[1], 10) * 60 + parseInt(m2[2], 10);
  return 0;
};

const WeeklyCalendar = ({ onlineClasses = [], batches = [], setActiveNav }) => {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const getBatch = (bId) => batches.find((b) => String(b.id) === String(bId) || String(b.name) === String(bId));

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const weekISO = useMemo(() => weekDays.map(toISODate), [weekDays]);

  // Classes that fall within the displayed week.
  const weekClasses = useMemo(() => {
    return onlineClasses
      .filter((c) =>
        weekISO.some((iso) => classOnDate(c.date, iso)))
      .sort((a, b) => parseTime(a.time) - parseTime(b.time));
  }, [onlineClasses, weekISO]);

  const classesByDay = useMemo(() => {
    const map = {};
    weekISO.forEach((iso) => { map[iso] = []; });
    weekClasses.forEach((c) => {
      const idx = weekISO.findIndex((iso) => classOnDate(c.date, iso));
      if (idx >= 0) map[weekISO[idx]].push(c);
    });
    return map;
  }, [weekClasses, weekISO]);

  const todayISO = toISODate(new Date());
  const weekRangeLabel = (() => {
    const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const from = weekDays[0];
    const to = weekDays[6];
    const sameMonth = from.getMonth() === to.getMonth();
    return sameMonth
      ? `${fmt(from)} – ${to.getFullYear()}`
      : `${fmt(from)} – ${fmt(to)}, ${to.getFullYear()}`;
  })();

  const goPrev = () => setWeekStart((w) => addDays(w, -7));
  const goNext = () => setWeekStart((w) => addDays(w, 7));
  const goToday = () => setWeekStart(startOfWeek(new Date()));

  const handleOpenClass = () => setActiveNav && setActiveNav("classes");

  const totalCount = weekClasses.length;
  const liveCount = weekClasses.filter((c) => {
    const s = normStatus(c.status);
    return s === "live" || s === "live now";
  }).length;

  return (
    <div className="td-card wc-card">
      <div className="td-card-header">
        <div className="wc-header-title">
          <div className="wc-header-icon">
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="td-card-title">Weekly Classes Calendar</h2>
            <span className="wc-subtitle">Your classes for the week</span>
          </div>
        </div>
        <div className="wc-nav">
          <button className="wc-nav-btn" onClick={goToday}>
            This Week
          </button>
          <button className="wc-nav-btn" onClick={goPrev} aria-label="Previous week">
            <ChevronLeft size={16} />
          </button>
          <button className="wc-nav-btn" onClick={goNext} aria-label="Next week">
            <ChevronRight size={16} />
          </button>
          <span className="wc-range-label">{weekRangeLabel}</span>
        </div>
      </div>

      <div className="wc-layout">
        {/* Calendar — week grid */}
        <div className="wc-calendar">
          {weekDays.map((day, i) => {
            const iso = toISODate(day);
            const dayClasses = classesByDay[iso] || [];
            const isToday = iso === todayISO;
            return (
              <div className={`wc-day ${isToday ? "wc-day--today" : ""}`} key={iso}>
                <div className="wc-day-header">
                  <span className="wc-day-name">{DAY_LABELS[i]}</span>
                  <span className={`wc-day-num ${isToday ? "wc-day-num--today" : ""}`}>{day.getDate()}</span>
                </div>
                <div className="wc-day-body">
                  {dayClasses.length === 0 ? (
                    <div className="wc-day-empty">No classes</div>
                  ) : (
                    dayClasses.map((c) => {
                      const meta = statusMeta(c);
                      const batchObj = getBatch(c.batchId);
                      return (
                        <button
                          className={`wc-class-chip ${meta.key}`}
                          key={c.id}
                          onClick={handleOpenClass}
                          title={`${c.subject || c.title} @ ${c.time}`}
                        >
                          <span className="wc-class-time">
                            <Clock size={11} /> {String(c.time || "").split(" - ")[0].trim() || "TBD"}
                          </span>
                          <span className="wc-class-subject">{c.subject || c.title || "Class"}</span>
                          <span className="wc-class-meta">
                            {batchObj?.grade ? `${batchObj.grade} · ` : ""}{batchObj?.name || c.batch || c.student || "Batch"}
                          </span>
                          <span className="wc-class-status" style={{ color: meta.color, background: meta.bg }}>
                            {meta.label}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar — all classes this week grouped by day */}
        <div className="wc-sidebar">
          <div className="wc-sidebar-header">
            <h3>Classes This Week</h3>
            <span className="wc-count-badge">{totalCount}</span>
          </div>

          {liveCount > 0 && (
            <div className="wc-live-note">
              <span className="wc-live-dot" />
              {liveCount} live {liveCount === 1 ? "class" : "classes"} right now
            </div>
          )}

          <div className="wc-sidebar-list">
            {weekDays.map((day, i) => {
              const iso = toISODate(day);
              const dayClasses = classesByDay[iso] || [];
              if (dayClasses.length === 0) return null;
              const isToday = iso === todayISO;
              return (
                <div className="wc-sidebar-day" key={iso}>
                  <div className="wc-sidebar-day-head">
                    <span className="wc-sidebar-day-name">
                      {DAY_LABELS[i]}
                      {isToday && <em className="wc-today-tag">Today</em>}
                    </span>
                    <span className="wc-sidebar-day-date">
                      {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {dayClasses.map((c) => {
                    const meta = statusMeta(c);
                    const batchObj = getBatch(c.batchId);
                    return (
                      <button className={`wc-sidebar-item ${meta.key}`} key={c.id} onClick={handleOpenClass}>
                        <div className="wc-sidebar-item-time">
                          {String(c.time || "").split(" - ")[0].trim() || "TBD"}
                        </div>
                        <div className="wc-sidebar-item-info">
                          <div className="wc-sidebar-item-title">
                            <Video size={13} />
                            {c.subject || c.title || "Class"}
                          </div>
                          <div className="wc-sidebar-item-meta">
                            <span><Users size={11} /> {batchObj?.name || c.batch || c.student || "Batch"}</span>
                            {batchObj?.grade && <span><FlaskConical size={11} /> {batchObj.grade}</span>}
                          </div>
                        </div>
                        <span className="wc-sidebar-item-status" style={{ color: meta.color, background: meta.bg }}>
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {totalCount === 0 && (
              <div className="wc-sidebar-empty">
                <Calendar size={26} />
                <p>No classes scheduled for this week.</p>
                <button className="td-view-all-btn" onClick={handleOpenClass}>Schedule / View Classes</button>
              </div>
            )}
          </div>

          <button className="wc-sidebar-footer-btn" onClick={handleOpenClass}>
            Manage Online Classes <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
