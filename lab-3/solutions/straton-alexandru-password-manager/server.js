import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import { requireAuth } from './middleware/auth.js';
import authRoutes from './routes/authRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import prisma from './lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/', authRoutes);
app.use('/', passwordRoutes);

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