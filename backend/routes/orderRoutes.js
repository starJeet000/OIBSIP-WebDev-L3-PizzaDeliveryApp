import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getOrderStatus,
  getMyOrders,
} from "../controllers/orderController.js";

const router = express.Router();

// All order routes are protected[cite: 1]
router.use(protect);

router.post("/create", createOrder);
router.get("/myorders", getMyOrders);
router.get("/:orderId/status", getOrderStatus);

export default router;
