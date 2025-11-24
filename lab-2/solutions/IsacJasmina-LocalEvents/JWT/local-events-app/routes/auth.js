import express from "express";
import {
  showLoginPage,
  loginUser,
  logoutUser,
  showSignUpPage,
  signUpUser
} from "../controllers/authController.js";
import { redirectIfAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/login", redirectIfAuthenticated, showLoginPage);
router.post("/login", loginUser);

router.get("/signup", redirectIfAuthenticated, showSignUpPage);
router.post("/signup", signUpUser);

router.post("/logout", logoutUser);

export default router;
