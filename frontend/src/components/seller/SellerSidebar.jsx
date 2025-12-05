// SellerSidebar.jsx - Modern Hamburger Menu
import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaUtensils,
  FaClipboardList,
} from "react-icons/fa";
import "../../styles/seller/SellerSidebar.css";

const SellerSidebar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (!user || user.role !== "Seller") return null;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="hamburger-btn"
        onClick={toggleSidebar}
        aria-label="Toggle Menu"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/seller/dashboard"
            className={`sidebar-link ${
              isActive("/seller/dashboard") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaTachometerAlt className="sidebar-icon" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/seller/menus"
            className={`sidebar-link ${
              isActive("/seller/menus") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaUtensils className="sidebar-icon" />
            <span>Manage Menus</span>
          </Link>

          <Link
            to="/seller/orders"
            className={`sidebar-link ${
              isActive("/seller/orders") ? "active" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaClipboardList className="sidebar-icon" />
            <span>Orders</span>
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default SellerSidebar;
