import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      console.log("AuthProvider - Loading from localStorage:");
      console.log("  Token:", storedToken ? "exists" : "null");
      console.log("  User:", storedUser ? "exists" : "null");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        console.log("  Parsed user role:", parsedUser.role);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    console.log("AuthProvider - login() called with:", { token, userData });

    if (!token || !userData) {
      console.error("AuthProvider - Invalid login parameters");
      return;
    }

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    console.log("AuthProvider - Login successful, user role:", userData.role);
  };

  const logout = () => {
    console.log("AuthProvider - logout() called");

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("selectedRestaurant");
    localStorage.removeItem("riderActiveMenu");
    localStorage.removeItem("menuCartVisible");

    // Clear all category modal flags
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("categoryModalShown_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    console.log("AuthProvider - Logout complete, localStorage cleared");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
