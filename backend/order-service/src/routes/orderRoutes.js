// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getPendingOrders,
  acceptOrder,
  getAcceptedOrders,
  completeOrder,
  getRiderHistory, // ✅ NEW
  getRiderStatistics, // ✅ NEW
  getRestaurantOrders,
} from "../controller/orderController.js";

const router = express.Router();

router.get("/all", getOrders);
router.get("/accepted", getAcceptedOrders);
router.get("/pending", getPendingOrders);
router.post("/create", createOrder);
router.patch("/:id/status", updateOrderStatus); // Keep this one, it already works
router.patch("/:id/assign", acceptOrder);
router.patch("/:orderId/complete", completeOrder);
router.get("/restaurant/:restaurantId", getRestaurantOrders);

// ✅ NEW: Rider-specific endpoints
router.get("/rider/:riderId/history", getRiderHistory);
router.get("/rider/:riderId/stats", getRiderStatistics);

export default router;
