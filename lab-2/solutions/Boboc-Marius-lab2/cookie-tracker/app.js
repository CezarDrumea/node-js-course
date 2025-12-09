const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3002; 

// setari EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware-uri
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// fisier cheltuieli
const EXPENSES_FILE = path.join(__dirname, 'data', 'expenses.json');

// functie citire/scriere cheltuieli
function readExpenses() {
  try {
    const raw = fs.readFileSync(EXPENSES_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Eroare la citirea expenses.json:', err);
    return [];
  }
}

function writeExpenses(expenses) {
  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2), 'utf8');
  } catch (err) {
    console.error('Eroare la scrierea expenses.json:', err);
  }
}

// "baza de date" de useri 
const USERS = [
  { id: 1, username: 'admin', password: 'parola123' },
  { id: 2, username: 'marius', password: '1234' }
];

// middleware auth pe baza cookie-ului
function authCookie(req, res, next) {
  const username = req.cookies.user;

  if (!username) {
    return res.redirect('/login');
  }

  // verificare daca userul exista in USERS
  const user = USERS.find((u) => u.username === username);
  if (!user) {
    res.clearCookie('user');
    return res.redirect('/login');
  }

  req.user = user;
  next();
}

// --- rute ---
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.render('login', { error: 'Username sau parola incorecta.' });
  }

  // salvam doar username-ul in cookie
  res.cookie('user', user.username, {
    httpOnly: true, 
    maxAge: 60 * 60 * 1000
  });

  res.redirect('/');
});

app.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect('/login');
});

// --- rute protejate ---

app.get('/', authCookie, (req, res) => {
  const expenses = readExpenses();
  const total = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount || 0),
    0
  );

  res.render('index', {
    expenses,
    total,
    username: req.user.username 
  });
});

app.post('/add', authCookie, (req, res) => {
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

app.post('/delete/:id', authCookie, (req, res) => {
  const id = Number(req.params.id);
  let expenses = readExpenses();

  expenses = expenses.filter((exp) => exp.id !== id);
  writeExpenses(expenses);

  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Cookie Expense Tracker ruleaza pe http://localhost:${PORT}`);
});
