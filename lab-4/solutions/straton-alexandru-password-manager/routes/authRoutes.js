import express from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController.js';
import { requireCookieSession, requireJwt } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';

const router = express.Router();

const loginSchema = z.object({
  username: z.string().min(1).max(50).trim(),
  password: z.string().min(1).max(100),
});

router.get('/login', authController.getLogin);

router.post('/login-cookie', validateBody(loginSchema), authController.loginWithCookie);
router.get('/profile-cookie', requireCookieSession, authController.getProfileCookie);
router.post('/logout-cookie', requireCookieSession, authController.logoutCookie);

router.post('/login-jwt', validateBody(loginSchema), authController.loginWithJwt);
router.get('/profile-jwt', requireJwt, authController.getProfileJwt);
router.get('/my-data-jwt', requireJwt, authController.getMyDataJwt);
router.post('/logout-jwt', authController.logoutJwt);

export default router;
