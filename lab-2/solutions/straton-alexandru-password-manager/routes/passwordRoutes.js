const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { requireAuth } = require('../middleware/auth');

// Public dashboard shell (HTML only, data loaded via auth-protected API)
router.get('/', passwordController.shell);

// Auth-protected dashboard data API (supports cookie or JWT via requireAuth)
router.get('/api/dashboard', requireAuth, passwordController.dashboardData);

// Protected routes (require auth)
router.post('/add', requireAuth, passwordController.create);
router.post('/reveal/:id', requireAuth, passwordController.reveal);
router.put('/update/:id', requireAuth, passwordController.update);
router.delete('/delete/:id', requireAuth, passwordController.delete);

module.exports = router;