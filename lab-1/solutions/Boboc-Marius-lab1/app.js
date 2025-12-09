const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); //permite serverului sa citească datele trimise din formulare HTML
app.use(express.static(path.join(__dirname, 'public')));

//calea către pseudo baza de date
const DATA_FILE = path.join(__dirname, 'data', 'expenses.json');

//citire cheltuieli
function readExpenses() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Eroare la citirea fisierului JSON:', err);
    return [];
  }
}

// scrierea în fișier
function writeExpenses(expenses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2), 'utf8'); //transforma array-ul de cheltuile într-un string json, cu identare de 2 spatii 
  } catch (err) {
    console.error('Eroare la scrierea fisierului JSON:', err);
  }
}


// --- definirea rutelor ---

//pagina principală
app.get('/', (req, res) => {
  const expenses = readExpenses();

  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  res.render('index', {
    expenses,
    total
  }); //trimitem spre pagina ejs doi parametri: lista cheltuililor și totalul calculat
});

//ruta pentru adăugarea unei noi cheltuili
app.post('/add', (req, res) => {
  const { description, amount, category, date } = req.body; //extragem datele din formular

  const expenses = readExpenses();

  const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 1;

  const newExpense = {
    id: newId,
    description: description || 'Fara descriere',
    amount: Number(amount) || 0,
    category: category || 'Altele',
    date: date || new Date().toISOString().slice(0, 10)
  };

  expenses.push(newExpense);
  writeExpenses(expenses);

  res.redirect('/');//dupa salvarea array-ului, user-ul este redirecționat pe pagina principală
});

//ruta pentru stergerea unei cheltuili
app.post('/delete/:id', (req, res) => {
  const id = Number(req.params.id); //id extras din url
  let expenses = readExpenses();

  expenses = expenses.filter(exp => exp.id !== id); //pastram toate cheltuilile, dar fara cel din url

  writeExpenses(expenses);
  res.redirect('/'); 
});

app.listen(PORT, () => {
  console.log(`Serverul ruleaza pe http://localhost:${PORT}`); //pornim serverul 
});
