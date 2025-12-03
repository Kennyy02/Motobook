import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  // Debug logging
  useEffect(() => {
    console.log("ProtectedRoute - User:", user);
    console.log("ProtectedRoute - Loading:", loading);
    console.log("ProtectedRoute - Allowed Roles:", allowedRoles);
  }, [user, loading, allowedRoles]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - No user found, redirecting to /");
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.log(
      `ProtectedRoute - User role '${user.role}' not in allowed roles, redirecting to /`
    );
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute - Access granted!");
  return <Outlet />;
};

export default ProtectedRoute;
