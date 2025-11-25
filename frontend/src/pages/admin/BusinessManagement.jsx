import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/admin/BusinessManagement.css"; // Ensure to import your CSS

function BusinessManagement() {
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null); // Track business ID being updated

  const businessServiceBaseURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";

  const fetchBusinesses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${businessServiceBaseURL}/api/business/business`
      );
      setBusinesses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleStatusChange = async (businessId, newStatus) => {
    setStatusUpdating(businessId);
    try {
      await axios.put(
        // `/admin/business/${businessId}/status`
        `${businessServiceBaseURL}/api/business/business/${businessId}/status`,
        {
          status: newStatus,
        }
      );
      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <div className="user-management">
      <h2>Business Directory</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="user-list">
        <table className="user-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Address</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((business) => (
              <tr key={business.id}>
                <td>{business.businessName}</td>
                <td>{business.address}</td>
                <td>{business.email}</td>
                <td>{business.phone}</td>
                <td>
                  <select
                    value={business.status}
                    disabled={statusUpdating === business.id}
                    onChange={(e) =>
                      handleStatusChange(business.id, e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                  {statusUpdating === business.id && (
                    <span style={{ marginLeft: "8px", fontSize: "0.85rem" }}>
                      Updating...
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BusinessManagement;
