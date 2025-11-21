import path from 'path';
import express from 'express';
import noteRouter from './routes/jurnal_routes.js';
import authRouter from './routes/auth_routes.js';
import cookieParser from 'cookie-parser';

import { ensureAuth } from './controllers/jurnal_controller.js';
import {userModel} from "./models/user_model.js";

const __dirname = path.resolve();
const app = express();

// Middleware global
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// Setări Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// --- Rutele publice (login / register) ---
app.use('/', authRouter);



// --- Redirect / dacă nu e logat ---
app.get('/', (req, res) => {
    if (!req.cookies.user) return res.redirect('/auth');
    res.redirect('/notes');
});

// --- Rutele protejate pentru jurnal ---
app.use('/notes', ensureAuth, noteRouter);
app.post('/api', (req, res, next) => userModel.createNote(req, res, next));
// Pagina principală jurnal
app.get('/notes', ensureAuth, async (req, res, next) => {
    try {
        const { listData } = await import('./controllers/jurnal_controller.js');
        const notes = await listData();
        let user = null;
        // ✅ verifică cookie-ul
        if (req.cookies.user) {
            try {
                user = JSON.parse(req.cookies.user);
            } catch (err) {
                console.error("Cookie user invalid:", err);
            }
        }

        // ✅ dacă nu e user valid, redirecționează la login
        if (!user || !user.login) {
            return res.redirect('/auth');
        }

        res.render('index', { notes, user, errors: [] });
    } catch (err) {
        next(err);
    }
});
// Middleware 404 și 500
app.use((req, res) => res.status(404).render('index', { notes: [], error: 'Not Found' }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('index', { notes: [], error: 'Internal Server Error' });
});

// Pornire server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
