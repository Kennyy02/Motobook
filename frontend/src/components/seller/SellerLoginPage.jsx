import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/seller/SellerLoginPage.css";

const SellerLoginPage = () => {
  const { login } = useContext(AuthContext); // ✅ Get login function from context
  const navigate = useNavigate();
  const [usePhoneLogin, setUsePhoneLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = usePhoneLogin
      ? { phone: formData.phone, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await axios.post(
        `${userServiceBaseURL}/api/auth/login-seller`,
        payload
      );

      const { token, user } = response.data;

      // ✅ Store token and user details
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id); // 👈 add this line
      localStorage.setItem("user", JSON.stringify(user)); // optional but useful

      login(user); // ✅ update AuthContext

      alert("Login successful!");
      navigate("/seller/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error.response?.data?.message || "Something went wrong during login";
      alert(message);
    }
  };

  return (
    <>
      <div className="seller-access-wrapper">
        <div className="seller-access-container">
          <h2 className="seller-access-title">Seller Login</h2>

          <form onSubmit={handleSubmit} className="registration-form">
            <h3>Login with {usePhoneLogin ? "Phone Number" : "Email"}</h3>

            {usePhoneLogin ? (
              <input
                className="form-input"
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            ) : (
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            )}

            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-button">
              Login
            </button>

            {/* OR Divider */}
            <div className="or-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="toggle-login-button"
              onClick={() => setUsePhoneLogin(!usePhoneLogin)}
            >
              {usePhoneLogin ? "Login with Email" : "Login with Phone"}
            </button>

            <p className="signup-link">
              No account?{" "}
              <span
                onClick={() => navigate("/seller/register")}
                className="link-highlight"
              >
                Sign up now
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SellerLoginPage;
