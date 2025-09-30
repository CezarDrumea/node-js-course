import { Router } from 'express';
import {
  listRestaurants,
  showNewRestaurantForm,
  createRestaurant,
  showEditRestaurantForm,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurantController.js';

const router = Router();

router.get('/', listRestaurants);
router.get('/new', showNewRestaurantForm);
router.post('/', createRestaurant);
router.get('/:id/edit', showEditRestaurantForm);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);

export default router;
