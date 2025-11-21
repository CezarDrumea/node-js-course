import path from 'path';
import express from 'express';
import appRouter from './routes/routes.js'; // Import the main appRouter
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet'; // Import Helmet for security headers
import cors from 'cors'; // Import Cors for Cross-Origin Resource Sharing
import rateLimit from 'express-rate-limit'; // Import express-rate-limit for rate limiting

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Apply Helmet middleware for various security headers
app.use(helmet());
// Apply CORS middleware to enable Cross-Origin Resource Sharing
app.use(cors());

// Configure and apply rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use(appRouter); // Use the main appRouter

app.use((req, res) =>
  res.status(404).render('index', { tasks: [], error: 'Not found' })
);

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .render('index', { tasks: [], error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`
    Server: http://localhost:${PORT}
    DB: http://localhost:4000
`)
);
