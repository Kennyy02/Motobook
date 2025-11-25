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
} from "../controller/orderController.js";

const router = express.Router();

router.get("/all", getOrders);
router.get("/accepted", getAcceptedOrders);
router.get("/pending", getPendingOrders); // ✅ NEW endpoint
router.post("/create", createOrder);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/assign", acceptOrder); // for assigning a rider
router.patch("/:orderId/complete", completeOrder);

export default router;
