// controllers/orderController.js
import {
  createOrder as createOrderModel,
  getOrdersByCustomer,
  updateOrderStatusInDB,
  getAllPendingOrders,
  assignRiderToOrder,
  getAcceptedOrdersByRider,
  markOrderAsCompleted,
  getRiderDeliveryHistory, // ← ADD THIS IMPORT
  getRiderStats,
  getOrdersByRestaurant,
} from "../model/orderModel.js";

export const getRestaurantOrders = async (req, res) => {
  const { restaurantId } = req.params;

  if (!restaurantId) {
    return res.status(400).json({ message: "Missing restaurantId" });
  }

  try {
    const orders = await getOrdersByRestaurant(restaurantId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching restaurant orders:", error);
    res.status(500).json({ message: "Failed to fetch restaurant orders" });
  }
};

export const createOrder = async (req, res) => {
  const { user, cartItems, location, totalAmount, restaurant } = req.body;

  if (!user || !location || !cartItems?.length || !restaurant) {
    return res.status(400).json({
      message:
        "Missing required fields (user, location, cartItems, or restaurant)",
    });
  }

  const orderData = {
    id: user.id,
    fullName: user.fullName || user.name,
    phoneNumber: user.phone,
    address: location.address,
    latitude: location.lat,
    longitude: location.lng,
    restaurantId: restaurant.id || null,
    restaurantName: restaurant.businessName || null,
    totalAmount,
  };

  const safeCartItems = cartItems.map((item) => ({
    id: item.id,
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    image: item.image || null,
  }));

  try {
    const { orderId } = await createOrderModel(orderData, safeCartItems);
    res.status(201).json({ message: "Order created", orderId });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrders = async (req, res) => {
  const customerId = req.query.customerId;

  if (!customerId) {
    return res.status(400).json({ message: "Missing customerId in query." });
  }

  try {
    const orders = await getOrdersByCustomer(customerId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await updateOrderStatusInDB(id, status);
    res.json({ message: "Order status updated" });
  } catch (error) {
    console.error("Failed to update order status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPendingOrders = async (req, res) => {
  try {
    const pendingOrders = await getAllPendingOrders();
    res.status(200).json(pendingOrders);
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.status(500).json({ message: "Failed to fetch pending orders" });
  }
};

// ✅ Optional: Assign a rider to an order
export const acceptOrder = async (req, res) => {
  const { id } = req.params;
  const { riderId, riderName } = req.body;

  if (!riderId || !riderName) {
    return res.status(400).json({ message: "Missing riderId or riderName" });
  }

  try {
    await assignRiderToOrder(id, riderId, riderName);
    res.status(200).json({ message: "Order accepted by rider" });
  } catch (error) {
    console.error("Failed to assign rider:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAcceptedOrders = async (req, res) => {
  const { riderId } = req.query;

  if (!riderId) {
    return res.status(400).json({ message: "Missing riderId" });
  }

  try {
    const acceptedOrders = await getAcceptedOrdersByRider(riderId);
    res.status(200).json(acceptedOrders);
  } catch (error) {
    console.error("Error fetching accepted orders:", error);
    res.status(500).json({ message: "Failed to fetch accepted orders" });
  }
};

export const completeOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await markOrderAsCompleted(orderId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order marked as completed" });
  } catch (error) {
    console.error("Error completing order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRiderHistory = async (req, res) => {
  const { riderId } = req.params;

  if (!riderId) {
    return res.status(400).json({ message: "Missing riderId" });
  }

  try {
    const history = await getRiderDeliveryHistory(riderId);
    res.status(200).json(history);
  } catch (error) {
    console.error("Error fetching rider history:", error);
    res.status(500).json({ message: "Failed to fetch delivery history" });
  }
};

export const getRiderStatistics = async (req, res) => {
  const { riderId } = req.params;

  if (!riderId) {
    return res.status(400).json({ message: "Missing riderId" });
  }

  try {
    const stats = await getRiderStats(riderId);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching rider stats:", error);
    res.status(500).json({ message: "Failed to fetch rider statistics" });
  }
};
