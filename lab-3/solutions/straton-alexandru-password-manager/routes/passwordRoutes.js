import express from 'express';
import passwordController from '../controllers/passwordController.js';

const router = express.Router();

router.get('/', passwordController.index);
router.post('/add', passwordController.create);
router.post('/reveal/:id', passwordController.reveal);
router.put('/update/:id', passwordController.update);
router.delete('/delete/:id', passwordController.delete);

export default router;