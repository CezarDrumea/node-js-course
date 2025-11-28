import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { requireAuth } from './middleware/auth.js';
import { globalLimiter, authLimiter, passwordLimiter } from './middleware/rateLimiter.js';
import { securityHeaders, sanitizeInput } from './middleware/securityHeaders.js';
import { cspConfig } from './config/cspConfig.js';
import authRoutes from './routes/authRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import prisma from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware with CSP configuration
app.use(helmet(cspConfig));

// CORS configuration for all paths
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
app.use(cors(corsOptions));

// Additional security headers
app.use(securityHeaders);

// Global rate limiter
app.use(globalLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(express.static('public'));

// Input sanitization
app.use(sanitizeInput);

app.use('/', authLimiter, authRoutes);
app.use('/', passwordLimiter, passwordRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});


app.listen(PORT, async () => {
  console.log(`Password Manager running on http://localhost:${PORT}`);
  console.log(`Login page: http://localhost:${PORT}/login`);
  console.log(`Database: SQLite with Prisma ORM`);
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`Database connection successful`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});