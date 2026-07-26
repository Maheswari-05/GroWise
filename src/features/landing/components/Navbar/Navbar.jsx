import { useState } from "react";
import { Menu, X } from "lucide-react";

import "./Navbar.css";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar-wrapper${isNavHovered ? " expanded" : ""}`}>
      {/* ── Main Bar ── */}
      <nav className="navbar">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav Links */}
        <div
          className="nav-links-wrapper"
          onMouseEnter={() => setIsNavHovered(true)}
          onMouseLeave={() => setIsNavHovered(false)}
        >
          <NavLinks onLinkClick={closeMenu} />
        </div>

        {/* Desktop Auth Buttons */}
        <div className="nav-right">
          <AuthButtons />
        </div>

        {/* Hamburger */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
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