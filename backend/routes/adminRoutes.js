import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getDashboardMetrics } from "../controllers/adminController.js";
import {
  getAdminOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import {
  getInventory,
  updateStock,
  getLowStockAlerts,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Apply protect and admin middleware to ALL admin routes
router.use(protect, admin);

// Dashboard Endpoints
router.get("/dashboard", getDashboardMetrics);

// Order Management Endpoints
router.get("/orders", getAdminOrders);
router.put("/orders/:orderId/status", updateOrderStatus);

// Inventory Management Endpoints
router.get("/inventory", getInventory);
router.get("/inventory/low-stock", getLowStockAlerts);
router.put("/inventory/:itemId", updateStock);

export default router;
