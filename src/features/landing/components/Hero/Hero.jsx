import "./Hero.css";

import HeroLeft from "./HeroLeft";
import HeroRight from "./HeroRight";

const Hero = ({ onNavigate }) => {
  return (
    <section className="hero" id="home">
      <div className="hero-container">

        <HeroLeft onNavigate={onNavigate} />

        <HeroRight />

      </div>
    </section>
  );
};

export default Hero;