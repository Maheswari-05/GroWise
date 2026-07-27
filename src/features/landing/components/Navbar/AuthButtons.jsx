const AuthButtons = ({ onNavigate }) => {
  return (
    <div className="nav-buttons">
      <button className="login-btn" onClick={() => onNavigate("login")}>
        Login
      </button>
      <button className="get-started-btn" onClick={() => onNavigate("login")}>
        Get Started
      </button>
    </div>
  );
};
export default AuthButtons;