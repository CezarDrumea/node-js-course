const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001; // ca sa nu se bata cu alta aplicatie
const JWT_SECRET = 'c+Br+rhFQAM3e6c16sSLMGIioT6e/hrVWy/WvRmsiF3zBM2ML5Rh7XT1TbUgHK8P';

// setari EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware-uri
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// cai catre "baza de date"
const EXPENSES_FILE = path.join(__dirname, 'data', 'expenses.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// citire utilizatori
function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Eroare la citirea users.json:', err);
    return [];
  }
}

// citire cheltuieli
function readExpenses() {
  try {
    const raw = fs.readFileSync(EXPENSES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Eroare la citirea expenses.json:', err);
    return [];
  }
}

// scriere cheltuieli
function writeExpenses(expenses) {
  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2), 'utf8');
  } catch (err) {
    console.error('Eroare la scrierea expenses.json:', err);
  }
}

// middleware de protectie JWT
function authJWT(req, res, next) {
  const token = req.cookies.token; // luam tokenul din cookie

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; //{ id, username, iat, exp }
    next();
  } catch (err) {
    console.error('Token invalid sau expirat:', err.message);
    // stergem cookie-ul ca sa nu ramana vechi
    res.clearCookie('token');
    return res.redirect('/login');
  }
}

//rute publice, care nu au nevoie de jwt

// pagina de login
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// login POST
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const users = readUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    // user sau parola gresita
    return res.render('login', { error: 'Username sau parola incorecta.' });
  }

  // cream tokenul JWT
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '1h' } // token valabil 1 ora
  );

  // il punem in cookie HTTP-only
  res.cookie('token', token, {
    httpOnly: true,
    // secure: true, // activat doar pe HTTPS
    maxAge: 60 * 60 * 1000 // 1h in ms
  });

  res.redirect('/');
});

// logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});


//rute protejate, care necesită jwt
// pagina principala - lista cheltuieli
app.get('/', authJWT, (req, res) => {
  const expenses = readExpenses();
  const total = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  res.render('index', {
    expenses,
    total,
    username: req.user.username // il folosim in view
  });
});

// adaugare cheltuiala
app.post('/add', authJWT, (req, res) => {
  const { description, amount, category, date } = req.body;

  const expenses = readExpenses();

  const newId =
    expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1;

  const newExpense = {
    id: newId,
    description: description || 'Fara descriere',
    amount: Number(amount) || 0,
    category: category || 'Necunoscut',
    date: date || new Date().toISOString().slice(0, 10)
  };

  expenses.push(newExpense);
  writeExpenses(expenses);

  res.redirect('/');
});

// stergere cheltuiala
app.post('/delete/:id', authJWT, (req, res) => {
  const id = Number(req.params.id);
  let expenses = readExpenses();

  expenses = expenses.filter((exp) => exp.id !== id);
  writeExpenses(expenses);

  res.redirect('/');
});

// pornire server
app.listen(PORT, () => {
  console.log(`JWT Expense Tracker ruleaza pe http://localhost:${PORT}`);
});
