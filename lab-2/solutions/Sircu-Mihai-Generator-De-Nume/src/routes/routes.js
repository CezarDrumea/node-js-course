import express from 'express';
import * as controller from '../controller/controller.js';
import * as authController from '../controller/authController.js';
import * as authModel from '../model/authModel.js';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const SECRET = 'supersecret'; // Should be from environment variables in production
const JSON_SERVER_URL = 'http://localhost:4000'; // Needed for requireAuth

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

// Middleware: requireAuth
export async function requireAuth(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  if (isNonEmpty(sessionId)) {
    try {
      const session = await authModel.getSessionById(sessionId);
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

// --- Authentication Router --- (public routes)
const authRouter = express.Router();
authRouter.get('/login', authController.renderLogin);
authRouter.post('/login-cookie', authController.loginCookie);
authRouter.post('/logout-cookie', authController.logoutCookie);
authRouter.post('/login-jwt', authController.loginJwt);
authRouter.post('/logout-jwt', authController.logoutJwt);

// --- Names Router --- (application routes)
const namesRouter = express.Router();
// Removed: namesRouter.use(requireAuth); // Apply requireAuth to all routes in namesRouter

namesRouter.get('/', controller.renderList);
namesRouter.get('/api', controller.getAll);
namesRouter.get('/saved', controller.getSaved);
namesRouter.post('/api', controller.create);
namesRouter.patch('/api/:id', controller.update);
namesRouter.delete('/api/:id', controller.remove);

// --- Main Application Router ---
const appRouter = express.Router();

// Redirect root to /login
appRouter.get('/', (req, res) => res.redirect('/login'));

// Mount the authentication routes directly at the root
appRouter.use(authRouter);

// Mount the namesRouter at /names path, applying requireAuth here
appRouter.use('/names', requireAuth, namesRouter);

export default appRouter;
