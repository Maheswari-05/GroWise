import Navbar from "./components/Navbar/Navbar";
import Hero    from "./components/Hero/Hero";
import Courses from "./components/Courses/Courses";
import "./LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Courses />
    </div>
  );
};

export default LandingPage;