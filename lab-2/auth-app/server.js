const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

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

//////////////////////////////

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

app.post('/login-cookie', async (req, res) => {
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

    const sessionId = crypto.randomUUID();
    await axios.post(`${JSON_SERVER_URL}/sessions`, {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    res.cookie('sessionId', sessionId, cookieOptions);

    res.json({
      message: 'Logged in with cookie!',
      sessionId,
      user: { id: user.id, username: user.username, name: user.name },
    });
  } catch (e) {
    res.status(500).json({ message: 'Login error' });
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
      { expiresIn: '1h' }
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

app.listen(3000, () => {
  console.log('Express: http://localhost:3000');
});
