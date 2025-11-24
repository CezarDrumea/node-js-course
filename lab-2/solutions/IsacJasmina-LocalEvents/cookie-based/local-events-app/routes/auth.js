import express from "express";
import {
  showLoginPage,
  loginUser,
  logoutUser,
  showSignUpPage,
  signUpUser
} from "../controllers/authController.js";

const router = express.Router();

router.get("/login", showLoginPage);
router.post("/login", loginUser);

router.get("/signup", showSignUpPage);
router.post("/signup", signUpUser);

router.post("/logout", logoutUser);

export default router;
