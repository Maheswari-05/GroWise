
import logo from "../../../../assets/logo.png";
import gradBooksImg from "../../../../assets/grad_book.png";
import contactRightImg from "../../../../assets/contactright.png";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Award,
  Globe,
  Headphones,
  ExternalLink,
  Star,
  Heart,
} from "lucide-react";
import "./Footer.css";

const Footer = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      {/* ===== CTA Banner ===== */}
      <div className="footer-cta-section">
        <div className="footer-cta-banner">
          {/* Left 3D Graduation Cap Graphic */}
          <div className="footer-cta-left-graphic">
            <div className="footer-cta-cap-wrapper">
              <img src={gradBooksImg} alt="Graduation Cap and Books" />
            </div>
          </div>

          {/* Center Content */}
          <div className="footer-cta-center">
            <h2>Ready to Transform Your Tuition Centre?</h2>
            <p>Join hundreds of centres already growing with GroWise.</p>

            <div className="footer-cta-buttons">
              <button className="footer-cta-btn-start" onClick={() => onNavigate && onNavigate("login")}>
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </button>
              <button className="footer-cta-btn-demo" onClick={() => onNavigate && onNavigate("contact")}>
                <span>Book a Demo</span>
                <Calendar size={18} />
              </button>
            </div>
          </div>

          {/* Right Graphic */}
          <div className="footer-cta-right-graphic">
            <img src={contactRightImg} alt="Contact graphic" className="footer-cta-right-img" />
          </div>
        </div>
      </div>

      {/* ===== Main Footer Content ===== */}
      <div className="footer-container">
        <div className="footer-grid">
          {/* ── Column 1: Brand + Logo ── */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <img src={logo} alt="GroWise Logo" />
              <span className="footer-logo-text">GroWise</span>
            </div>
            <div className="footer-tagline">
              <span className="tagline-text">Every Lesson. <span className="tagline-highlight">A Step Forward.</span></span>
            </div>
            <p className="footer-description">
              The all-in-one platform for tuition centers to manage students, teachers, billing, and performance seamlessly.
            </p>


          </div>

          {/* ── Column 2: Platform Links ── */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links-list">
              <li><a href="#courses"><BookOpen size={14} className="footer-link-icon" /><span>Courses</span></a></li>
              <li><a href="#teachers"><Users size={14} className="footer-link-icon" /><span>Expert Tutors</span></a></li>
              <li><a href="#dashboard"><Globe size={14} className="footer-link-icon" /><span>Student Portal</span></a></li>
              <li><a href="#attendance"><Clock size={14} className="footer-link-icon" /><span>Attendance</span></a></li>
              <li><a href="#pricing"><Star size={14} className="footer-link-icon" /><span>Pricing</span></a></li>
            </ul>
          </div>

          {/* ── Column 3: Resources Links ── */}
          <div className="footer-links-col">
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-links-list">
              <li><a href="#about"><Award size={14} className="footer-link-icon" /><span>About Us</span></a></li>
              <li><a href="#blog"><ExternalLink size={14} className="footer-link-icon" /><span>Blog</span></a></li>
              <li><a href="#guides"><BookOpen size={14} className="footer-link-icon" /><span>Guides</span></a></li>
              <li><a href="#testimonials"><Heart size={14} className="footer-link-icon" /><span>Stories</span></a></li>
              <li><a href="#faq"><Headphones size={14} className="footer-link-icon" /><span>FAQ</span></a></li>
            </ul>
          </div>

          {/* ── Column 4: Get In Touch ── */}
          <div className="footer-contact-col">
            <h4 className="footer-heading">Get In Touch</h4>

            <div className="footer-contact-items">
              <a href="mailto:support@growise.edu" className="footer-contact-item">
                <div className="footer-contact-icon-box">
                  <Mail size={16} />
                </div>
                <div className="footer-contact-info">
                  <span className="footer-contact-label">Email Us</span>
                  <span className="footer-contact-value">growiselearningstudio@gmail.com</span>
                </div>
              </a>

              <a href="tel:+914424345678" className="footer-contact-item">
                <div className="footer-contact-icon-box">
                  <Phone size={16} />
                </div>
                <div className="footer-contact-info">
                  <span className="footer-contact-label">Call Us</span>
                  <span className="footer-contact-value">+91 44 2434 5678</span>
                </div>
              </a>

              <div className="footer-contact-item">
                <div className="footer-contact-icon-box">
                  <MapPin size={16} />
                </div>
                <div className="footer-contact-info">
                  <span className="footer-contact-label">Visit Us</span>
                  <span className="footer-contact-value">No. 42, Ram Nagar, Guindy, Chennai-600032</span>
                </div>
              </div>


            </div>


          </div>
        </div>

        {/* ===== Bottom Bar ===== */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-left">
            <div className="footer-copyright">
              <p>&copy; {currentYear} GroWise Inc. All rights reserved.</p>
            </div>
            <div className="footer-legal-links">
              <a href="#privacy">Privacy Policy</a>
              <span className="legal-dot">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="legal-dot">•</span>
              <a href="#security">Security</a>
            </div>
          </div>

          <div className="footer-bottom-right">
            <button className="back-to-top-btn" onClick={scrollToTop} title="Back to top">
              <span>Back to top</span>
              <ArrowUp size={15} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
