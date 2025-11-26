require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { sequelize } = require('./models');
const { loadUserFromCookie, requireLogin, redirectIfLoggedIn, noStore } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

const app = express();
const PORT = process.env.PORT || 3000;

// views & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// cache control for all dynamic routes
app.use(noStore);

// load user (if any)
app.use(loadUserFromCookie);

// public routes
app.get('/login', redirectIfLoggedIn, authRoutes);
app.post('/login', authRoutes);
app.post('/logout', requireLogin, authRoutes);

// secured routes
app.use('/', requireLogin, workoutRoutes);

// start
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DB connected');
        app.listen(PORT, () => console.log(`✅ http://localhost:${PORT}`));
    } catch (e) {
        console.error('DB connection failed:', e);
        process.exit(1);
    }
})();
