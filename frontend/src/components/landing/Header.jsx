import React, { useState, useContext, useRef, useEffect } from "react";
import "../../styles/landing/Header.css";
import LoginModal from "./LoginModal";
import { AuthContext } from "../../context/AuthContext.js";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Cart from "../../components/customer/Cart.jsx";
import OrdersModal from "../../components/customer/OrdersModal.jsx";
import TermsAndConditions from "./Terms&Conditions.jsx";
import axios from "axios";
import logo from "../../assets/logo/Motobook.png";

function Header({ cartItems, onToggleCart }) {
  const [showModal, setShowModal] = useState({ open: false, mode: "login" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef();
  const mobileMenuRef = useRef();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [hasUnreadOrders, setHasUnreadOrders] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showLogin = (selectedMode) => {
    setShowModal({ open: true, mode: selectedMode });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          {/* Logo */}
          <div className="logo" onClick={() => navigate("/")}>
            <img src={logo} alt="MotoBook" />
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {!user || !user.name ? (
              <div className="auth-buttons">
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
              </div>
            ) : (
              <div className="user-section" ref={dropdownRef}>
                <div
                  className="user-toggle"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  <FaUserCircle className="user-icon" size={24} />
                  {hasUnreadOrders && <span className="badge-dot"></span>}
                  <span className="user-name">{user.name.split(" ")[0]}</span>
                </div>

                {dropdownOpen && (
                  <ul className="dropdown-menu">
                    <li
                      onClick={() =>
                        handleMenuClick(() => setShowOrdersModal(true))
                      }
                    >
                      <span>My Orders</span>
                      {hasUnreadOrders && (
                        <span className="badge-count">{orders.length}</span>
                      )}
                    </li>
                    <li
                      onClick={() =>
                        handleMenuClick(() => navigate("/seller/profile"))
                      }
                    >
                      Profile
                    </li>
                    <li
                      onClick={() =>
                        handleMenuClick(() => navigate("/seller/account"))
                      }
                    >
                      Settings
                    </li>
                    <li
                      onClick={() => handleMenuClick(logout)}
                      className="logout"
                    >
                      Logout
                    </li>
                  </ul>
                )}
              </div>
            )}
            <Cart cartItems={cartItems} onToggleCart={onToggleCart} />
          </nav>

          {/* Mobile Navigation */}
          <div className="mobile-nav">
            <Cart cartItems={cartItems} onToggleCart={onToggleCart} />
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" ref={mobileMenuRef}>
            {!user || !user.name ? (
              <div className="mobile-auth">
                <button
                  className="mobile-login-btn"
                  onClick={() => showLogin("login")}
                >
                  Login
                </button>
                <button
                  className="mobile-signup-btn"
                  onClick={() => showLogin("signup")}
                >
                  Signup
                </button>
              </div>
            ) : (
              <div className="mobile-user-menu">
                <div className="mobile-user-header">
                  <FaUserCircle size={40} />
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>
                <ul className="mobile-menu-list">
                  <li
                    onClick={() =>
                      handleMenuClick(() => setShowOrdersModal(true))
                    }
                  >
                    <span>My Orders</span>
                    {hasUnreadOrders && (
                      <span className="badge-count">{orders.length}</span>
                    )}
                  </li>
                  <li
                    onClick={() =>
                      handleMenuClick(() => navigate("/seller/profile"))
                    }
                  >
                    Profile
                  </li>
                  <li
                    onClick={() =>
                      handleMenuClick(() => navigate("/seller/account"))
                    }
                  >
                    Settings
                  </li>
                  <li
                    onClick={() => handleMenuClick(logout)}
                    className="logout"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
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
