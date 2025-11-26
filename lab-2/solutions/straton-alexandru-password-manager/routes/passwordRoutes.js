const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

router.get('/', passwordController.index);
router.post('/add', passwordController.create);
router.post('/reveal/:id', passwordController.reveal);
router.put('/update/:id', passwordController.update);
router.delete('/delete/:id', passwordController.delete);

module.exports = router;