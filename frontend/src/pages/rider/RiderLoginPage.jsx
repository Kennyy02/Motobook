import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/rider/RiderLoginPage.css"; // Create this CSS file
import axios from "axios";

const RiderLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const userServiceBaseURL =
    import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ Add this line

    try {
      const res = await axios.post(
        // "/api/auth/rider/login",
        `${userServiceBaseURL}/api/auth/rider/login`,
        {
          email,
          password,
        }
      );

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user)); // Optional but useful for role check

      navigate("/rider");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="rider-login-container">
      <form onSubmit={handleLogin} className="rider-login-form">
        <h2>Rider Login</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default RiderLoginPage;
