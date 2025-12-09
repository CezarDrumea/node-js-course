import path from 'path';
import express from 'express';
import {fileURLToPath} from 'url';
import quoteRoutes from "./routes/quoteRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/quotes'));

app.use('/quotes', quoteRoutes);

app.use((req, res) =>
    res.status(404).render('index', { tasks: [], error: 'Not found' })
);

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).render('error', {tasks: [], error: 'Internal Server Error'})
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${ PORT }`);
});