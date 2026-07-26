const links = [
  "Home",
  "Features",
  "Courses",
  "Teachers",
  "Pricing",
  "About",
  "Contact",
];

const NavLinks = ({ onLinkClick }) => {
  return (
    <ul className="nav-links">
      {links.map((item, index) => (
        <li key={item}>
          <a
            href={`#${item.toLowerCase()}`}
            className={index === 0 ? "active" : ""}
            onClick={onLinkClick}
          >
            {item}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default NavLinks;