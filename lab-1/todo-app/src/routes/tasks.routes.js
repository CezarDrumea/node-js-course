import { Router } from 'express';
import * as controller from '../controllers/tasks.controller.js';

const router = Router();

router.get('/', controller.renderList);

router.get('/api', controller.getAll);
router.post('/api', controller.create);
router.patch('/api/:id', controller.update);
router.delete('/api/:id', controller.remove);

export default router;
