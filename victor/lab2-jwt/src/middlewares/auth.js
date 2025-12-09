import jwt from 'jsonwebtoken';
import {
    JWT_SECRET,
    TOKEN_COOKIE_NAME,
} from '../config/authConfig.js';

export function requireJwt(req, res, next) {
    const token = req.cookies?.[TOKEN_COOKIE_NAME];

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = {
            id: decoded.id,
            username: decoded.username,
            name: decoded.name,
        };
        res.locals.currentUser = req.user;

        next();
    } catch (err) {
        console.error('JWT verify error:', err.message);
        res.clearCookie(TOKEN_COOKIE_NAME);
        return res.redirect('/login');
    }
}