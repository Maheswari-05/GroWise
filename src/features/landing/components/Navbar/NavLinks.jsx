const links = [
  "Home",
  "Features",
  "Courses",
  "Teachers",
  "Pricing",
  "About",
  "Contact",
];

const NavLinks = ({ onLinkClick, onNavigate }) => {
  const handleClick = (e, item) => {
    if (onLinkClick) onLinkClick();
    if (item === "Contact" && onNavigate) {
      e.preventDefault();
      onNavigate("contact");
    }
  };

  return (
    <ul className="nav-links">
      {links.map((item, index) => (
        <li key={item}>
          <a
            href={item === "Contact" ? "#/contact" : `#${item.toLowerCase()}`}
            className={index === 0 ? "active" : ""}
            onClick={(e) => handleClick(e, item)}
          >
            {item}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;