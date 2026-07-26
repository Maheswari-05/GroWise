import { ArrowRight, CalendarDays } from "lucide-react";

const HeroLeft = () => {
  return (
    <div className="hero-left">



      <h1>

        Every Lesson.

        <br />

        <span>A Step Forward.</span>

      </h1>

      <p>

        GroWise is the all-in-one platform that helps tuition centres
        manage students, teachers, classes, courses, attendance,
        assignments, fees and performance—all in one place.

      </p>

      <div className="hero-buttons">

        <button className="hero-primary-btn">

          Get Started

          <ArrowRight size={18} />

        </button>

        <button className="hero-secondary-btn">

          Book a Demo

          <CalendarDays size={18} />

        </button>

      </div>

      
    </div>
  );
};

export default HeroLeft;