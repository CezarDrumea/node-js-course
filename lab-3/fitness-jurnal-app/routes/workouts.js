const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/workoutsController');

// secured area
router.get('/', ctrl.index);
router.get('/add', ctrl.showAdd);
router.post('/add', ctrl.add);
router.get('/details/:id', ctrl.details);
router.post('/delete/:id', ctrl.delete);

module.exports = router;
