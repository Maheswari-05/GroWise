import "./Navbar.css";
import Logo from "./Logo";
import NavLinks from "./NavLinks.jsx"
import AuthButtons from "./AuthButtons.jsx"

const Navbar=()=>{
    return(
        <header className="navbar-wrapper">
            <nav className="navbar">
                <Logo/>
                 <NavLinks />
                 <AuthButtons />
            </nav>
        </header>
    )
}
export default Navbar;
