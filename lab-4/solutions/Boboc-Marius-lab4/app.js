const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');

const { sequelize, User, Expense } = require('./models');

const app = express();
const PORT = 3004;
const JWT_SECRET = 'V2MTrl1KjxphL+Yz1WfajBdHYb22YmCJFjR054WDLwILHzqtmYt7++pnI5gu1Fso';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(helmet());

// permitem doar propriul origin
app.use(cors({
  origin: 'http://localhost:3004',
  credentials: true
}));

// rate limit general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,  
  standardHeaders: true,
});
app.use(generalLimiter);

// schema Zod
// validare login
const loginSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username-ul trebuie sa aiba minim 3 caractere.')
    .max(50, 'Username-ul este prea lung.'),
  password: z.string()
    .min(4, 'Parola trebuie sa aiba minim 4 caractere.')
    .max(100, 'Parola este prea lunga.')
});

// validare cheltuiala
const expenseSchema = z.object({
  description: z.string()
    .trim()
    .min(1, 'Descrierea este obligatorie.')
    .max(50, 'Descrierea este prea lunga.'),
  amount: z.string()
    .trim()
    .refine(
      (val) => {
        const num = Number(val);
        return !Number.isNaN(num) && num > 0;
      },
      { message: 'Suma trebuie sa fie un numar pozitiv.' }
    ),
  category: z.string()
    .trim()
    .min(1, 'Categoria este obligatorie.'),
  date: z.string().optional().refine(
    (val) => {
      if (!val || val === '') return true; 
      return !Number.isNaN(Date.parse(val));
    },
    { message: 'Data nu este valida.' }
  )
});

function authJWT(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    console.error('Token invalid sau expirat:', err.message);
    res.clearCookie('token');
    return res.redirect('/login');
  }
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,                   
  message: 'Prea multe incercari de autentificare. Incearca din nou peste 15 minute.',
  standardHeaders: true,
  legacyHeaders: false
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', loginLimiter, async (req, res) => {
  // validarea zod
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Date de autentificare invalide.';
    return res.status(400).render('login', { error: firstError });
  }

  const { username, password } = parseResult.data;

  try {
    const user = await User.findOne({
      where: { username, password }
    });

    if (!user) {
      return res.render('login', { error: 'Username sau parola incorecta.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });

    res.redirect('/');
  } catch (err) {
    console.error('Eroare la login:', err);
    res.status(500).render('login', { error: 'Eroare la autentificare.' });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.get('/', authJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.findAll({
      where: { userId },
      order: [['date', 'DESC']]
    });

    const total = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0
    );

    res.render('index', {
      expenses,
      total,
      username: req.user.username,
      error: null
    });
  } catch (err) {
    console.error('Eroare la incarcare cheltuieli:', err);
    res.status(500).send('Eroare server.');
  }
});

app.post('/add', authJWT, async (req, res) => {
  // validarea zod
  const parseResult = expenseSchema.safeParse(req.body);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0]?.message || 'Date invalide pentru cheltuiala.';
    const userId = req.user.id;

    const expenses = await Expense.findAll({
      where: { userId },
      order: [['date', 'DESC']]
    });

    const total = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0
    );

    return res.status(400).render('index', {
      expenses,
      total,
      username: req.user.username,
      error: firstError
    });
  }

  const { description, amount, category, date } = parseResult.data;
  const userId = req.user.id;

  const finalDate = date && date !== ''
    ? date
    : new Date().toISOString().slice(0, 10);

  try {
    await Expense.create({
      description,
      amount: Number(amount),
      category,
      date: finalDate,
      userId
    });

    res.redirect('/');
  } catch (err) {
    console.error('Eroare la adaugare cheltuiala:', err);
    res.status(500).send('Eroare la adaugare cheltuiala.');
  }
});


app.post('/delete/:id', authJWT, async (req, res) => {
  const id = Number(req.params.id);
  const userId = req.user.id;

  try {
    await Expense.destroy({
      where: {
        id,
        userId
      }
    });

    res.redirect('/');
  } catch (err) {
    console.error('Eroare la stergere cheltuiala:', err);
    res.status(500).send('Eroare la stergere.');
  }
});

async function start() {
  try {
    await sequelize.sync();

    const count = await User.count();
    if (count === 0) {
      await User.bulkCreate([
        { username: 'admin', password: 'parola123' },
        { username: 'marius', password: '1234' }
      ]);
      console.log('Useri de test creati in baza de date.');
    }

    app.listen(PORT, () => {
      console.log(`Lab4 ruleaza pe http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Eroare la initializarea aplicatiei:', err);
  }
}

start();
