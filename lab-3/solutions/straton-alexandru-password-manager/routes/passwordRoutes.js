import express from 'express';
import passwordController from '../controllers/passwordController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public dashboard shell (HTML only, data loaded via JWT-protected API)
router.get('/', passwordController.shell);

// JWT-protected dashboard data API
router.get('/api/dashboard', requireAuth, passwordController.dashboardData);

// Protected routes (require auth)
router.post('/add', requireAuth, passwordController.create);
router.post('/reveal/:id', requireAuth, passwordController.reveal);
router.put('/update/:id', requireAuth, passwordController.update);
router.delete('/delete/:id', requireAuth, passwordController.delete);

export default router;