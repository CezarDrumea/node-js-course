const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../db.json');

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ---- Home page ----
router.get('/', (req, res) => {
    const data = readDB();
    const myWorkouts = (data.workouts || []).filter(
        (w) => w.userId?.toString() === req.user.id.toString()
    );
    res.render('index', { workouts: myWorkouts });
});

// ---- Add workout form ----
router.get('/add', (req, res) => {
    res.render('addWorkout');
});

// ---- Add workout handler ----
router.post('/add', (req, res) => {
    const data = readDB();

    const newWorkout = {
        id: Date.now(),
        userId: req.user.id.toString(),
        date: req.body.date,
        type: req.body.type,
        duration: req.body.duration,
        calories: req.body.calories,
        notes: req.body.notes,
    };

    data.workouts.push(newWorkout);
    writeDB(data);
    res.redirect('/');
});

// ---- Details ----
router.get('/details/:id', (req, res) => {
    const data = readDB();
    const workout = data.workouts.find(
        (w) => w.id.toString() === req.params.id.toString() &&
            w.userId.toString() === req.user.id.toString()
    );
    if (!workout) return res.status(404).send('Workout not found');
    res.render('details', { workout });
});

// ---- Delete workout ----
router.post('/delete/:id', (req, res) => {
    const data = readDB();
    data.workouts = data.workouts.filter(
        (w) => !(w.id.toString() === req.params.id.toString() &&
            w.userId.toString() === req.user.id.toString())
    );
    writeDB(data);
    res.redirect('/');
});

module.exports = router;
