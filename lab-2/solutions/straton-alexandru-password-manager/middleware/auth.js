const jwt = require('jsonwebtoken');
const axios = require('axios');

const SECRET = process.env.JWT_SECRET || 'supersecret';
const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

/**
 * Get session by ID from JSON Server
 */
async function getSessionById(sessionId) {
  const { data } = await axios.get(`${JSON_SERVER_URL}/sessions`, {
    params: { id: sessionId },
  });
  return Array.isArray(data) && data.length ? data[0] : null;
}

/**
 * Delete session from JSON Server
 */
async function deleteSession(sessionId) {
  await axios.delete(`${JSON_SERVER_URL}/sessions/${sessionId}`);
}

/**
 * Middleware: Require valid cookie session
 */
async function requireCookieSession(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  if (!isNonEmpty(sessionId)) {
    return res.status(401).json({ message: 'No session cookie' });
  }

  try {
    const session = await getSessionById(sessionId);
    if (!session?.userId) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    const { data: user } = await axios.get(
      `${JSON_SERVER_URL}/users/${session.userId}`
    );
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { id: user.id, username: user.username, name: user.name };
    req.sessionId = sessionId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'User not found' });
  }
}

/**
 * Middleware: Require valid JWT token
 */
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
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Middleware: Require authentication (cookie or JWT)
 */
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
    } catch (error) {
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
      } catch (error) {
        // Continue to error
      }
    }
  }

  // Not authenticated
  return res.status(401).json({ message: 'Authentication required' });
}

module.exports = {
  requireAuth,
  requireCookieSession,
  requireJwt,
  getSessionById,
  deleteSession,
  SECRET,
  JSON_SERVER_URL,
};
