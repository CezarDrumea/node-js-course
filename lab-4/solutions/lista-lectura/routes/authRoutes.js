const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../middleware/validateAuth");

router.get("/register", auth.showRegister);
router.post("/register", validateRegister, auth.register);

router.get("/login", auth.showLogin);
router.post("/login", validateLogin, auth.login);

router.get("/logout", auth.logout);

module.exports = router;
