import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import usersRouter from './routes/users.js';
import { errorHandler, notFoundHandler } from './utils/error-handlers.js';

const app = express();

app.use(helmet());

app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(new URL('../public/index.html', import.meta.url));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', usersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`validation-app listening on http://localhost:${PORT}`);
});
