import path from 'path';
import express from 'express';
import tasksRouter from './routes/routes.js';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sequelize from './config/database.js';
import User from './model/User.js';
import Session from './model/Session.js';
import Name from './model/Name.js';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(helmet());
app.use(cors());
app.use(limiter);

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

const SECRET = 'supersecret';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
};

const jwtCookieOptions = {
  httpOnly: false,
  sameSite: 'lax',
  path: '/',
};

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

async function syncAndSeed() {
  await sequelize.sync({ force: true });

  console.log('Database synced and seeded with data from db.json!');
}

async function findUserExact(username, password) {
  if (!isNonEmpty(username) || !isNonEmpty(password)) return null;
  const user = await User.findOne({ where: { username, password } });
  return user;
}

async function getSessionById(sessionId) {
  const session = await Session.findByPk(sessionId);
  return session;
}

async function deleteSession(sessionId) {
  await Session.destroy({ where: { id: sessionId } });
}

async function requireAuth(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  if (isNonEmpty(sessionId)) {
    try {
      const session = await getSessionById(sessionId);
      if (session?.userId) {
        const user = await User.findByPk(session.userId);
        if (user) {
          req.user = { id: user.id, username: user.username, name: user.name };
          req.sessionId = sessionId;
          return next();
        }
      }
    } catch (e) {
      console.error('Eroare la verificarea sesiunii cookie:', e);
    }
  }

  const token = req.cookies?.jwtToken;
  if (isNonEmpty(token)) {
    try {
      const decoded = jwt.verify(token, SECRET);
      req.jwt = decoded;
      return next();
    } catch (e) {
      console.error('Eroare la verificarea token-ului JWT:', e);
    }
  }

  res.redirect('/login');
}

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

app.post('/login-cookie', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await findUserExact(username, password);
    if (!user) {
      return res
        .status(401)
        .render('login', { error: 'Credențiale invalide pentru cookie' });
    }

    const sessionId = crypto.randomUUID();
    await Session.create({
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    res.cookie('sessionId', sessionId, cookieOptions);
    res.redirect('/names');
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).render('login', { error: e.errors[0].message });
    }
    console.error(e);
    res.status(500).render('login', { error: 'Eroare la login cookie' });
  }
});

app.post('/logout-cookie', async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId;
    if (isNonEmpty(sessionId)) {
      try {
        await deleteSession(sessionId);
      } catch {}
    }
    res.clearCookie('sessionId', cookieOptions);
    res.redirect('/login');
  } catch (e) {
    console.error(e);
    res.redirect('/login');
  }
});

app.post('/login-jwt', async (req, res) => {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim();
    password = (password || '').trim();

    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      return res.status(400).render('login', {
        error: 'Username și parola sunt obligatorii',
      });
    }

    const user = await findUserExact(username, password);
    if (!user) {
      return res
        .status(401)
        .render('login', { error: 'Credențiale invalide pentru JWT' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('jwtToken', token, jwtCookieOptions);
    res.redirect('/names');
  } catch (e) {
    console.error(e);
    res.status(500).render('login', { error: 'Eroare la login JWT' });
  }
});

app.post('/logout-jwt', (req, res) => {
  res.clearCookie('jwtToken', jwtCookieOptions);
  res.redirect('/names');
});

app.get('/', (req, res) => res.redirect('/login'));

app.use('/names', requireAuth, tasksRouter);

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
sequelize.sync().then(() => {
  app.listen(PORT, () =>
    console.log(`
    Server: http://localhost:${PORT}
`)
  );
});
