import { Router } from 'express';
import { showLoginForm, login, logout } from '../controllers/authController.js';

const router = Router();

router.get('/login', showLoginForm);
router.post('/login', login);
router.post('/logout', logout);

export default router;