import "./Hero.css";

import HeroLeft from "./HeroLeft";
import HeroRight from "./HeroRight";

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-container">

        <HeroLeft />

        <HeroRight />

      </div>
    </section>
  );
};

export default Hero;