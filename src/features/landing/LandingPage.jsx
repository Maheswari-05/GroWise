import Navbar from "./components/Navbar/Navbar";
import Hero    from "./components/Hero/Hero";
import Courses from "./components/Courses/Courses";
import Teachers from "./components/Teachers/Teachers";
import "./LandingPage.css";

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      <Navbar onNavigate={onNavigate} />
      <Hero onNavigate={onNavigate} />
      <Courses />
      <Teachers />
    </div>
  );
};

export default LandingPage;