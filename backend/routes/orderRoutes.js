import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrderStatus,
  getAdminOrders,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// Apply protect middleware to ALL routes below this line
router.use(protect);

// 1. STATIC ROUTES (Must be placed before dynamic /:id routes)
router.route("/admin").get(admin, getAdminOrders);
router.route("/create").post(createOrder);
router.route("/myorders").get(getMyOrders);

// 2. DYNAMIC PARAMETER ROUTES
router.route("/:id").get(getOrderById);
router.route("/:id/status").put(admin, updateOrderStatus);
router.route("/:id/cancel").put(admin, cancelOrder);
router.route("/:orderId/status").get(getOrderStatus);

export default router;
