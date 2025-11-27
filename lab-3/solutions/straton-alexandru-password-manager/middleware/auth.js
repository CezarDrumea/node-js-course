import jwt from 'jsonwebtoken';
import * as authService from '../services/authService.js';

const SECRET = process.env.JWT_SECRET || 'supersecret';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

/**
 * Middleware: Require valid cookie session
 */
export async function requireCookieSession(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  if (!isNonEmpty(sessionId)) {
    return res.status(401).json({ message: 'No session cookie' });
  }

  try {
    const session = await authService.getSessionById(sessionId);
    if (!session?.userId) {
      return res.status(401).json({ message: 'Invalid session' });
    }

    req.user = { id: session.user.id, username: session.user.username, name: session.user.name };
    req.sessionId = sessionId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'User not found' });
  }
}

/**
 * Middleware: Require valid JWT token
 */
export function requireJwt(req, res, next) {
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
export async function requireAuth(req, res, next) {
  // Try cookie first
  const sessionId = req.cookies?.sessionId;
  if (isNonEmpty(sessionId)) {
    try {
      const session = await authService.getSessionById(sessionId);
      if (session?.userId) {
        req.user = { id: session.user.id, username: session.user.username, name: session.user.name };
        req.sessionId = sessionId;
        req.authType = 'cookie';
        return next();
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

/**
 * Delete session
 */
export async function deleteSession(sessionId) {
  return authService.deleteSession(sessionId);
}
