import { Router } from 'express';
import restaurantsRouter from './restaurants.js';
import dishesRouter from './dishes.js';
import { Restaurant, Dish } from '../models/index.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const counts = {
      restaurants: await Restaurant.count(),
      dishes: await Dish.count(),
    };
    res.render('index', { counts });
  } catch (e) {
    next(e);
  }
});

router.use('/restaurants', restaurantsRouter);
router.use('/dishes', dishesRouter);

export default router;
