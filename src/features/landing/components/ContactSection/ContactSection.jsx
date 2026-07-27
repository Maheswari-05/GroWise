import React from "react";
import { ArrowRight, Calendar } from "lucide-react";
import gradBooksImg from "../../../../assets/grad_book.png";
import contactRightImg from "../../../../assets/contactright.png";
import "./ContactSection.css";

const ContactSection = ({ onNavigate }) => {
  return (
    <section className="contact-banner-section" id="contact">
      {/* Top Carousel Dots */}
      <div className="banner-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>

      {/* Main Banner Card */}
      <div className="banner-card">
        {/* Left 3D Graduation Cap Graphic */}
        <div className="banner-left-graphic">
          <div className="cap-img-wrapper">
            <img src={gradBooksImg} alt="Graduation Cap and Books" />
          </div>
        </div>

        {/* Center Content */}
        <div className="banner-center-content">
          <h2>Your Journey to Better Learning Starts Here</h2>
          <p>Join thousands of students learning smarter, tracking their progress, and achieving their goals with GroWise.</p>

          <div className="banner-buttons">
            <button className="btn-get-started" onClick={() => onNavigate && onNavigate("login")}>
              <span>Get Started Now</span>
              <ArrowRight size={18} />
            </button>
            <button className="btn-book-demo">
              <span>Book a Demo</span>
              <Calendar size={18} />
            </button>
          </div>
        </div>

        {/* Right Graphic: Contact Right Image */}
        <div className="banner-right-graphic">
          <img src={contactRightImg} alt="Contact graphic" className="banner-right-img" />
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
