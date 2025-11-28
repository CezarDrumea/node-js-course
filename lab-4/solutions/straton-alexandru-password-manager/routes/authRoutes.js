import express from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController.js';
import { requireCookieSession, requireJwt } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validation.js';

const router = express.Router();

// Login validation schema
const loginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required')
    .max(50, 'Username must be 50 characters or less')
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password must be 100 characters or less'),
});

// Query validation schema for login page
const loginQuerySchema = z.object({
  error: z.string().max(255).optional(),
});

router.get('/login', validateQuery(loginQuerySchema), authController.getLogin);

router.post('/login-cookie', validateBody(loginSchema), authController.loginWithCookie);
router.get('/profile-cookie', requireCookieSession, authController.getProfileCookie);
router.post('/logout-cookie', requireCookieSession, authController.logoutCookie);

router.post('/login-jwt', validateBody(loginSchema), authController.loginWithJwt);
router.get('/profile-jwt', requireJwt, authController.getProfileJwt);
router.get('/my-data-jwt', requireJwt, authController.getMyDataJwt);
router.post('/logout-jwt', authController.logoutJwt);

export default router;
