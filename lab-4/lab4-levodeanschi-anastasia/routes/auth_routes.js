import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/auth_controller.js';

const router = express.Router();

// GET → pagini Pug
router.get('/auth', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register', { errors: [] }));

// POST → acțiuni formulare
router.post('/auth', loginUser);
router.post('/register', registerUser);

// logout
router.get('/logout', logoutUser);

export default router;
