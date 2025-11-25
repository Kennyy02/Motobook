import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { FaEdit, FaUtensils } from "react-icons/fa";
import { MdToggleOn, MdToggleOff } from "react-icons/md";
import "../../styles/seller/BusinessInfoCard.css";

const BusinessInfoCard = () => {
  const { user } = useContext(AuthContext);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const businessServiceBaseURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

  const toggleIsOpen = async () => {
    if (updating) return;

    const newIsOpen = business.isOpen === 1 ? 0 : 1; // or use !business.isOpen if it's boolean
    setUpdating(true);

    try {
      await axios.put(
        // `/api/business/${business.id}/open`,
        `${businessServiceBaseURL}/api/business/${business.id}/open`,
        {
          isOpen: newIsOpen,
        }
      );
      setBusiness((prev) => ({ ...prev, isOpen: newIsOpen }));
    } catch (error) {
      console.error("Failed to update open state:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await axios.put(
        // `/api/business/logo/${user.id}`,
        `${businessServiceBaseURL}/api/business/logo/${user.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setBusiness((prev) => ({ ...prev, logo: res.data.logo }));
    } catch (error) {
      console.error("Error uploading new logo:", error);
    }
  };

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(
          // `/api/business/${user.id}`
          `${businessServiceBaseURL}/api/business/${user.id}`
        );
        setBusiness(res.data);
      } catch (error) {
        console.error("Error fetching business info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchBusiness();
  }, [user?.id]);

  if (loading) return <p>Loading business info...</p>;
  if (!business) return <p>No business info found.</p>;

  return (
    <section className="business-container">
      {/* === Top Section === */}
      <div className="business-header">
        {/* Restaurant Identity Card */}
        <div className="identity-card">
          <div className="logo-section">
            <img
              src={business.logo}
              alt="Business Logo"
              className="business-logo"
            />
            <label htmlFor="logoUpload" className="change-logo-btn">
              Change Photo
            </label>
            <input
              id="logoUpload"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => handleLogoChange(e)}
            />
          </div>

          <div className="identity-info">
            <p>
              {Array.isArray(business.categories)
                ? business.categories.join(", ")
                : business.categories}
            </p>
            <h2>{business.businessName}</h2>
            <span
              className={`status-badge ${
                business.status === "approved" ? "open" : "closed"
              }`}
            >
              {business.status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="business-actions">
          <button
            className={`status-indicator ${
              business.isOpen === 1 ? "open" : "closed"
            }`}
            onClick={toggleIsOpen}
            disabled={updating || business.status !== "approved"}
            title={
              business.status !== "approved"
                ? "Only approved businesses can toggle open/closed"
                : "Click to toggle open/closed"
            }
          >
            {business.isOpen === 1 ? (
              <>
                <MdToggleOn className="icon" /> <span>Open</span>
              </>
            ) : (
              <>
                <MdToggleOff className="icon" /> <span>Closed</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* === Metrics Overview === */}
      <div className="metrics-row">
        <div className="metric-card">
          <h4>Total Orders Today</h4>
          <p>128</p>
        </div>
        <div className="metric-card">
          <h4>Pending Orders</h4>
          <p>12</p>
        </div>
        <div className="metric-card">
          <h4>Top-Selling Item</h4>
          <p>Beef Burger</p>
        </div>
        <div className="metric-card">
          <h4>Avg. Prep Time</h4>
          <p>18 mins</p>
        </div>
      </div>
    </section>
  );
};

export default BusinessInfoCard;
