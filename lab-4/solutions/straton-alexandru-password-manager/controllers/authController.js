import * as authService from '../services/authService.js';
import { deleteSession } from '../middleware/auth.js';

const isNonEmpty = (s) => typeof s === 'string' && s.trim().length > 0;

/**
 * GET /login - Render login page
 */
function getLogin(req, res) {
  const error = req.query.error || null;
  res.render('login', { error });
}

/**
 * POST /login-cookie - Cookie-based login
 */
async function loginWithCookie(req, res) {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim();
    password = (password || '').trim();

    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await authService.findUserExact(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const sessionId = await authService.createSession(user.id);
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    };

    res.cookie('sessionId', sessionId, cookieOptions);
    res.json({ message: 'Logged in with cookie!' });
  } catch (error) {
    console.error('Cookie login error:', error);
    res.status(500).json({ message: 'Login error' });
  }
}

/**
 * POST /login-jwt - JWT-based login
 */
async function loginWithJwt(req, res) {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim();
    password = (password || '').trim();

    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await authService.findUserExact(username, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = authService.generateToken(user);
    res.json({ message: 'Logged in with JWT!', token });
  } catch (error) {
    console.error('JWT login error:', error);
    res.status(500).json({ message: 'Login error' });
  }
}

/**
 * GET /profile-cookie - Get user profile (cookie auth)
 */
function getProfileCookie(req, res) {
  res.json({ message: 'Cookie auth success!', user: req.user });
}

/**
 * POST /logout-cookie - Logout (cookie auth)
 */
async function logoutCookie(req, res) {
  try {
    await deleteSession(req.sessionId);
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    };
    res.clearCookie('sessionId', cookieOptions);
    res.json({ message: 'Logged out (cookie)' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout error' });
  }
}

/**
 * GET /profile-jwt - Get user profile (JWT auth)
 */
function getProfileJwt(req, res) {
  res.json({ message: 'JWT auth success!', user: req.jwt });
}

/**
 * GET /my-data-jwt - Get user data (JWT auth)
 */
function getMyDataJwt(req, res) {
  res.json({
    message: 'OK',
    userId: req.jwt.id,
    tip: 'Attach JWT to access protected APIs',
  });
}

/**
 * POST /logout-jwt - Logout (JWT auth)
 */
function logoutJwt(req, res) {
  res.json({ message: 'Logged out (JWT) - clear token from localStorage' });
}

export {
  getLogin,
  loginWithCookie,
  loginWithJwt,
  getProfileCookie,
  logoutCookie,
  getProfileJwt,
  getMyDataJwt,
  logoutJwt,
};
