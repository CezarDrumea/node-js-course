const jwt = require('jsonwebtoken');
const { User } = require('../models');
const SECRET = process.env.JWT_SECRET || 'supersecret';

async function loadUserFromCookie(req, res, next) {
    const token = req.cookies.auth_token;
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findByPk(decoded.id);
        if (user) req.user = user;
    } catch (err) {
        console.warn('⚠️ Invalid or expired token');
    }

    next();
}

function requireLogin(req, res, next) {
    if (!req.user) return res.redirect('/auth/login');
    next();
}

function redirectIfLoggedIn(req, res, next) {
    if (req.user) return res.redirect('/');
    next();
}

function noStore(req, res, next) {
    res.set('Cache-Control', 'no-store');
    next();
}

module.exports = { loadUserFromCookie, requireLogin, redirectIfLoggedIn, noStore };
