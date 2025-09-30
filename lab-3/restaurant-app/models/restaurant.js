import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Restaurant = sequelize.define(
    'Restaurant',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
    },
    { tableName: 'restaurants' }
  );
  return Restaurant;
};
