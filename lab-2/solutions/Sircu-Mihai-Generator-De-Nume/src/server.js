import path from 'path';
import express from 'express';
import tasksRouter from './routes/routes.js';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

const SECRET = 'supersecret';
const JSON_SERVER_URL = 'http://localhost:4000';

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

async function findUserExact(username, password) {
  if (!isNonEmpty(username) || !isNonEmpty(password)) return null;
  const { data } = await axios.get(`${JSON_SERVER_URL}/users`, {
    params: { username, password },
  });
  return Array.isArray(data)
    ? data.find((u) => u.username === username && u.password === password) ||
        null
    : null;
}

async function getSessionById(sessionId) {
  const { data } = await axios.get(`${JSON_SERVER_URL}/sessions`, {
    params: { id: sessionId },
  });
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function deleteSession(sessionId) {
  await axios.delete(`${JSON_SERVER_URL}/sessions/${sessionId}`);
}

async function requireAuth(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  if (isNonEmpty(sessionId)) {
    try {
      const session = await getSessionById(sessionId);
      if (session?.userId) {
        const { data: user } = await axios.get(`${JSON_SERVER_URL}/users/${session.userId}`);
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

app.post('/login-cookie', async (req, res) => {
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
        .render('login', { error: 'Credențiale invalide pentru cookie' });
    }

    const sessionId = crypto.randomUUID();
    await axios.post(`${JSON_SERVER_URL}/sessions`, {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    res.cookie('sessionId', sessionId, cookieOptions);
    res.redirect('/names');
  } catch (e) {
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
app.listen(PORT, () =>
  console.log(`
    Server: http://localhost:${PORT}
    DB: http://localhost:4000
`)
);
