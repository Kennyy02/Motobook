// SellerDashboard.jsx - Layout wrapper with existing sidebar
import { Outlet } from "react-router-dom";
import SellerHeader from "../../components/seller/SellerHeader";
import SellerSidebar from "../../components/seller/SellerSidebar";
import "../../styles/seller/SellerDashboard.css";
import "../../styles/seller/SellerSidebar.css";

const SellerDashboard = () => {
  return (
    <div className="seller-dashboard-layout">
      <SellerHeader />
      <SellerSidebar />

      {/* Main Content Area - Adjusted for sidebar */}
      <main className="seller-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default SellerDashboard;
