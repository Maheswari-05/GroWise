import Navbar from "./components/Navbar/Navbar"
import "./LandingPage.css"
const LandingPage=()=>{
    return(
        <div className="landing-page">
        <Navbar/>
        <section className="hero-section">
            <div className="hero-content">
                <h1>GroWise Learning Platform</h1>
                <p>Every Lesson. A Step Forward.</p>
            </div>
        </section>
        </div>
        
    )
}
export default LandingPage;