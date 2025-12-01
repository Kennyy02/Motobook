import React, { useState, useContext, useRef, useEffect } from "react";
import "../../styles/landing/Header.css";
import LoginModal from "./LoginModal";
import { AuthContext } from "../../context/AuthContext.js";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cart from "../../components/customer/Cart.jsx";
import OrdersModal from "../../components/customer/OrdersModal.jsx";
import TermsAndConditions from "./Terms&Conditions.jsx";
import axios from "axios";

function Header({ cartItems, onToggleCart }) {
  const [showModal, setShowModal] = useState({ open: false, mode: "login" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const [hasUnreadOrders, setHasUnreadOrders] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  //ORDER SERVICE DOMAIN
  const orderServiceBaseURL =
    import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3004";

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;

      try {
        const res = await axios.get(
          `${orderServiceBaseURL}/api/orders/all`,
          // "/api/orders/all",
          {
            params: { customerId: user.id },
          }
        );
        setOrders(res.data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, [user]);

  // Check unreadCounts from localStorage
  useEffect(() => {
    const key = `unreadCounts_${user?.id}`; // optional: make it user-specific
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

  const showLogin = (selectedMode) => {
    setShowModal({ open: true, mode: selectedMode });
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="../../assets/logo/Motobook.png" alt="MotoBook Logo" />
        </div>
        <nav className="navbar">
          <div className="auth-buttons" ref={dropdownRef}>
            {!user || !user.name ? (
              <>
                <button
                  className="login-btn"
                  onClick={() => showLogin("login")}
                >
                  Login
                </button>
                <button
                  className="signup-btn"
                  onClick={() => showLogin("signup")}
                >
                  Signup
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
                        handleMenuClick(() => setShowOrdersModal(true))
                      }
                      style={{ position: "relative" }}
                    >
                      My Orders{" "}
                      {hasUnreadOrders && (
                        <span
                          className="badge"
                          style={{ position: "absolute", right: 10, top: 6 }}
                        >
                          {orders.length}
                        </span>
                      )}
                    </li>

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
                    <li onClick={logout}>Logout</li>
                  </ul>
                )}
              </div>
            )}
          </div>
          <Cart cartItems={cartItems} onToggleCart={onToggleCart} />
        </nav>
      </header>

      {showModal.open && (
        <LoginModal
          mode={showModal.mode}
          onClose={() => setShowModal({ open: false, mode: "login" })}
          onShowTerms={() => setShowTerms(true)}
        />
      )}

      {showOrdersModal && (
        <OrdersModal
          onClose={() => setShowOrdersModal(false)}
          onMarkAllAsRead={() => setHasUnreadOrders(false)}
        />
      )}

      {showTerms && (
        <TermsAndConditions
          onClose={() => setShowTerms(false)}
          onBackToSignup={() => {
            setShowTerms(false);
            setShowModal({ open: true, mode: "signup" });
          }}
        />
      )}
    </>
  );
}

export default Header;
