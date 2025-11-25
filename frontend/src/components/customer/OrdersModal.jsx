import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext.js";
import "../../styles/customer/OrdersModal.css";
import {
  Clock,
  CheckCircle,
  XCircle,
  CalendarClock,
  Wallet,
} from "lucide-react";

function OrdersModal({ onClose, onMarkAllAsRead }) {
  const orderServiceBaseURL =
    import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3004";

  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  const { user } = useContext(AuthContext);

  // Load unreadCounts from localStorage, fallback to default
  const [unreadCounts, setUnreadCounts] = useState(() => {
    const saved = localStorage.getItem("unreadCounts");
    return saved
      ? JSON.parse(saved)
      : { pending: true, completed: true, cancelled: true };
  });

  // Persist unreadCounts to localStorage on change
  useEffect(() => {
    localStorage.setItem("unreadCounts", JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  const cancelOrder = async (orderId) => {
    try {
      await axios.patch(
        `${orderServiceBaseURL}/api/orders/${orderId}/status`,
        // `/api/orders/${orderId}/status`,
        {
          status: "canceled",
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          `${orderServiceBaseURL}/api/orders/all`,
          // "/api/orders/all",
          {
            params: { customerId: user.id },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
  }, [user]);

  const getCount = (status) =>
    unreadCounts[status] ? orders.filter((o) => o.status === status).length : 0;

  const handleMarkAllAsRead = () => {
    setUnreadCounts({
      pending: false,
      completed: false,
      cancelled: false,
    });
    onMarkAllAsRead?.(); // Notify Header
  };

  const filteredOrders = orders.filter((order) => order.status === activeTab);

  return (
    <div className="orders-modal-backdrop">
      <div className="orders-modal">
        <h2>My Orders</h2>
        <button className="close-btn" onClick={onClose}>
          X
        </button>

        {/* Tabs */}
        <div className="order-tabs">
          {["pending", "completed", "cancelled"].map((status) => {
            const icons = {
              pending: <Clock size={16} />,
              completed: <CheckCircle size={16} />,
              cancelled: <XCircle size={16} />,
            };

            return (
              <button
                key={status}
                className={activeTab === status ? "active" : ""}
                onClick={() => setActiveTab(status)}
              >
                {icons[status]}{" "}
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {getCount(status) > 0 && (
                  <span className="tab-badge">{getCount(status)}</span>
                )}
              </button>
            );
          })}
        </div>

        <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
          Mark all as read
        </button>

        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <p>No {activeTab} orders found.</p>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className={`order-card ${order.status}`}>
                <div className="order-card-header">
                  <div className="status-badge">
                    {order.status.toUpperCase()}
                  </div>
                  <div className="order-meta">
                    <div className="meta-item">
                      <CalendarClock size={14} />
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <div className="meta-item">
                      <Wallet size={14} />
                      <span className="order-total">₱{order.total_amount}</span>
                    </div>
                  </div>
                </div>

                <div className="order-info">
                  <p>
                    <strong>Restaurant:</strong> {order.restaurant_name}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.delivery_address}
                  </p>
                </div>

                <hr className="order-divider" />

                {order.items?.length > 0 && (
                  <div className="order-items">
                    <p>
                      <strong>Items:</strong>
                    </p>
                    <ul>
                      {order.items.map((item) => (
                        <li key={item.product_id} className="order-item">
                          <div className="item-image-wrapper">
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="item-image"
                            />
                          </div>
                          <div className="item-details">
                            <span>
                              {item.quantity} × {item.product_name}
                            </span>
                            <span>₱{item.price}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {order.status === "pending" && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersModal;
