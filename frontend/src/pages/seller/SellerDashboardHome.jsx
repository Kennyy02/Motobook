import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import "../../styles/seller/SellerDashboard.css";

const SellerDashboardHome = () => {
  const { user } = useContext(AuthContext);
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState({
    totalOrdersToday: 0,
    pendingOrders: 0,
    topSellingItem: "N/A",
    avgPrepTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Service URLs
  const businessServiceURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";
  const orderServiceURL =
    import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3004";

  // Fetch business data
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user?.id) return;

      try {
        const response = await axios.get(
          `${businessServiceURL}/api/business/user/${user.id}`
        );
        setBusiness(response.data);
      } catch (err) {
        console.error("Error fetching business:", err);
        setError("Failed to load business information");
      }
    };

    fetchBusiness();
  }, [user, businessServiceURL]);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!business?.id) return;

      try {
        setLoading(true);
        const response = await axios.get(
          `${orderServiceURL}/api/orders/seller/${business.id}/stats`
        );
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [business, orderServiceURL]);

  if (!user || user.role !== "Seller") {
    return <div>Unauthorized</div>;
  }

  if (loading && !business) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="seller-dashboard-home">
      {/* Business Info Card */}
      <div className="business-info-card">
        <div className="business-logo">
          <img
            src={business?.logo || "/default-logo.png"}
            alt={business?.businessName}
          />
        </div>
        <div className="business-details">
          <h2>{business?.businessName || "Loading..."}</h2>
          <span className={`status-badge ${business?.status || "pending"}`}>
            {business?.status?.toUpperCase() || "PENDING"}
          </span>
        </div>
        <button
          className={`toggle-btn ${business?.isOpen ? "open" : "closed"}`}
          onClick={() => {
            // Add toggle open/close logic here
          }}
        >
          {business?.isOpen ? "Open" : "Closed"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-header">TOTAL ORDERS TODAY</div>
          <div className="stat-value">{stats.totalOrdersToday}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">PENDING ORDERS</div>
          <div className="stat-value pending">{stats.pendingOrders}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">TOP-SELLING ITEM</div>
          <div className="stat-value item">{stats.topSellingItem}</div>
          {stats.topSellingItemQuantity > 0 && (
            <div className="stat-subtext">
              {stats.topSellingItemQuantity} sold
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-header">AVG. PREP TIME</div>
          <div className="stat-value">{stats.avgPrepTime} mins</div>
          <div className="stat-subtext">Last 7 days</div>
        </div>
      </div>

      {/* Additional Revenue Stats (Optional) */}
      <div className="revenue-section">
        <div className="revenue-card">
          <h3>Today's Revenue</h3>
          <p className="revenue-amount">
            ₱{stats.revenueToday?.toLocaleString() || "0"}
          </p>
          <small>{stats.completedToday} completed orders</small>
        </div>

        <div className="revenue-card">
          <h3>All Time Revenue</h3>
          <p className="revenue-amount">
            ₱{stats.revenueAllTime?.toLocaleString() || "0"}
          </p>
          <small>{stats.completedAllTime} completed orders</small>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardHome;
