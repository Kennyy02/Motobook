import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { CalendarClock, Wallet, Menu } from "lucide-react";
import "../../styles/rider/RiderDashboard.css";

const RiderDashboard = () => {
  const { user } = useContext(AuthContext);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);

  //ORDER SERVICE DOMAIN
  const orderServiceBaseURL =
    import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:3004";

  const [activeMenu, setActiveMenu] = useState(() => {
    return localStorage.getItem("riderActiveMenu") || "dashboard";
  });

  const [deliveryTab, setDeliveryTab] = useState("ongoing");

  useEffect(() => {
    localStorage.setItem("riderActiveMenu", activeMenu);
  }, [activeMenu]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await axios.get(
          `${orderServiceBaseURL}/api/orders/pending`
        );
        setPendingOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch pending orders:", err);
      }
    };

    fetchPendingOrders();
  }, []);

  useEffect(() => {
    if (activeMenu === "accepted") {
      const fetchAcceptedOrders = async () => {
        try {
          const res = await axios.get(
            `${orderServiceBaseURL}/api/orders/accepted?riderId=${user.id}`
          );
          const ongoing = res.data.filter(
            (order) => order.status !== "completed"
          );
          const completed = res.data.filter(
            (order) => order.status === "completed"
          );
          setAcceptedOrders(ongoing);
          setCompletedOrders(completed);
        } catch (err) {
          console.error("Failed to fetch accepted orders:", err);
        }
      };

      fetchAcceptedOrders();
    }
  }, [activeMenu, user.id]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await axios.patch(`${orderServiceBaseURL}/api/orders/${orderId}/assign`, {
        riderId: user.id,
        riderName: user.name,
      });

      setPendingOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error("Failed to accept order:", error);
      alert("Error accepting order.");
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await axios.patch(
        `${orderServiceBaseURL}/api/orders/${orderId}/complete`
      );
      const orderToMove = acceptedOrders.find((order) => order.id === orderId);

      setAcceptedOrders((prev) => prev.filter((o) => o.id !== orderId));
      setCompletedOrders((prev) => [
        ...prev,
        { ...orderToMove, status: "completed" },
      ]);
    } catch (err) {
      console.error("Failed to complete order:", err);
      alert("Failed to complete the order.");
    }
  };

  return (
    <div className="rider-dashboard-container">
      {/* Sidebar */}
      <aside className="rider-sidebar">
        <div className="sidebar-header">
          <Menu size={20} />
          <span>Rider Panel</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeMenu === "dashboard" ? "active" : ""}
            onClick={() => setActiveMenu("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={activeMenu === "orders" ? "active" : ""}
            onClick={() => setActiveMenu("orders")}
          >
            Available Orders
          </button>
          <button
            className={activeMenu === "accepted" ? "active" : ""}
            onClick={() => setActiveMenu("accepted")}
          >
            My Deliveries
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="rider-dashboard-main">
        {activeMenu === "dashboard" && (
          <>
            <h2>Welcome, {user?.name || "Rider"}</h2>
            <p>
              Use the sidebar to view available orders and manage deliveries.
            </p>
          </>
        )}

        {activeMenu === "orders" && (
          <>
            <h2>Available Orders</h2>
            {pendingOrders.length === 0 ? (
              <p>No pending orders at the moment.</p>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="rider-order-card">
                  <div className="order-header">
                    <strong>Restaurant:</strong> {order.restaurant_name}
                  </div>
                  <div>
                    <strong>Address:</strong> {order.delivery_address}
                  </div>
                  <div className="order-meta">
                    <span>
                      <CalendarClock size={14} />{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                    <span>
                      <Wallet size={14} /> ₱{order.total_amount}
                    </span>
                  </div>
                  <div>
                    <strong>Items:</strong>
                    <ul className="order-items-list">
                      {order.items?.map((item) => (
                        <li key={item.product_id}>
                          {item.quantity} × {item.product_name} (₱{item.price})
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="accept-order-btn"
                    onClick={() => handleAcceptOrder(order.id)}
                  >
                    Accept Order
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {activeMenu === "accepted" && (
          <>
            <h2>My Deliveries</h2>
            <div className="delivery-tabs">
              <button
                className={deliveryTab === "ongoing" ? "active" : ""}
                onClick={() => setDeliveryTab("ongoing")}
              >
                Ongoing
              </button>
              <button
                className={deliveryTab === "completed" ? "active" : ""}
                onClick={() => setDeliveryTab("completed")}
              >
                Completed
              </button>
            </div>

            {deliveryTab === "ongoing" &&
              (acceptedOrders.length === 0 ? (
                <p>You have no ongoing deliveries.</p>
              ) : (
                acceptedOrders.map((order) => (
                  <div key={order.id} className="rider-order-card accepted">
                    <div className="order-header">
                      <strong>Restaurant:</strong> {order.restaurant_name}
                    </div>
                    <div>
                      <strong>Address:</strong> {order.delivery_address}
                    </div>
                    <div className="order-meta">
                      <span>
                        <CalendarClock size={14} />{" "}
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                      <span>
                        <Wallet size={14} /> ₱{order.total_amount}
                      </span>
                    </div>
                    <div>
                      <strong>Items:</strong>
                      <ul className="order-items-list">
                        {order.items?.map((item) => (
                          <li key={item.product_id}>
                            {item.quantity} × {item.product_name} (₱{item.price}
                            )
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      className="complete-order-btn"
                      onClick={() => handleCompleteOrder(order.id)}
                    >
                      Mark as Completed
                    </button>
                  </div>
                ))
              ))}

            {deliveryTab === "completed" &&
              (completedOrders.length === 0 ? (
                <p>No completed orders yet.</p>
              ) : (
                completedOrders.map((order) => (
                  <div key={order.id} className="rider-order-card completed">
                    <div className="order-header">
                      <strong>Restaurant:</strong> {order.restaurant_name}
                    </div>
                    <div>
                      <strong>Address:</strong> {order.delivery_address}
                    </div>
                    <div className="order-meta">
                      <span>
                        <CalendarClock size={14} />{" "}
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                      <span>
                        <Wallet size={14} /> ₱{order.total_amount}
                      </span>
                    </div>
                    <div>
                      <strong>Items:</strong>
                      <ul className="order-items-list">
                        {order.items?.map((item) => (
                          <li key={item.product_id}>
                            {item.quantity} × {item.product_name} (₱{item.price}
                            )
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ))}
          </>
        )}
      </main>
    </div>
  );
};

export default RiderDashboard;
