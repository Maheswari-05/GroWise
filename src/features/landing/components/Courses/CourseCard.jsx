import { Star, BookOpen, Users } from "lucide-react";

const badgeColors = {
  Bestseller: { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
  Popular:    { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  "Top Rated":{ bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  New:        { bg: "#f0f9ff", text: "#0369a1", border: "#bae6fd" },
  Hot:        { bg: "#fff1f2", text: "#be123c", border: "#fecdd3" },
  Trending:   { bg: "#faf5ff", text: "#7e22ce", border: "#e9d5ff" },
};

const CourseCard = ({ course }) => {
  const badge = course.badge ? badgeColors[course.badge] : null;

  return (
    <div className="course-card">
      {/* Thumbnail */}
      <div className="course-card__thumb">
        <img src={course.image} alt={course.title} />
        {badge && (
          <span
            className="course-card__badge"
            style={{
              background: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
            }}
          >
            {course.badge}
          </span>
        )}
        {/* Colored accent bar */}
        <div
          className="course-card__accent"
          style={{ background: course.color }}
        />
      </div>

      {/* Body */}
      <div className="course-card__body">
        <p className="course-card__grade">{course.grade}</p>
        <h3 className="course-card__title">{course.title}</h3>

        {/* Stats row */}
        <div className="course-card__stats">
          <span className="course-card__stat">
            <BookOpen size={13} />
            {course.lessons} Lessons
          </span>
          <span className="course-card__stat">
            <Users size={13} />
            {course.students}
          </span>
        </div>

        {/* Rating */}
        <div className="course-card__rating">
          <Star size={13} fill="#f59e0b" stroke="none" />
          <span className="course-card__rating-val">{course.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="course-card__footer">
        <img
          src={course.avatar}
          alt={course.teacher}
          className="course-card__avatar"
        />
        <span className="course-card__teacher">{course.teacher}</span>
        <button
          className="course-card__cta"
          style={{ background: course.color }}
        >
          Enroll
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
