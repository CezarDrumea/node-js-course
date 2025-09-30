import { Restaurant, Dish } from '../models/index.js';

export const listRestaurants = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.findAll({
      include: [{ model: Dish, as: 'dishes' }],
    });
    res.render('restaurants/list', { restaurants });
  } catch (e) {
    next(e);
  }
};

export const showNewRestaurantForm = (req, res) => {
  res.render('restaurants/new');
};

export const createRestaurant = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    await Restaurant.create({ name, address });
    res.redirect('/restaurants');
  } catch (e) {
    next(e);
  }
};

export const showEditRestaurantForm = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).send('Restaurant not found');
    res.render('restaurants/edit', { restaurant });
  } catch (e) {
    next(e);
  }
};

export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).send('Restaurant not found');
    const { name, address } = req.body;
    await restaurant.update({ name, address });
    res.redirect('/restaurants');
  } catch (e) {
    next(e);
  }
};

export const deleteRestaurant = async (req, res, next) => {
  try {
    await Restaurant.destroy({ where: { id: req.params.id } });
    res.redirect('/restaurants');
  } catch (e) {
    next(e);
  }
};
