const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireCookieSession, requireJwt } = require('../middleware/auth');

// Public routes
router.get('/login', authController.getLogin);

// Cookie-based auth
router.post('/login-cookie', authController.loginWithCookie);
router.get('/profile-cookie', requireCookieSession, authController.getProfileCookie);
router.post('/logout-cookie', requireCookieSession, authController.logoutCookie);

// JWT-based auth
router.post('/login-jwt', authController.loginWithJwt);
router.get('/profile-jwt', requireJwt, authController.getProfileJwt);
router.get('/my-data-jwt', requireJwt, authController.getMyDataJwt);
router.post('/logout-jwt', authController.logoutJwt);

module.exports = router;
