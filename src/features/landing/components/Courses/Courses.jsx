import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { ChevronRight, ArrowRight } from "lucide-react";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";

import CourseCard from "./CourseCard";
import courses from "./coursesData";
import "./Courses.css";

const TABS = [
  "All",
  "Class 1-5",
  "Class 6-8",
  "Class 9-10",
  "Class 11-12",
  "Programming",
  "AI & ML",
  "Web Development",
  "Languages",
  "Competitive Exams",
];

const Courses = () => {
  const [active, setActive] = useState("All");
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  const filtered = active === "All"
    ? courses.filter((c) => c.category === "All")
    : courses.filter((c) => c.category === active);

  return (
    <section className="courses-section" id="courses">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="courses-header">
        <p className="courses-eyebrow">Our Curriculum</p>
        <h2 className="courses-title">
          Explore <span>Courses</span>
        </h2>
        <p className="courses-sub">All subjects. All grades. All skills.</p>
      </div>

      {/* ── Category Tabs ───────────────────────────────────── */}
      <div className="courses-tabs-wrap">
        <div className="courses-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`courses-tab${active === tab ? " active" : ""}`}
              onClick={() => setActive(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Swiper ──────────────────────────────────────────── */}
      <div className="courses-slider-wrap">
        {/* Custom nav buttons */}
        <button ref={setPrevEl} className="swiper-nav swiper-nav--prev" aria-label="Previous">
          <ChevronRight size={20} style={{ transform: "rotate(180deg)" }} />
        </button>
        <button ref={setNextEl} className="swiper-nav swiper-nav--next" aria-label="Next">
          <ChevronRight size={20} />
        </button>

        <Swiper
          modules={[FreeMode, Navigation]}
          freeMode={{ enabled: true, momentum: true }}
          navigation={{ prevEl, nextEl }}
          slidesPerView="auto"
          spaceBetween={24}
          grabCursor
          className="courses-swiper"
        >
          {filtered.map((course) => (
            <SwiperSlide key={course.id} className="courses-slide">
              <CourseCard course={course} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div className="courses-cta">
        <button className="courses-view-all">
          View All Courses <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
};

export default Courses;
