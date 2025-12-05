import React, { useState, useContext, useRef, useEffect } from "react";
import "../../styles/seller/SellerHeader.css";
import { AuthContext } from "../../context/AuthContext.js";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo/Motobook3.png";

const SellerHeader = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const [hasUnreadOrders, setHasUnreadOrders] = useState(false);

  //ORDER SERVICE DOMAIN
  const orderServiceBaseURL =
    import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3004";

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        const res = await axios.get(`${orderServiceBaseURL}/api/orders/all`, {
          params: { customerId: user.id },
        });
        setOrders(res.data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, [user]);

  // Check unreadCounts from localStorage
  useEffect(() => {
    const key = `unreadCounts_${user?.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const unread = JSON.parse(stored);
      setHasUnreadOrders(
        unread.pending || unread.completed || unread.cancelled
      );
    }
  }, [user]);

  const handleMenuClick = (action) => {
    action();
    setDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    navigate("/seller/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    navigate("/seller/login");
  };

  return (
    <>
      <header className="header">
        {/* Logo - Updated to use image instead of text */}
        <div className="logo" onClick={() => navigate("/seller/dashboard")}>
          <img src={logo} alt="MotoBook" />
        </div>

        <nav className="navbar">
          <div className="auth-buttons" ref={dropdownRef}>
            {!user || !user.name ? (
              <>
                <button className="login-btn" onClick={handleLoginClick}>
                  Login
                </button>
              </>
            ) : (
              <div className="user-dropdown">
                <div
                  className="user-toggle"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <div className="icon-wrapper">
                    <FaUserCircle className="user-icon" size={28} />
                    {hasUnreadOrders && (
                      <span className="badge">{orders.length}</span>
                    )}
                  </div>
                  <h3 className="user-name">{user.name.split(" ")[0]}</h3>
                </div>

                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    <li
                      onClick={() =>
                        handleMenuClick(() => navigate("/seller/profile"))
                      }
                    >
                      Profile
                    </li>
                    <li onClick={() => navigate("/seller/account")}>
                      Settings
                    </li>
                    <li onClick={handleLogout}>Logout</li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </nav>
      </header>

      {showOrdersModal && (
        <OrdersModal
          onClose={() => setShowOrdersModal(false)}
          onMarkAllAsRead={() => setHasUnreadOrders(false)}
        />
      )}
    </>
  );
};

export default SellerHeader;
