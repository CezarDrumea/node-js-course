import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Session.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Session, { foreignKey: 'userId' });

export default Session;
