const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();
const PORT = 3000;

// View engine & parsing
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// JSON server config (same pattern as auth-app)
const SECRET = 'supersecret';
const JSON_SERVER_URL = 'http://localhost:3001';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  // secure: true,
  // maxAge: 1000 * 60 * 60
};

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

async function findUserExact(username, password) {
  if (!isNonEmpty(username) || !isNonEmpty(password)) return null;
  const { data } = await axios.get(`${JSON_SERVER_URL}/users`, {
    params: { username, password },
  });
  return Array.isArray(data)
    ? data.find((u) => u.username === username && u.password === password) || null
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

async function requireCookieSession(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  if (!isNonEmpty(sessionId)) {
    return res.status(401).json({ message: 'No session cookie' });
  }
  const session = await getSessionById(sessionId);
  if (!session?.userId) {
    return res.status(401).json({ message: 'Invalid session' });
  }

  try {
    const { data: user } = await axios.get(
      `${JSON_SERVER_URL}/users/${session.userId}`
    );
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { id: user.id, username: user.username, name: user.name };
    req.sessionId = sessionId;
    next();
  } catch {
    return res.status(401).json({ message: 'User not found' });
  }
}

function requireJwt(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token required' });
  }
  const token = auth.slice(7).trim();
  const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
  if (!jwtPattern.test(token) || token === 'null' || token === 'undefined') {
    return res.status(401).json({ message: 'Invalid token format' });
  }
  try {
    const decoded = jwt.verify(token, SECRET);
    req.jwt = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Login page (public)
app.get('/login', (req, res) => {
  const error = req.query.error || null;
  res.render('login', { error });
});

// Cookie-based auth endpoints
app.post('/login-cookie', async (req, res) => {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim();
    password = (password || '').trim();

    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      return res.redirect('/login?error=Username and password are required');
    }

    const user = await findUserExact(username, password);
    if (!user) return res.redirect('/login?error=Invalid credentials');

    const sessionId = crypto.randomUUID();
    await axios.post(`${JSON_SERVER_URL}/sessions`, {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    res.cookie('sessionId', sessionId, cookieOptions);
    res.redirect('/');
  } catch (e) {
    res.redirect('/login?error=Login error');
  }
});

app.get('/profile-cookie', requireCookieSession, (req, res) => {
  res.json({ message: 'Cookie auth success!', user: req.user });
});

app.post('/logout-cookie', requireCookieSession, async (req, res) => {
  await deleteSession(req.sessionId);
  res.clearCookie('sessionId', cookieOptions);
  res.json({ message: 'Logged out (cookie)' });
});

// JWT-based auth endpoints
app.post('/login-jwt', async (req, res) => {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim();
    password = (password || '').trim();

    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      return res
        .status(400)
        .json({ message: 'Username and password are required' });
    }

    const user = await findUserExact(username, password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, name: user.name },
      SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Logged in with JWT!', token });
  } catch {
    res.status(500).json({ message: 'Login error' });
  }
});

app.get('/profile-jwt', requireJwt, (req, res) => {
  res.json({ message: 'JWT auth success!', user: req.jwt });
});

app.get('/my-data-jwt', requireJwt, (req, res) => {
  res.json({
    message: 'OK',
    userId: req.jwt.id,
    tip: 'Attach JWT to access protected APIs',
  });
});

app.post('/logout-jwt', (req, res) => {
  res.json({ message: 'Logged out (JWT) - clear token from localStorage' });
});

// Middleware to check authentication (cookie or JWT)
async function requireAuth(req, res, next) {
  // Try cookie first
  const sessionId = req.cookies?.sessionId;
  if (isNonEmpty(sessionId)) {
    try {
      const session = await getSessionById(sessionId);
      if (session?.userId) {
        const { data: user } = await axios.get(
          `${JSON_SERVER_URL}/users/${session.userId}`
        );
        if (user) {
          req.user = { id: user.id, username: user.username, name: user.name };
          req.sessionId = sessionId;
          req.authType = 'cookie';
          return next();
        }
      }
    } catch (e) {
      // Continue to JWT check
    }
  }

  // Try JWT
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
    if (jwtPattern.test(token) && token !== 'null' && token !== 'undefined') {
      try {
        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        req.authType = 'jwt';
        return next();
      } catch (e) {
        // Continue to error
      }
    }
  }

  // Not authenticated
  return res.status(401).json({ message: 'Authentication required' });
}

// Protect password manager routes with authentication
app.use('/', requireAuth, passwordRoutes);

app.listen(PORT, () => {
  console.log(`Password Manager running on http://localhost:${PORT}`);
  console.log(`Login page: http://localhost:${PORT}/login`);
});