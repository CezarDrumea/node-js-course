import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getUserProfile, changePassword } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", requireAuth, getUserProfile);
router.post("/profile/change-password", requireAuth, changePassword);

export default router;