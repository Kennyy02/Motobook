import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/AdminHeader.css";

function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored authentication tokens
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Redirect to login page
    navigate("/admin/login");
  };

  return (
    <header className="admin-header">
      <h1>Admin Dashboard</h1>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default AdminHeader;
