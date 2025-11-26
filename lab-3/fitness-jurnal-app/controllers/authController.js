const crypto = require('crypto');
const { User, Session } = require('../models');

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
};

exports.showLogin = async (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('login', { msg: '' });
};

exports.login = async (req, res) => {
    const { username = '', password = '' } = req.body;
    const user = await User.findOne({ where: { username: username.trim(), password: password.trim() } });
    if (!user) return res.render('login', { msg: 'Invalid credentials!' });

    // cleanup previous sessions (optional)
    await Session.destroy({ where: { userId: user.id } });

    const session = await Session.create({ id: crypto.randomUUID(), userId: user.id });
    res.cookie(process.env.SESSION_COOKIE_NAME || 'sessionId', session.id, cookieOptions);
    res.redirect('/');
};

exports.logout = async (req, res) => {
    const cookieName = process.env.SESSION_COOKIE_NAME || 'sessionId';
    const sid = req.cookies?.[cookieName];
    if (sid) await Session.destroy({ where: { id: sid } });
    res.clearCookie(cookieName, cookieOptions);
    res.redirect('/login');
};
