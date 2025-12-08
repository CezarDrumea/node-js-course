const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Citire cadouri
function readGifts() {
    const data = fs.readFileSync('data.json');
    return JSON.parse(data).gifts;
}

// Scriere cadouri
function writeGifts(gifts) {
    fs.writeFileSync('data.json', JSON.stringify({ gifts }, null, 2));
}

// Pagina principală
app.get('/', (req, res) => {
    const gifts = readGifts();
    res.render('index', { gifts });
});

// Formular adăugare cadou
app.get('/add', (req, res) => {
    res.render('add');
});

// Procesare formular
app.post('/add', (req, res) => {
    const { name, price } = req.body;
    const gifts = readGifts();
    const newGift = {
        id: gifts.length ? gifts[gifts.length - 1].id + 1 : 1,
        name,
        price: Number(price)
    };
    gifts.push(newGift);
    writeGifts(gifts);
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});