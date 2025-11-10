import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';
import watchlistRoutes from './routes/watchlist.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/watchlist'));
app.use('/watchlist', watchlistRoutes);

app.use((req, res) => res.status(404).render('index', { items: [], error: 'Page not found (404)' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('index', { items: [], error: 'Internal Server Error (500)' });
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));