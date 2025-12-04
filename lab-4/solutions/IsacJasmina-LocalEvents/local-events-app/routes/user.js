import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import { getUserProfile, changePassword } from "../controllers/userController.js";
import { validateChangePassword } from "../middlewares/changePasswordValidate.js";
import { changePasswordSchema } from "../schemas/authSchemas.js";

const router = express.Router();

router.get("/profile", requireAuth, getUserProfile);
router.post("/profile/change-password", requireAuth, validateChangePassword(changePasswordSchema), changePassword);

export default router;