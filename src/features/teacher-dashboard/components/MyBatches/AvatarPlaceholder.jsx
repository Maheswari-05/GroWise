import "./AvatarPlaceholder.css";

/**
 * AvatarPlaceholder
 * Shows a student photo if they have uploaded one (src prop).
 * If src is null/undefined, renders a blank circle with their initials.
 * Colors are seeded from the student's name for consistent per-student hues.
 */

const PALETTE = [
  { bg: "#e0e9ff", text: "#2D6BFF" },  // blue
  { bg: "#d4f5e7", text: "#1a8a4a" },  // green
  { bg: "#ede9fe", text: "#7c3aed" },  // purple
  { bg: "#fef3c7", text: "#b45309" },  // amber
  { bg: "#fce7f3", text: "#be185d" },  // pink
  { bg: "#e0f2fe", text: "#0369a1" },  // sky
];

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const AvatarPlaceholder = ({ src, name = "", size = 36, className = "" }) => {
  const initials = getInitials(name);
  const color    = getColor(name);
  const style    = { width: size, height: size, fontSize: size * 0.36 };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar-img ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`avatar-placeholder ${className}`}
      style={{ ...style, background: color.bg, color: color.text }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default AvatarPlaceholder;
