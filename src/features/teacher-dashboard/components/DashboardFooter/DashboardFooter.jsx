import "./DashboardFooter.css";

const DashboardFooter = () => {
  return (
    <footer className="td-footer">
      <p className="td-footer-text">
        © 2026{" "}
        <span className="td-footer-brand">GroWise</span>{" "}
        Tuition Centre Management System. All rights reserved.
      </p>
      <div className="td-footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
        <a href="#">Support</a>
      </div>
    </footer>
  );
};

export default DashboardFooter;
