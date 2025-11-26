const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DB_PATH = path.join(__dirname, '../db.json');

// Read database helper
function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

// Write database helper
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Home page — list all workouts
router.get('/', (req, res) => {
    const data = readDB();
    res.render('index', { workouts: data.workouts });
});

// Add workout form
router.get('/add', (req, res) => {
    res.render('addWorkout');
});

// Handle new workout submission
router.post('/add', (req, res) => {
    const data = readDB();

    const newWorkout = {
        id: Date.now(),
        date: req.body.date,
        type: req.body.type,
        duration: req.body.duration,
        calories: req.body.calories,
        notes: req.body.notes
    };

    data.workouts.push(newWorkout);
    writeDB(data);
    res.redirect('/');
});

// Show details of a specific workout
router.get('/details/:id', (req, res) => {
    const data = readDB();
    const workout = data.workouts.find(w => w.id == req.params.id);

    if (!workout) {
        return res.status(404).send('Workout not found');
    }

    res.render('details', { workout });
});

// Delete a workout
router.post('/delete/:id', (req, res) => {
    const data = readDB();
    data.workouts = data.workouts.filter(w => w.id != req.params.id);
    writeDB(data);
    res.redirect('/');
});

module.exports = router;
