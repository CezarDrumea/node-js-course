import express from "express";
import {
  showLoginPage,
  loginUser,
  logoutUser,
  showSignUpPage,
  signUpUser
} from "../controllers/authController.js";
import { redirectIfAuthenticated } from "../middlewares/auth.js";
import { validateForm } from "../middlewares/authValidate.js";
import { signUpSchema, loginSchema } from "../schemas/authSchemas.js";

const router = express.Router();

// SIGNUP
router.get("/signup", redirectIfAuthenticated, showSignUpPage);
router.post("/signup", validateForm(signUpSchema, "signup"), signUpUser);

// LOGIN
router.get("/login", redirectIfAuthenticated, showLoginPage);
router.post("/login", validateForm(loginSchema, "login"), loginUser);

// LOGOUT
router.post("/logout", logoutUser);

export default router;