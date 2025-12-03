import React from "react";
import "../../styles/admin/AdminHeader.css";
import logo from "../../assets/logo/Motobook2.png";

function AdminHeader() {
  return (
    <header className="admin-header">
      <div className="header-logo">
        <img src={logo} alt="Motobook Logo" />
      </div>
      <h1>Admin Dashboard</h1>
      <div className="header-spacer"></div>
    </header>
  );
}

export default AdminHeader;
