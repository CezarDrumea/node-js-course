const crypto = require('crypto');
const bcrypt = require('bcrypt'); // for hashed passwords
const { User, Session } = require('../models');

const cookieName = process.env.SESSION_COOKIE_NAME || 'sessionId';

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production', // false in dev, true in prod
    maxAge: 1000 * 60 * 60, // 1 hour
};

// --- LOGIN PAGE ---
exports.showLogin = async (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('login', { msg: '' });
};

// --- LOGIN (POST) ---
exports.login = async (req, res) => {
    const { username = '', password = '' } = req.body;

    try {
        const user = await User.findOne({ where: { username: username.trim() } });
        if (!user) return res.render('login', { msg: 'Invalid username!' });

        const valid = await bcrypt.compare(password.trim(), user.password);
        if (!valid) return res.render('login', { msg: 'Invalid password!' });

        // Cleanup previous sessions (optional but good)
        await Session.destroy({ where: { userId: user.id } });

        // Create new session record
        const session = await Session.create({
            id: crypto.randomUUID(),
            userId: user.id,
        });

        // Set secure session cookie
        res.cookie(cookieName, session.id, cookieOptions);

        console.log(`✅ Logged in user ${user.username}`);
        res.redirect('/');
    } catch (err) {
        console.error('💥 Login error:', err.message);
        res.render('login', { msg: 'Login failed. Please try again.' });
    }
};

// --- LOGOUT ---
exports.logout = async (req, res) => {
    try {
        const sid = req.cookies?.[cookieName];

        if (sid) {
            await Session.destroy({ where: { id: sid } });
            console.log('👋 Session destroyed:', sid);
        }

        // Clear cookie
        res.clearCookie(cookieName, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
        });

        // Invalidate caching to prevent back navigation into protected routes
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        console.log('✅ Logged out');
        return res.redirect('/login');
    } catch (err) {
        console.error('❌ Logout error:', err.message);
        return res.redirect('/login');
    }
};
