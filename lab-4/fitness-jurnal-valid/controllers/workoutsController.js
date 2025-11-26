const { Workout } = require('../models');

exports.index = async (req, res) => {
  const workouts = await Workout.findAll({
    where: { userId: req.user.id },
    order: [['date', 'DESC'], ['id', 'DESC']]
  });
  res.render('index', { workouts });
};

exports.showAdd = (req, res) => {
  res.render('addWorkout');
};

exports.add = async (req, res) => {
  await Workout.create({
    userId: req.user.id,
    date: req.body.date,
    type: req.body.type,
    duration: Number(req.body.duration),
    calories: Number(req.body.calories),
    notes: req.body.notes || null,
  });
  res.redirect('/');
};

exports.details = async (req, res) => {
  const workout = await Workout.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!workout) return res.status(404).send('Workout not found');
  res.render('details', { workout });
};

exports.delete = async (req, res) => {
  await Workout.destroy({ where: { id: req.params.id, userId: req.user.id } });
  res.redirect('/');
};