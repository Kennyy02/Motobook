import React from "react";
import { Link } from "react-router-dom";
import "../../styles/admin/AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <ul>
        <li>
          <Link to="/admin/dashboard">Admin Dashboard</Link>
        </li>
        <li>
          <Link to="/admin/dashboard/users">Manage Users</Link>
        </li>
        <li>
          <Link to="/admin/dashboard/business">Manage Business</Link>
        </li>
      </ul>
    </aside>
  );
}

export default AdminSidebar;
