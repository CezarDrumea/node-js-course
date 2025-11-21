import path from 'path';
import express from 'express';
import noteRouter from './routes/jurnal_routes.js';
import { fileURLToPath } from 'url';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

const __dirname = path.resolve();
const app = express();

// Servește fișierele statice din 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Setări Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware pentru formulare și JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rutele principale
app.get('/', (req, res) => res.redirect('/notes'));

app.get('/notes', async (req, res, next) => {
    try {
        const { listData } = await import('./controllers/jurnal_controller.js');
        const notes = await listData();
        res.render('index', { notes, error: null });
    } catch (err) {
        next(err);
    }
});

// API routes
app.use('/notes', noteRouter);

// Middleware 404 și 500
app.use((req, res) => res.status(404).render('index', { notes: [], error: 'Not Found' }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('index', { notes: [], error: 'Internal Server Error' });
});

// Pornire server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
