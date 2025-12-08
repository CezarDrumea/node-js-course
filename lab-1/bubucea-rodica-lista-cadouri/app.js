const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const giftsFile = path.join(__dirname, 'data.json');

// Middleware
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Route principală
app.get('/', async (req, res) => {
    const gifts = await fs.readJson(giftsFile);
    res.render('index', { gifts });
});

// Form pentru adăugare cadou
app.post('/add', async (req, res) => {
    const gifts = await fs.readJson(giftsFile);
    const newGift = {
        id: gifts.length + 1,
        name: req.body.name,
        price: parseFloat(req.body.price)
    };
    gifts.push(newGift);
    await fs.writeJson(giftsFile, gifts, { spaces: 2 });
    res.redirect('/');
});

// Pornim serverul
app.listen(PORT, () => {
    console.log(`Serverul rulează la http://localhost:${PORT}`);
});