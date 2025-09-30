import { syncDb, Restaurant, Dish } from '../models/index.js';

(async () => {
  await syncDb({ force: true });
  const r1 = await Restaurant.create({
    name: 'Pasta Palace',
    address: '123 Noodle St',
  });
  const r2 = await Restaurant.create({
    name: 'Grill & Chill',
    address: '99 BBQ Ave',
  });

  await Dish.bulkCreate([
    {
      name: 'Spaghetti Carbonara',
      price: 9.99,
      isAvailable: true,
      restaurantId: r1.id,
    },
    {
      name: 'Penne Arrabbiata',
      price: 8.49,
      isAvailable: true,
      restaurantId: r1.id,
    },
    {
      name: 'Ribeye Steak',
      price: 19.99,
      isAvailable: true,
      restaurantId: r2.id,
    },
    {
      name: 'Grilled Veggies',
      price: 6.5,
      isAvailable: true,
      restaurantId: r2.id,
    },
  ]);

  console.log('Seeded data.');
  process.exit(0);
})();
