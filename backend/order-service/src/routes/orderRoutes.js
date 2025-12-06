import express from "express";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getPendingOrders,
  acceptOrder,
  getAcceptedOrders,
  completeOrder,
  getRiderHistory,
  getRiderStatistics,
  getRestaurantOrders,
  prepareOrder,
  markOrderReady,
  getSellerStatistics,
} from "../controller/orderController.js";

const router = express.Router();

router.get("/all", getOrders);
router.get("/accepted", getAcceptedOrders);
router.get("/pending", getPendingOrders);
router.post("/create", createOrder);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/assign", acceptOrder);
router.patch("/:orderId/complete", completeOrder);
router.get("/restaurant/:restaurantId", getRestaurantOrders);
router.get("/seller/:restaurantId/stats", getSellerStatistics); // ✅ Add this route

// Seller order management endpoints
router.patch("/:orderId/prepare", prepareOrder);
router.patch("/:orderId/ready", markOrderReady);

// Rider-specific endpoints
router.get("/rider/:riderId/history", getRiderHistory);
router.get("/rider/:riderId/stats", getRiderStatistics);

export default router;
