const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// ---- View & static setup ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ---- Global no-cache for dynamic pages ----
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// ---- Helpers ----
function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
};

// ---- Session helpers ----
function getSession(req) {
    const sessionId = req.cookies?.sessionId;
    if (!sessionId) return null;
    const data = readDB();
    const session = data.sessions.find((s) => s.id === sessionId);
    if (!session) return null;
    const user = data.users.find((u) => u.id.toString() === session.userId.toString());
    if (!user) return null;
    return { session, user };
}

// ---- Middleware: require login ----
function requireLogin(req, res, next) {
    const ctx = getSession(req);
    if (!ctx) return res.redirect('/login');
    req.user = ctx.user;
    req.sessionId = ctx.session.id;
    next();
}

// ---- Middleware: redirect if already logged in ----
function redirectIfLoggedIn(req, res, next) {
    const ctx = getSession(req);
    if (ctx) return res.redirect('/');
    next();
}

// -----------------------------------------------------------------------------
// AUTH ROUTES
// -----------------------------------------------------------------------------
app.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('login', { msg: '' });
});

app.post('/login', (req, res) => {
    const { username = '', password = '' } = req.body;
    const data = readDB();
    const user = data.users.find(
        (u) => u.username === username.trim() && u.password === password.trim()
    );

    if (!user) {
        return res.render('login', { msg: 'Invalid credentials!' });
    }

    // remove old sessions of this user (optional but cleaner)
    data.sessions = data.sessions.filter((s) => s.userId.toString() !== user.id.toString());

    const sessionId = crypto.randomUUID();
    data.sessions.push({
        id: sessionId,
        userId: user.id.toString(),
        createdAt: new Date().toISOString(),
    });
    writeDB(data);

    res.cookie('sessionId', sessionId, cookieOptions);
    res.redirect('/');
});

app.post('/logout', requireLogin, (req, res) => {
    const data = readDB();
    data.sessions = data.sessions.filter((s) => s.id !== req.sessionId);
    writeDB(data);
    res.clearCookie('sessionId', cookieOptions);
    res.redirect('/login');
});

// -----------------------------------------------------------------------------
// WORKOUT ROUTES (protected)
// -----------------------------------------------------------------------------
const workoutsRouter = require('./routes/workouts');
app.use('/', requireLogin, (req, res, next) => {
    res.locals.user = req.user;
    next();
}, workoutsRouter);

// ---- Start server ----
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
