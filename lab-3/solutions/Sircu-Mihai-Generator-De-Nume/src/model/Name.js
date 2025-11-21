import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Name = sequelize.define('Name', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Name;
