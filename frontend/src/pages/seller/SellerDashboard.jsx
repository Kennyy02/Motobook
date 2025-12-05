// SellerDashboard.jsx - Fixed for Mobile Responsiveness
// Check if your file matches this structure exactly

import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import SellerSidebar from "../../components/seller/SellerSidebar";
import { Outlet } from "react-router-dom";
import "../../styles/seller/SellerDashboard.css";
import SellerHeader from "../../components/seller/SellerHeader";

const SellerDashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== "Seller") {
    return <div>Unauthorized</div>;
  }

  return (
    <>
      <SellerHeader />
      <div className="seller-dashboard">
        <SellerSidebar />
        <main className="seller-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default SellerDashboard;
