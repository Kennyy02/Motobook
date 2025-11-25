// SellerSidebar.jsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/seller/SellerSidebar.css";

const SellerSidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== "Seller") return null;

  return (
    <aside className="sidebar">
      <button className="sidebar-btn">
        <Link to="/seller/dashboard">Dashboard</Link>
      </button>

      <button className="sidebar-btn">
        <Link to="/seller/menus">Manage Menus</Link>
      </button>

      <button className="sidebar-btn">
        <Link to="/seller/orders">Orders</Link>
      </button>
    </aside>
  );
};

export default SellerSidebar;
