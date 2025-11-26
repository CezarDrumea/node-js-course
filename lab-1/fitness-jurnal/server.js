const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Rute principale
app.get('/', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    res.render('index', { workouts: data.workouts });
});

app.get('/add', (req, res) => {
    res.render('addWorkout');
});

app.post('/add', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    const newWorkout = {
        id: Date.now(),
        date: req.body.date,
        type: req.body.type,
        duration: req.body.duration,
        calories: req.body.calories,
        notes: req.body.notes
    };
    data.workouts.push(newWorkout);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
