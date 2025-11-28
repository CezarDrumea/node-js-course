const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Middleware & Routes
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware Setup
// ============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// ============================================
// Routes
// ============================================

// Public auth routes (login, logout)
app.use('/', authRoutes);

// Password manager routes (auth applied per-route)
app.use('/', passwordRoutes);

// ============================================
// Error Handling
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ============================================
// Server Start
// ============================================
app.listen(PORT, () => {
  console.log(`✓ Password Manager running on http://localhost:${PORT}`);
  console.log(`✓ Login page: http://localhost:${PORT}/login`);
  console.log(`✓ JSON Server should be running on http://localhost:3001`);
});