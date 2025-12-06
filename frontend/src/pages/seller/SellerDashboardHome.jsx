import { useState, useEffect, useContext, useRef } from "react";
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
    revenueToday: 0,
    completedToday: 0,
    revenueAllTime: 0,
    completedAllTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);

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
        if (err.response?.status === 404) {
          setError(
            "No business registered. Please register your business first."
          );
        } else {
          setError("Failed to load business information");
        }
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
        setError(null);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        // Don't block the UI - just log the error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [business, orderServiceURL]);

  // Handle logo change
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await axios.put(
        `${businessServiceURL}/api/business/logo/${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update local state with new logo
      setBusiness({ ...business, logo: response.data.logo });
      alert("Logo updated successfully!");
    } catch (err) {
      console.error("Error updating logo:", err);
      alert(err.response?.data?.message || "Failed to update logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click();
  };

  if (!user || user.role !== "Seller") {
    return <div className="error-message">Unauthorized</div>;
  }

  if (loading && !business) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error && !business) {
    return (
      <div className="dashboard-error">
        <h2>⚠️ {error}</h2>
        <p>
          Please complete your business registration to access the dashboard.
        </p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="dashboard-error">
        <h2>No Business Found</h2>
        <p>Please register your business first to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard-home">
      {/* Business Info Card */}
      <div className="business-info-card">
        <div className="business-logo-container">
          <div className="business-logo">
            <img
              src={business?.logo || "/default-logo.png"}
              alt={business?.businessName}
              onError={(e) => {
                e.target.src = "/default-logo.png";
              }}
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            style={{ display: "none" }}
          />
          <button
            className="change-photo-btn"
            onClick={handleChangePhotoClick}
            disabled={uploadingLogo}
          >
            {uploadingLogo ? "Uploading..." : "Change Photo"}
          </button>
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
      <div className="revenue-section">
        <div className="revenue-card">
          <h3>Today's Revenue</h3>
          <p className="revenue-amount">
            ₱{stats.revenueToday?.toLocaleString() || "0"}
          </p>
          <small>{stats.completedToday || 0} completed orders</small>
        </div>

        <div className="revenue-card">
          <h3>All Time Revenue</h3>
          <p className="revenue-amount">
            ₱{stats.revenueAllTime?.toLocaleString() || "0"}
          </p>
          <small>{stats.completedAllTime || 0} completed orders</small>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardHome;
