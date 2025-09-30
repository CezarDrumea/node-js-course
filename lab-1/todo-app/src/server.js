import path from 'path';
import express from 'express';
import tasksRouter from './routes/tasks.routes.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/tasks'));

app.use('/tasks', tasksRouter);

app.use((req, res) =>
  res.status(404).render('index', { tasks: [], error: 'Not found' })
);

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(500)
    .render('index', { tasks: [], error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`
    Server: http://localhost:${PORT}
    DB: http://localhost:4000
`)
);
