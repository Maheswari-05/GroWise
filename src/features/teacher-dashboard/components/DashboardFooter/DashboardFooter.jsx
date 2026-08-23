import React from "react";
import "./DashboardFooter.css";

const DashboardFooter = () => {
  return (
    <footer className="td-footer">
      <p>© {new Date().getFullYear()} GroWise Learning Studio. All rights reserved.</p>
    </footer>
  );
};

export default DashboardFooter;
