import { useState } from "react";
import {
  X, GraduationCap, Star, Users, Heart,
  ArrowRight, Crosshair, BadgeCheck
} from "lucide-react";
import teachers from "./teachersData";
import logo from "../../../../assets/logo.png";
import "./Teachers.css";

const Teachers = () => {
  const [selected, setSelected] = useState(null);

  return (
    <section className="teachers-section" id="teachers">
      {/* ── Decorative dots ── */}
      <div className="teachers-dots teachers-dots--tl" />
      <div className="teachers-dots teachers-dots--tr" />

      {/* ── Header ── */}
      <div className="teachers-header">
        <h2 className="teachers-title">
          Meet Our <span>Teachers</span>
        </h2>
        <p className="teachers-sub">
          Learn from passionate educators—every lesson, a step forward.
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="teachers-content">
        {/* LEFT: Orbital layout */}
        <div className="teachers-orbital">
          {/* Orbit rings */}
          <div className="orbit-ring orbit-ring--1">
            <span className="orbit-dot" style={{ top: 0, left: "50%" }} />
            <span className="orbit-dot" style={{ bottom: 0, left: "50%" }} />
            <div className="sparkle sparkle-1" style={{ top: "20%", left: "80%" }} />
          </div>
          <div className="orbit-ring orbit-ring--2">
            <span className="orbit-dot" style={{ top: "50%", left: 0 }} />
            <span className="orbit-dot" style={{ top: "50%", right: 0 }} />
            <span className="orbit-dot" style={{ top: 0, left: "50%" }} />
            <div className="sparkle sparkle-2" style={{ top: "85%", left: "15%" }} />
          </div>
          <div className="orbit-ring orbit-ring--3">
            <span className="orbit-dot" style={{ top: "50%", left: 0 }} />
            <span className="orbit-dot" style={{ top: "50%", right: 0 }} />
            <div className="sparkle sparkle-3" style={{ top: "15%", left: "20%" }} />
            <div className="sparkle sparkle-4" style={{ top: "80%", left: "70%" }} />
          </div>
          <div className="orbit-ring orbit-ring--4">
            <span className="orbit-dot" style={{ top: 0, left: "50%" }} />
            <span className="orbit-dot" style={{ bottom: 0, left: "50%" }} />
            <div className="sparkle sparkle-5" style={{ top: "60%", left: "5%" }} />
            <div className="sparkle sparkle-6" style={{ top: "10%", left: "90%" }} />
          </div>

          {/* Center logo */}
          <div className="orbital-center">
            <img src={logo} alt="GroWise" />
            <p className="orbital-tagline">
              Every Lesson,<br /><strong>A Step Forward.</strong>
            </p>
            <div className="orbital-underline" />
          </div>

          {/* Teacher nodes */}
          {teachers.map((t, i) => (
            <div
              key={t.id}
              className={`orbital-node ${selected?.id === t.id ? "orbital-node--active" : ""}`}
              style={{
                top: [
                  "28%", "32%", "67%", "78%", "47%"
                ][i],
                left: [
                  "33%", "72%", "79%", "28%", "8%"
                ][i],
              }}
              onClick={() => setSelected(t)}
            >
              {/* Icon badge */}
              <span
                className="orbital-icon-badge"
                style={{ background: t.iconBg, color: t.borderColor }}
              >
                {t.iconElement}
              </span>

              {/* Avatar */}
              <div
                className="orbital-avatar"
                style={{ borderColor: t.borderColor }}
              >
                <img src={t.image} alt={t.name} />
              </div>

              {/* Name card */}
              <div className="orbital-name-card">
                <span className="orbital-name">{t.name.split(" ").slice(0, 2).join(" ")}</span>
                <span className="orbital-subject" style={{ color: t.borderColor }}>
                  {t.subject}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Detail card */}
        <div className={`teacher-detail-card ${selected ? "teacher-detail-card--visible" : ""}`}>
          {selected ? (
            <>
              <button
                className="detail-close"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>

              <div className="detail-header">
                <div
                  className="detail-avatar"
                  style={{ borderColor: selected.borderColor }}
                >
                  <img src={selected.image} alt={selected.name} />
                </div>
                <div className="detail-intro">
                  <h3>
                    {selected.name}{" "}
                    <span className="verified-badge"><BadgeCheck size={14} /></span>
                  </h3>
                  <p className="detail-role">{selected.role}</p>
                  <p className="detail-exp">
                    <GraduationCap size={14} /> {selected.experience}
                  </p>
                </div>
              </div>

              <div className="detail-info-list">
                <div className="detail-info-row">
                  <span className="info-icon info-icon--blue"><GraduationCap size={16} /></span>
                  <div>
                    <strong>Qualification</strong>
                    <p>{selected.qualification}</p>
                  </div>
                </div>
                <div className="detail-info-row">
                  <span className="info-icon info-icon--green"><Crosshair size={16} /></span>
                  <div>
                    <strong>Specialization</strong>
                    <p>{selected.specialization}</p>
                  </div>
                </div>
                <div className="detail-info-row">
                  <span className="info-icon info-icon--amber"><Star size={16} /></span>
                  <div>
                    <strong>Rating</strong>
                    <p>
                      {selected.rating}/5 ({selected.reviews}+ Reviews){" "}
                      <span className="star-row">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            fill={i < Math.round(selected.rating) ? "#f59e0b" : "none"}
                            stroke="#f59e0b"
                          />
                        ))}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="detail-info-row">
                  <span className="info-icon info-icon--cyan"><Users size={16} /></span>
                  <div>
                    <strong>Students Taught</strong>
                    <p>{selected.students}+ Students</p>
                  </div>
                </div>
                <div className="detail-info-row">
                  <span className="info-icon info-icon--pink"><Heart size={16} /></span>
                  <div>
                    <strong>Teaching Style</strong>
                    <p>{selected.teachingStyle}</p>
                  </div>
                </div>
              </div>

              <button className="detail-cta">
                View Courses <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <div className="detail-placeholder">
              <GraduationCap size={48} strokeWidth={1.2} />
              <p>Click on a teacher to view their profile</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Teachers;
