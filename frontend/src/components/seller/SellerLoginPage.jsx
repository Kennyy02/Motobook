import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/seller/SellerLoginPage.css";
import logo from "../../assets/logo/Motobook.png";

const SellerLoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3005";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${userServiceBaseURL}/api/auth/login-seller`,
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const { token, user } = response.data;
      login(token, user);
      alert("Login successful!");
      navigate("/seller/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message || "Something went wrong during login";
      alert(message);
    }
  };

  const handleHomeClick = () => {
    // Force navigation to landing page and replace history
    navigate("/", { replace: true });
  };

  return (
    <div className="seller-access-wrapper">
      {/* Header */}
      <header className="seller-access-header">
        <img
          src={logo}
          alt="MotoBook Logo"
          className="header-logo"
          onClick={handleHomeClick}
        />
        <nav className="header-nav">
          <button className="nav-link" onClick={handleHomeClick}>
            Home
          </button>
          <button
            className="nav-link active"
            onClick={() => navigate("/seller/login")}
          >
            Login
          </button>
          <button
            className="nav-link"
            onClick={() => navigate("/seller/register")}
          >
            Sign Up
          </button>
        </nav>
      </header>

      {/* Content Area */}
      <div className="seller-access-content">
        <div className="seller-access-container">
          {/* Welcome Text */}
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome Back</h2>
            <p className="welcome-subtitle">Sign in to your seller account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="registration-form">
            {/* Input Fields */}
            <div className="input-group">
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-button">
              Sign In
            </button>

            {/* Signup Link */}
            <p className="signup-link">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/seller/register")}
                className="link-highlight"
              >
                Create one
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerLoginPage;
