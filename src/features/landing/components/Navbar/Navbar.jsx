import { useState } from "react";
import { Menu, X } from "lucide-react";

import "./Navbar.css";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar-wrapper">

      
      <nav className="navbar">

       
        <Logo />

       
        <div className="nav-links-wrapper">
          <NavLinks onLinkClick={closeMenu} />
        </div>

        
        <div className="nav-right">
          <AuthButtons />
        </div>

        
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

      </nav>

      
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <NavLinks onLinkClick={closeMenu} />
        <div className="mobile-buttons">
          <AuthButtons />
        </div>
      </div>

    </header>
  );
};

export default Navbar;