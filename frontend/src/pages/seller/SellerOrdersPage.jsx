import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/seller/SellerOrdersPage.css";

const SellerOrdersPage = () => {
  const { user } = useContext(AuthContext);
  const [business, setBusiness] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const businessServiceBaseURL =
    import.meta.env.VITE_BUSINESS_SERVICE_URL || "http://localhost:3003";
  const orderServiceBaseURL =
    import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3004";

  // Fetch business info to get restaurant ID
  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        // ✅ FIXED: Correct endpoint
        const res = await fetch(
          `${businessServiceBaseURL}/api/business/user/${user.id}`
        );
        const data = await res.json();
        setBusiness(data);
      } catch (error) {
        console.error("Error fetching business info:", error);
      }
    };

    if (user?.id) fetchBusiness();
  }, [user?.id, businessServiceBaseURL]);

  // Fetch orders when business is loaded
  useEffect(() => {
    const fetchOrders = async () => {
      if (!business?.id) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${orderServiceBaseURL}/api/orders/restaurant/${business.id}`
        );
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [business?.id, orderServiceBaseURL]);

  const handlePrepareOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(
        `${orderServiceBaseURL}/api/orders/${orderId}/prepare`,
        {
          method: "PATCH",
        }
      );

      if (res.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "preparing" } : order
          )
        );
      } else {
        const error = await res.json();
        alert(error.message || "Failed to prepare order");
      }
    } catch (error) {
      console.error("Error preparing order:", error);
      alert("Failed to prepare order");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkReady = async (orderId) => {
    setActionLoading(orderId);
    try {
      const res = await fetch(
        `${orderServiceBaseURL}/api/orders/${orderId}/ready`,
        {
          method: "PATCH",
        }
      );

      if (res.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "ready" } : order
          )
        );
      } else {
        const error = await res.json();
        alert(error.message || "Failed to mark order as ready");
      }
    } catch (error) {
      console.error("Error marking order ready:", error);
      alert("Failed to mark order as ready");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "preparing":
        return "#8b5cf6";
      case "ready":
        return "#06b6d4";
      case "accepted":
        return "#3b82f6";
      case "completed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready for Pickup";
      case "accepted":
        return "Accepted";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!business) {
    return <div className="orders-loading">Loading business info...</div>;
  }

  if (loading) {
    return <div className="orders-loading">Loading orders...</div>;
  }

  return (
    <div className="seller-orders-page">
      <div className="orders-header">
        <h1>Orders for {business.businessName}</h1>
        <div className="orders-stats">
          <div className="stat-badge">
            <span className="stat-label">Total</span>
            <span className="stat-value">{orders.length}</span>
          </div>
          <div className="stat-badge pending">
            <span className="stat-label">Pending</span>
            <span className="stat-value">
              {orders.filter((o) => o.status === "pending").length}
            </span>
          </div>
          <div className="stat-badge preparing">
            <span className="stat-label">Preparing</span>
            <span className="stat-value">
              {orders.filter((o) => o.status === "preparing").length}
            </span>
          </div>
          <div className="stat-badge ready">
            <span className="stat-label">Ready</span>
            <span className="stat-value">
              {orders.filter((o) => o.status === "ready").length}
            </span>
          </div>
          <div className="stat-badge accepted">
            <span className="stat-label">Accepted</span>
            <span className="stat-value">
              {orders.filter((o) => o.status === "accepted").length}
            </span>
          </div>
          <div className="stat-badge completed">
            <span className="stat-label">Completed</span>
            <span className="stat-value">
              {orders.filter((o) => o.status === "completed").length}
            </span>
          </div>
        </div>
      </div>

      <div className="orders-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All Orders
        </button>
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={filter === "preparing" ? "active" : ""}
          onClick={() => setFilter("preparing")}
        >
          Preparing
        </button>
        <button
          className={filter === "ready" ? "active" : ""}
          onClick={() => setFilter("ready")}
        >
          Ready
        </button>
        <button
          className={filter === "accepted" ? "active" : ""}
          onClick={() => setFilter("accepted")}
        >
          Accepted
        </button>
        <button
          className={filter === "completed" ? "active" : ""}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No {filter !== "all" ? filter : ""} orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <span className="order-time">
                    {formatDate(order.created_at)}
                  </span>
                </div>
                <span
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="order-customer">
                <div className="customer-info">
                  <strong>{order.customer_name}</strong>
                  <span>{order.phone_number}</span>
                </div>
                <div className="delivery-address">
                  <span>📍 {order.delivery_address}</span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      <div className="item-details">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.product_name}
                            className="item-image"
                          />
                        )}
                        <div className="item-info">
                          <span className="item-name">{item.product_name}</span>
                          <span className="item-quantity">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="item-price">
                        ₱{item.price * item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total:</strong>
                  <span className="total-amount">₱{order.total_amount}</span>
                </div>
                {order.rider_name && (
                  <div className="rider-info">
                    <span>🏍️ Rider: {order.rider_name}</span>
                  </div>
                )}
              </div>

              <div className="order-actions">
                {order.status === "pending" && (
                  <button
                    className="action-btn prepare-btn"
                    onClick={() => handlePrepareOrder(order.id)}
                    disabled={actionLoading === order.id}
                  >
                    {actionLoading === order.id
                      ? "Processing..."
                      : "Prepare Order"}
                  </button>
                )}

                {order.status === "preparing" && (
                  <button
                    className="action-btn ready-btn"
                    onClick={() => handleMarkReady(order.id)}
                    disabled={actionLoading === order.id}
                  >
                    {actionLoading === order.id
                      ? "Processing..."
                      : "Mark as Ready"}
                  </button>
                )}

                {order.status === "ready" && (
                  <div className="status-message">
                    Waiting for rider to accept...
                  </div>
                )}

                {order.status === "accepted" && (
                  <div className="status-message">
                    Order picked up by {order.rider_name}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerOrdersPage;
