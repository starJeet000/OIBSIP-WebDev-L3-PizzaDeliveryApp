import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  getInventory,
  updateStock,
  getLowStockAlerts,
} from "../controllers/inventoryController.js";

const router = express.Router();

// Apply protect and admin middleware to all routes in this file
router.use(protect, admin);

// @route   GET /api/inventory/alerts
router.get("/alerts", getLowStockAlerts); // MUST be before /:id

// @route   GET /api/inventory
router.get("/", getInventory);

// @route   PUT /api/inventory/:id
router.put("/:id", updateStock);

export default router;
