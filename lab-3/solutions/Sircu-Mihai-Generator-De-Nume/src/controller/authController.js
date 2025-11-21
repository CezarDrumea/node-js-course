import jwt from 'jsonwebtoken';
import * as authModel from '../model/authModel.js';

const SECRET = 'supersecret'; // Should be from environment variables in production

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

export async function renderLogin(req, res) {
  res.render('login', { error: null });
}

export async function loginCookie(req, res) {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim();
    password = (password || '').trim();

    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      return res.status(400).render('login', {
        error: 'Username și parola sunt obligatorii',
      });
    }

    const user = await authModel.findUserExact(username, password);
    if (!user) {
      return res
        .status(401)
        .render('login', { error: 'Credențiale invalide pentru cookie' });
    }

    const sessionId = authModel.generateSessionId();
    await authModel.createSession(sessionId, user.id);

    res.cookie('sessionId', sessionId, cookieOptions);
    res.redirect('/names');
  } catch (e) {
    console.error(e);
    res.status(500).render('login', { error: 'Eroare la login cookie' });
  }
}

export async function logoutCookie(req, res) {
  try {
    const sessionId = req.cookies?.sessionId;
    if (isNonEmpty(sessionId)) {
      try {
        await authModel.deleteSession(sessionId);
      } catch {}
    }
    res.clearCookie('sessionId', cookieOptions);
    res.redirect('/login');
  } catch (e) {
    console.error(e);
    res.redirect('/login');
  }
}

export async function loginJwt(req, res) {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim();
    password = (password || '').trim();

    if (!isNonEmpty(username) || !isNonEmpty(password)) {
      return res.status(400).render('login', {
        error: 'Username și parola sunt obligatorii',
      });
    }

    const user = await authModel.findUserExact(username, password);
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
}

export function logoutJwt(req, res) {
  res.clearCookie('jwtToken', jwtCookieOptions);
  res.redirect('/names');
}
