import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setLoading(false);
  }, []);

  const login = (token, userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("selectedRestaurant");
    localStorage.removeItem("riderActiveMenu"); // Clear rider menu state
    // Note: We don't navigate here - let the calling component handle navigation
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
