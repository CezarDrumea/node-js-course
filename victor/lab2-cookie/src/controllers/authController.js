import {
    findUserExact,
    createSession,
    deleteSession,
    cookieOptions,
} from '../models/authModel.js';

export function showLoginForm(req, res) {
    if (req.cookies?.sessionId) {
        return res.redirect('/quotes');
    }

    res.render('auth/login', { error: null });
}

export async function login(req, res, next) {
    try {
        let { username, password } = req.body || {};
        username = (username || '').trim();
        password = (password || '').trim();

        if (!username || !password) {
            return res.status(400).render('auth/login', {
                error: 'Username and password are required',
            });
        }

        const user = await findUserExact(username, password);
        if (!user) {
            return res.status(401).render('auth/login', {
                error: 'Invalid username or password',
            });
        }

        const { sessionId } = await createSession(user.id);

        res.cookie('sessionId', sessionId, cookieOptions);

        res.redirect('/quotes');
    } catch (err) {
        console.error(err);
        next(err);
    }
}

export async function logout(req, res, next) {
    try {
        const sessionId = req.cookies?.sessionId;
        if (sessionId) {
            await deleteSession(sessionId);
            res.clearCookie('sessionId', cookieOptions);
        }
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        next(err);
    }
}