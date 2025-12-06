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
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [businessError, setBusinessError] = useState(null);
  const [statsError, setStatsError] = useState(null);

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
        setLoadingBusiness(true);
        const response = await axios.get(
          `${businessServiceURL}/api/business/user/${user.id}`
        );
        setBusiness(response.data);
        setBusinessError(null);
      } catch (err) {
        console.error("Error fetching business:", err);
        if (err.response?.status === 404) {
          setBusinessError("No business registered");
        } else {
          setBusinessError("Failed to load business information");
        }
      } finally {
        setLoadingBusiness(false);
      }
    };

    fetchBusiness();
  }, [user, businessServiceURL]);

  // Fetch statistics - INDEPENDENT of business fetch
  useEffect(() => {
    const fetchStats = async () => {
      if (!business?.id) return;

      try {
        setLoadingStats(true);
        const response = await axios.get(
          `${orderServiceURL}/api/orders/seller/${business.id}/stats`
        );
        setStats(response.data);
        setStatsError(null);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setStatsError("Failed to load statistics");
        // Keep default stats values so UI still renders
      } finally {
        setLoadingStats(false);
      }
    };

    if (business?.id) {
      fetchStats();
      // Refresh stats every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [business, orderServiceURL]);

  if (!user || user.role !== "Seller") {
    return <div className="error-message">Unauthorized</div>;
  }

  // Show loading only for business (critical data)
  if (loadingBusiness) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // If business doesn't exist, show registration prompt
  if (businessError) {
    return (
      <div className="dashboard-error">
        <h2>⚠️ {businessError}</h2>
        <p>
          Please complete your business registration to access the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-home">
      {/* Business Info Card - Always show if business exists */}
      <div className="business-info-card">
        <div className="business-logo">
          <img
            src={business?.logo || "/default-logo.png"}
            alt={business?.businessName}
            onError={(e) => {
              e.target.src = "/default-logo.png";
            }}
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
          onClick={async () => {
            try {
              await axios.put(
                `${businessServiceURL}/api/business/${business.id}/open`,
                { isOpen: !business.isOpen }
              );
              setBusiness({ ...business, isOpen: !business.isOpen });
            } catch (err) {
              console.error("Error toggling business status:", err);
            }
          }}
        >
          {business?.isOpen ? "Open" : "Closed"}
        </button>
      </div>

      {/* Statistics Section - Show error state if failed */}
      {statsError ? (
        <div className="stats-error-banner">
          <span>⚠️ {statsError}</span>
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      ) : loadingStats ? (
        <div className="stats-loading">
          <div className="spinner-small"></div>
          <span>Loading statistics...</span>
        </div>
      ) : (
        <>
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

          {/* Revenue Section */}
          {stats.revenueToday !== undefined && (
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
          )}
        </>
      )}
    </div>
  );
};

export default SellerDashboardHome;
