import Navbar from "./components/Navbar/Navbar"
import Hero from "./components/Hero/Hero"
import "./LandingPage.css"
const LandingPage=()=>{
    return(
        <div className="landing-page">
        <Navbar/>
        <Hero/>
        <section className="hero-section">
            <div className="hero-content">
                
            </div>
        </section>
        </div>
        
    )
}
export default LandingPage;