import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getDashboardMetrics } from "../controllers/adminController.js";

const router = express.Router();

// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get("/dashboard", protect, admin, getDashboardMetrics);

export default router;
