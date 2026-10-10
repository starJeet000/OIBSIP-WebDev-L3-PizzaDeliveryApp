import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../controllers/userController.js";

const router = express.Router();

// All routes here require the user to be authenticated
router.use(protect);

router.route("/profile").get(getUserProfile).put(updateUserProfile);

router.put("/change-password", changePassword);

export default router;
