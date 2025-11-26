const express = require('express');
const bcrypt = require('bcrypt'); // use bcryptjs if native build fails
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'supersecret';
const isDev = process.env.NODE_ENV !== 'production';

// --- LOGIN PAGE (GET) ---
router.get('/login', (req, res) => {
    // If already logged in, go to home
    if (req.user) return res.redirect('/');
    res.render('login', { msg: '' });
});

// --- LOGIN (POST) ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', username);

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            console.log('❌ Invalid username');
            return res.render('login', { msg: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Wrong password');
            return res.render('login', { msg: 'Wrong password' });
        }

        // ✅ Generate JWT (valid 1 hour)
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
            expiresIn: '1h',
        });

        // ✅ Set JWT as secure cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: !isDev, // false for localhost
            maxAge: 60 * 60 * 1000, // 1 hour
            path: '/',
        });

        console.log(`✅ Login success for ${username}. Redirecting to /`);
        return res.redirect('/');
    } catch (err) {
        console.error('💥 Login error:', err.message);
        return res.render('login', { msg: 'Login error, please try again.' });
    }
});

// --- LOGOUT (POST) ---
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('auth_token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: !isDev,
            path: '/',
        });

        // Prevent going back into cached pages
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        console.log('👋 User logged out');
        return res.redirect('/login');
    } catch (err) {
        console.error('❌ Logout error:', err.message);
        return res.redirect('/login');
    }
});

module.exports = router;
