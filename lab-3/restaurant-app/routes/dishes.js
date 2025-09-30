import { Router } from 'express';
import {
  listDishes,
  showNewDishForm,
  createDish,
  showEditDishForm,
  updateDish,
  deleteDish,
} from '../controllers/dishController.js';

const router = Router();

router.get('/', listDishes);
router.get('/new', showNewDishForm);
router.post('/', createDish);
router.get('/:id/edit', showEditDishForm);
router.put('/:id', updateDish);
router.delete('/:id', deleteDish);

export default router;
