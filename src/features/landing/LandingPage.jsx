import Navbar from "./components/Navbar/Navbar";
import Hero    from "./components/Hero/Hero";
import Courses from "./components/Courses/Courses";
import Teachers from "./components/Teachers/Teachers";
import Footer from "./components/Footer/Footer";
import "./LandingPage.css";

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      <Navbar onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <Courses />
      <Teachers />
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;