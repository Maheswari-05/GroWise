import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

import "./Navbar.css";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import AuthButtons from "./AuthButtons";

const Navbar = ({ onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isNavHovered, setIsNavHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const isExpanded = isNavHovered || isScrolled;

  return (
    <header 
      className={`navbar-wrapper${isExpanded ? " expanded" : ""}`}
      onMouseEnter={() => setIsNavHovered(true)}
      onMouseLeave={() => setIsNavHovered(false)}
    >
      {/* ── Main Bar ── */}
      <nav className="navbar">
        {/* Logo */}
        <Logo />

        {/* Desktop Nav Links */}
        <div className="nav-links-wrapper">
          <NavLinks onLinkClick={closeMenu} />
        </div>

        {/* Desktop Auth Buttons */}
        <div className="nav-right">
          <AuthButtons onNavigate={onNavigate} />
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
          <AuthButtons onNavigate={onNavigate} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;