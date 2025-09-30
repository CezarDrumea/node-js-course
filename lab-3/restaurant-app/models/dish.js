import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Dish = sequelize.define(
    'Dish',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: 0 },
      },
      isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      restaurantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { tableName: 'dishes' }
  );
  return Dish;
};
