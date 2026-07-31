const AuthButtons = ({ onNavigate }) => {
  return (
    <div className="nav-buttons">
      <button className="login-btn" onClick={() => onNavigate("role-selector")}>
        Login
      </button>
      <button className="get-started-btn" onClick={() => onNavigate("role-selector")}>
        Get Started
      </button>
    </div>
  );
};
export default AuthButtons;