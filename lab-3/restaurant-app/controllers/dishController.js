import { Restaurant, Dish } from '../models/index.js';

export const listDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.findAll({
      include: [{ model: Restaurant, as: 'restaurant' }],
    });
    const restaurants = await Restaurant.findAll();
    res.render('dishes/list', { dishes, restaurants });
  } catch (e) {
    next(e);
  }
};

export const showNewDishForm = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.render('dishes/new', { restaurants });
  } catch (e) {
    next(e);
  }
};

export const createDish = async (req, res, next) => {
  try {
    const { name, price, isAvailable, restaurantId } = req.body;
    await Dish.create({
      name,
      price: parseFloat(price),
      isAvailable: Boolean(isAvailable),
      restaurantId: parseInt(restaurantId, 10),
    });
    res.redirect('/dishes');
  } catch (e) {
    next(e);
  }
};

export const showEditDishForm = async (req, res, next) => {
  try {
    const dish = await Dish.findByPk(req.params.id);
    if (!dish) return res.status(404).send('Dish not found');
    const restaurants = await Restaurant.findAll();
    res.render('dishes/edit', { dish, restaurants });
  } catch (e) {
    next(e);
  }
};

export const updateDish = async (req, res, next) => {
  try {
    const dish = await Dish.findByPk(req.params.id);
    if (!dish) return res.status(404).send('Dish not found');
    const { name, price, isAvailable, restaurantId } = req.body;
    await dish.update({
      name,
      price: parseFloat(price),
      isAvailable: Boolean(isAvailable),
      restaurantId: parseInt(restaurantId, 10),
    });
    res.redirect('/dishes');
  } catch (e) {
    next(e);
  }
};

export const deleteDish = async (req, res, next) => {
  try {
    await Dish.destroy({ where: { id: req.params.id } });
    res.redirect('/dishes');
  } catch (e) {
    next(e);
  }
};
