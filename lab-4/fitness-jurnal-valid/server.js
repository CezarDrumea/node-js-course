require('dotenv').config();
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { sequelize } = require('./models');
const {
    loadUserFromCookie,
    requireLogin,
    redirectIfLoggedIn,
    noStore,
} = require('./utils/auth');
const { notFoundHandler, errorHandler } = require('./utils/handlers');

// ROUTES
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3001;

/* -------------------------------------------------------
   🔐 SSL CERTIFICATES
------------------------------------------------------- */
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem')),
};

/* -------------------------------------------------------
   🛡 SECURITY MIDDLEWARES
------------------------------------------------------- */
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": ["'self'"],
                "style-src": ["'self'", "'unsafe-inline'"],
                "img-src": ["'self'", "data:"],
            },
        },
        referrerPolicy: { policy: 'no-referrer' },
    })
);

const corsOrigin = process.env.CORS_ORIGIN || 'https://localhost:3443';
app.use(
    cors({
        origin: corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

/* -------------------------------------------------------
   ⚙ CORE MIDDLEWARES
------------------------------------------------------- */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(noStore);
app.use(loadUserFromCookie);

/* -------------------------------------------------------
   🔁 REDIRECT HTTP → HTTPS
------------------------------------------------------- */
app.use((req, res, next) => {
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(`https://${req.hostname}:${HTTPS_PORT}${req.url}`);
    }
    next();
});

/* -------------------------------------------------------
   🚦 RATE LIMITERS
------------------------------------------------------- */
const globalLimiter = rateLimit({
    windowMs: 60_000,
    max: 100,
    message: { message: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60_000,
    max: 10,
    message: { message: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

/* -------------------------------------------------------
   🧩 ROUTES
------------------------------------------------------- */
// LOGIN VIEW must be separate
app.get('/login', redirectIfLoggedIn, (req, res) => res.render('login', { msg: '' }));

// AUTH and WORKOUT routes
app.use('/auth', authLimiter, authRoutes);
app.use('/', requireLogin, workoutRoutes);

/* -------------------------------------------------------
   🚨 HANDLERS
------------------------------------------------------- */
app.use(notFoundHandler);
app.use(errorHandler);

/* -------------------------------------------------------
   🚀 START SERVERS
------------------------------------------------------- */
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Start HTTP (for redirect)
        http.createServer(app).listen(HTTP_PORT, () =>
            console.log(`✅ HTTP server at http://localhost:${HTTP_PORT}`)
        );

        // Start HTTPS with fallback
        function startHttps(app, sslOptions, preferredPort = HTTPS_PORT) {
            const tryListen = (port) =>
                new Promise((resolve, reject) => {
                    const server = https.createServer(sslOptions, app);
                    server.listen(port, () => resolve(port));
                    server.on('error', reject);
                });

            tryListen(preferredPort)
                .then((port) =>
                    console.log(`✅ HTTPS server at https://localhost:${port}`)
                )
                .catch((err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.warn(`⚠️ Port ${preferredPort} busy, retrying on 3443...`);
                        return tryListen(3443).then((port) =>
                            console.log(`✅ HTTPS server at https://localhost:${port}`)
                        );
                    }
                    throw err;
                });
        }

        startHttps(app, sslOptions);
    } catch (e) {
        console.error('❌ DB connection failed:', e.message);
        process.exit(1);
    }
})();
