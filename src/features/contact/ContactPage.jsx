import { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import logo from "../../assets/logo.png";
import contactIllustration from "../../assets/contact_demo.png";
import supabase from "../../lib/supabase";
import "./ContactPage.css";

const ContactPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "Student",
    preferredDate: "",
    preferredTime: "Afternoon (2:00 PM - 5:00 PM)",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Record a notification in Supabase for Admin awareness
      const notifMsg = `📅 Demo Request: ${formData.fullName} (${formData.role}) - ${formData.phone}`;
      await supabase.from("notifications").insert({
        type: "batch",
        message: notifMsg,
        time: "Just now"
      });
    } catch (err) {
      console.warn("Could not log notification to Supabase:", err);
    }

    // Simulate quick server response
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 600);
  };

  return (
    <div className="contact-page-root">
      {/* ── Top Navigation Bar ── */}
      <header className="contact-nav-header">
        <div className="contact-nav-container">
          <div className="contact-nav-brand" onClick={() => onNavigate("landing")}>
            <img src={logo} alt="GroWise Logo" className="contact-nav-logo" />
            <span className="contact-nav-title">GroWise</span>
          </div>

          <div className="contact-nav-actions">
            <button 
              className="contact-back-home-btn"
              onClick={() => onNavigate("landing")}
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
            <button 
              className="contact-signin-btn"
              onClick={() => onNavigate("role-selector")}
            >
              <span>Sign In</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Contact / Demo Hero & Form ── */}
      <main className="contact-main-content">
        <div className="contact-content-container">

          {isSubmitted ? (
            /* ── Success Confirmation Screen ── */
            <div className="contact-success-card animate-scale-up">
              <div className="success-icon-badge">
                <CheckCircle2 size={44} />
              </div>
              <h2>Demo Request Confirmed!</h2>
              <p className="success-subtext">
                Thank you, <strong>{formData.fullName}</strong>! We've received your demo booking request.
              </p>

              <div className="success-summary-box">
                <div className="summary-item">
                  <span className="summary-label">Contact Email:</span>
                  <span className="summary-val">{formData.email}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Contact Phone:</span>
                  <span className="summary-val">{formData.phone}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Role:</span>
                  <span className="summary-val">{formData.role}</span>
                </div>
                {formData.preferredDate && (
                  <div className="summary-item">
                    <span className="summary-label">Preferred Date:</span>
                    <span className="summary-val">{formData.preferredDate}</span>
                  </div>
                )}
                <div className="summary-item">
                  <span className="summary-label">Preferred Slot:</span>
                  <span className="summary-val">{formData.preferredTime}</span>
                </div>
              </div>

              <div className="success-next-steps">
                <p>
                  Our senior education consultant will contact you via email & WhatsApp within <strong>2 business hours</strong> to share the custom demo link.
                </p>
              </div>

              <div className="success-action-buttons">
                <button 
                  className="success-btn-primary"
                  onClick={() => onNavigate("landing")}
                >
                  <ArrowLeft size={16} />
                  <span>Return to Homepage</span>
                </button>
                <button 
                  className="success-btn-secondary"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      fullName: "",
                      email: "",
                      phone: "",
                      role: "Student",
                      preferredDate: "",
                      preferredTime: "Afternoon (2:00 PM - 5:00 PM)",
                      message: ""
                    });
                  }}
                >
                  <span>Book Another Demo</span>
                </button>
              </div>
            </div>
          ) : (
            /* ── Split Layout: Visual & Form ── */
            <div className="contact-split-grid">
              
              {/* ── Left Column: Visuals & Contact Info ── */}
              <div className="contact-visual-column">
                <h1 className="contact-hero-heading">
                  See GroWise in Action for Your <span className="gradient-highlight">Tuition Centre</span>
                </h1>

                <p className="contact-hero-desc">
                  Discover how GroWise automates attendance, student progress tracking, live batches, weekly tests, and fee notifications in one seamless platform.
                </p>

                {/* Uploaded User Illustration */}
                <div className="contact-illustration-card">
                  <div className="illustration-wrapper">
                    <img 
                      src={contactIllustration} 
                      alt="Contact and Book Demo with GroWise" 
                      className="contact-feature-img"
                    />
                  </div>
                </div>

                {/* Value Highlights Pill Chips */}
                <div className="contact-perks-list">
                  <div className="contact-perk-item">
                    <div className="perk-icon-wrap">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4>Customized To Your Scale</h4>
                      <p>Personalized walkthrough for small batches to multi-branch academies.</p>
                    </div>
                  </div>

                  <div className="contact-perk-item">
                    <div className="perk-icon-wrap">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h4>30-Minute Zero-Hassle Session</h4>
                      <p>Get all your questions answered live by tuition tech specialists.</p>
                    </div>
                  </div>
                </div>

                {/* Direct Contact Channels */}
                <div className="direct-contact-bar">
                  <div className="direct-item">
                    <Mail size={16} className="direct-icon" />
                    <span>support@growise.edu</span>
                  </div>
                  <div className="direct-item">
                    <Phone size={16} className="direct-icon" />
                    <span>+91 44 2434 5678</span>
                  </div>
                  <div className="direct-item">
                    <MapPin size={16} className="direct-icon" />
                    <span>Guindy, Chennai, India</span>
                  </div>
                </div>
              </div>

              {/* ── Right Column: Booking Form ── */}
              <div className="contact-form-column">
                <div className="contact-form-card">
                  <div className="form-card-header">
                    <h2>Schedule Your Free Demo</h2>
                  </div>

                  <form className="booking-form" onSubmit={handleSubmit}>
                    
                    {/* Row 1: Name & Email */}
                    <div className="form-row two-col">
                      <div className="form-group">
                        <label htmlFor="fullName">Full Name <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <User size={18} className="field-icon" />
                          <input 
                            id="fullName"
                            type="text" 
                            name="fullName"
                            placeholder="e.g. Dr. Rajesh Kumar"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email Address <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Mail size={18} className="field-icon" />
                          <input 
                            id="email"
                            type="email" 
                            name="email"
                            placeholder="rajesh@growisecentre.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Phone & Role */}
                    <div className="form-row two-col">
                      <div className="form-group">
                        <label htmlFor="phone">Phone / WhatsApp Number <span className="req">*</span></label>
                        <div className="input-with-icon">
                          <Phone size={18} className="field-icon" />
                          <input 
                            id="phone"
                            type="tel" 
                            name="phone"
                            placeholder="+91 98765 43210"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="role">Your Role <span className="req">*</span></label>
                        <select 
                          id="role" 
                          name="role" 
                          value={formData.role} 
                          onChange={handleChange}
                        >
                          <option value="Student">Student</option>
                          <option value="Teacher">Teacher</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 4: Preferred Date & Time */}
                    <div className="form-row two-col">
                      <div className="form-group">
                        <label htmlFor="preferredDate">Preferred Demo Date</label>
                        <div className="input-with-icon">
                          <Calendar size={18} className="field-icon" />
                          <input 
                            id="preferredDate"
                            type="date" 
                            name="preferredDate"
                            value={formData.preferredDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="preferredTime">Preferred Time Slot</label>
                        <div className="input-with-icon">
                          <Clock size={18} className="field-icon" />
                          <select 
                            id="preferredTime" 
                            name="preferredTime" 
                            value={formData.preferredTime} 
                            onChange={handleChange}
                          >
                            <option value="Morning (10:00 AM - 1:00 PM)">Morning (10:00 AM - 1:00 PM)</option>
                            <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                            <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Row 5: Notes / Requirements */}
                    <div className="form-group">
                      <label htmlFor="message">Any specific features or questions you'd like to explore?</label>
                      <div className="input-with-icon textarea-wrap">
                        <MessageSquare size={18} className="field-icon textarea-icon" />
                        <textarea 
                          id="message"
                          name="message"
                          rows="3"
                          placeholder="e.g. We want to streamline batch attendance and send WhatsApp test score reports to parents..."
                          value={formData.message}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="submit-demo-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="btn-loading-spinner"></div>
                      ) : (
                        <>
                          <span>Schedule Free Demo</span>
                          <Send size={16} />
                        </>
                      )}
                    </button>

                    <div className="form-privacy-note">
                      <HelpCircle size={14} />
                      <span>We respect your privacy. No spam. Instant calendar invite sent upon confirmation.</span>
                    </div>

                  </form>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ── Simple Bottom Footer ── */}
      <footer className="contact-bottom-footer">
        <div className="footer-inner">
          <p>&copy; {new Date().getFullYear()} GroWise Education Platform. All rights reserved.</p>
          <div className="footer-links">
            <span onClick={() => onNavigate("landing")}>Home</span>
            <span>&bull;</span>
            <span onClick={() => onNavigate("role-selector")}>Portals</span>
            <span>&bull;</span>
            <a href="mailto:support@growise.edu">support@growise.edu</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
