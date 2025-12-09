const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const { sequelize, User, Expense } = require('./models');

const app = express();
const PORT = 3003;
const JWT_SECRET = 'EYpYHUPlh/16M9ChBIfIgbF9EFtJ0wEYK3yGER/0ggjEvJOMqAK71S1Yt0jOihg+';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// autentificarea JWT
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

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({
      where: { username, password }
    });

    if (!user) {
      return res.render('login', { error: 'Username sau parola incorecta.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
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
    res.render('login', { error: 'Eroare la autentificare.' });
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
      username: req.user.username
    });
  } catch (err) {
    console.error('Eroare la incarcare cheltuieli:', err);
    res.status(500).send('Eroare server.');
  }
});

app.post('/add', authJWT, async (req, res) => {
  const { description, amount, category, date } = req.body;
  const userId = req.user.id;

  try {
    await Expense.create({
      description: description || '',
      amount: Number(amount) || 0,
      category: category || '',
      date: date || new Date().toISOString().slice(0, 10),
      userId: userId
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
    // stergem doar daca cheltuiala apartine userului curent
    await Expense.destroy({
      where: {
        id: id,
        userId: userId
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

    // useri de intodus in db by default
    const count = await User.count();
    if (count === 0) {
      await User.bulkCreate([
        { username: 'admin', password: 'pass' },
        { username: 'marius', password: '1234' }
      ]);
    }

    app.listen(PORT, () => {
      console.log(`Lab3 http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Eroare la initializarea aplicatiei:', err);
  }
}

start();
