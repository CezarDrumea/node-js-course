import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import RestaurantModel from './restaurant.js';
import DishModel from './dish.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage =
  process.env.SQLITE_PATH || path.join(__dirname, '..', 'database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

export const Restaurant = RestaurantModel(sequelize);
export const Dish = DishModel(sequelize);

Restaurant.hasMany(Dish, {
  as: 'dishes',
  foreignKey: 'restaurantId',
  onDelete: 'CASCADE',
});
Dish.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' });

export async function syncDb({ force = false, alter = false } = {}) {
  await sequelize.sync({ force, alter });
}
