import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(protect);

// 1. STATIC ROUTES
router.post("/create", createOrder);
router.get("/", getMyOrders); // Section 7 Spec Compliant
router.get("/myorders", getMyOrders); // Frontend Fallback (Prevents 404)

// 2. DYNAMIC ROUTES (Must stay at the bottom so they don't hijack static routes)
router.get("/:orderId", getOrderById);
router.get("/:orderId/status", getOrderStatus);
router.put("/:orderId/cancel", admin, cancelOrder);

export default router;
