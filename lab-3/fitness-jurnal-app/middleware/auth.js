const { Session, User } = require('../models');

exports.loadUserFromCookie = async (req, res, next) => {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sessionId';
    const sid = req.cookies?.[cookieName];
    if (!sid) return next();

    const ses = await Session.findOne({ where: { id: sid }, include: User });
    if (ses && ses.User) {
        req.user = { id: ses.User.id, name: ses.User.name, username: ses.User.username };
        res.locals.user = req.user;
    }
    next();
};

exports.requireLogin = (req, res, next) => {
    if (!req.user) return res.redirect('/login');
    next();
};

exports.redirectIfLoggedIn = (req, res, next) => {
    if (req.user) return res.redirect('/');
    next();
};

exports.noStore = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};
