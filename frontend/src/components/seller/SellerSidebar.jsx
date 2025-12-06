import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaTachometerAlt, FaUtensils, FaClipboardList } from "react-icons/fa";
import "../../styles/seller/SellerSidebar.css";

const SellerSidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user || user.role !== "Seller") return null;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop">
        <nav className="sidebar-nav">
          <Link
            to="/seller/dashboard"
            className={`sidebar-link ${
              isActive("/seller/dashboard") ? "active" : ""
            }`}
          >
            <FaTachometerAlt className="sidebar-icon" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/seller/menus"
            className={`sidebar-link ${
              isActive("/seller/menus") ? "active" : ""
            }`}
          >
            <FaUtensils className="sidebar-icon" />
            <span>Manage Menus</span>
          </Link>

          <Link
            to="/seller/orders"
            className={`sidebar-link ${
              isActive("/seller/orders") ? "active" : ""
            }`}
          >
            <FaClipboardList className="sidebar-icon" />
            <span>Orders</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile Horizontal Navigation (Below Header) */}
      <nav className="horizontal-nav-mobile">
        <Link
          to="/seller/dashboard"
          className={`horizontal-nav-item ${
            isActive("/seller/dashboard") ? "active" : ""
          }`}
        >
          <FaTachometerAlt className="horizontal-nav-icon" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/seller/menus"
          className={`horizontal-nav-item ${
            isActive("/seller/menus") ? "active" : ""
          }`}
        >
          <FaUtensils className="horizontal-nav-icon" />
          <span>Menus</span>
        </Link>

        <Link
          to="/seller/orders"
          className={`horizontal-nav-item ${
            isActive("/seller/orders") ? "active" : ""
          }`}
        >
          <FaClipboardList className="horizontal-nav-icon" />
          <span>Orders</span>
        </Link>
      </nav>
    </>
  );
};

export default SellerSidebar;
