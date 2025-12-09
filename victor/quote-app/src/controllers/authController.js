import jwt from 'jsonwebtoken';
import { findUserExact } from '../models/authModel.js';
import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    TOKEN_COOKIE_NAME,
    tokenCookieOptions,
} from '../config/authConfig.js';
import { loginSchema } from '../validation/schemas.js';

export function showLoginForm(req, res) {
    if (req.cookies?.[TOKEN_COOKIE_NAME]) {
        return res.redirect('/quotes');
    }

    res.render('auth/login', { error: null });
}

export async function login(req, res, next) {
    try {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || 'Invalid credentials';
            return res.status(400).render('auth/login', { error: message });
        }

        const { username, password } = parsed.data;

        const user = await findUserExact(username, password);
        if (!user) {
            return res
                .status(401)
                .render('auth/login', { error: 'Invalid username or password' });
        }

        const payload = {
            id: user.id,
            username: user.username,
            name: user.name,
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        res.cookie(TOKEN_COOKIE_NAME, token, tokenCookieOptions);

        res.redirect('/quotes');
    } catch (err) {
        console.error(err);
        next(err);
    }
}

export function logout(req, res) {
    res.clearCookie(TOKEN_COOKIE_NAME, tokenCookieOptions);
    res.redirect('/login');
}