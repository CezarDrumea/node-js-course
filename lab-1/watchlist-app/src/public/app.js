import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

import * as watchlistController from '../controllers/watchlist.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));


app.get('/watchlist', watchlistController.showWatchlist);
app.post('/watchlist', watchlistController.createItem);
app.post('/watchlist/delete/:id', watchlistController.removeItem);


app.get('/', (req, res) => res.redirect('/watchlist'));

app.listen(PORT, () => console.log(`Server running la http://localhost:${PORT}`));
