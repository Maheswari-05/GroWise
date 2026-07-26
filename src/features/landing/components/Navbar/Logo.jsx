import logo from "../../../../assets/logo.png";

const Logo = () => {
  return (
    <div className="logo">
      <img src={logo} alt="GroWise Logo" />
      <span className="logo-text">GroWise</span>
    </div>
  );
};

export default Logo;