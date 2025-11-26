const express = require('express');
const { Workout, User } = require('../models');
const { requireLogin } = require('../utils/auth');
const router = express.Router();

// List all workouts for logged user
router.get('/', requireLogin, async (req, res) => {
    try {
        const workouts = await Workout.findAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']],
        });
        res.render('index', { user: req.user, workouts });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error loading workouts');
    }
});

// Add workout
router.post('/add', requireLogin, async (req, res) => {
    const { date, type, duration, calories, notes } = req.body;
    await Workout.create({
        date,
        type,
        duration,
        calories,
        notes,
        userId: req.user.id,
    });
    res.redirect('/');
});

// Delete workout
router.post('/delete/:id', requireLogin, async (req, res) => {
    await Workout.destroy({
        where: { id: req.params.id, userId: req.user.id },
    });
    res.redirect('/');
});

module.exports = router;
