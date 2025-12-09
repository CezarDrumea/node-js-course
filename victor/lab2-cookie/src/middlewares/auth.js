import {
    cookieOptions,
    getSessionById,
    getUserById,
    isNonEmpty,
} from '../models/authModel.js';

export async function requireCookieSession(req, res, next) {
    const sessionId = req.cookies?.sessionId;

    if (!isNonEmpty(sessionId)) {
        return res.redirect('/login');
    }

    try {
        const session = await getSessionById(sessionId);

        if (!session?.userId) {
            res.clearCookie('sessionId', cookieOptions);
            return res.redirect('/login');
        }

        const user = await getUserById(session.userId);
        if (!user) {
            res.clearCookie('sessionId', cookieOptions);
            return res.redirect('/login');
        }

        req.user = { id: user.id, username: user.username, name: user.name };
        req.sessionId = sessionId;
        res.locals.currentUser = req.user;

        next();
    } catch (err) {
        console.error(err);
        res.clearCookie('sessionId', cookieOptions);
        return res.redirect('/login');
    }
}