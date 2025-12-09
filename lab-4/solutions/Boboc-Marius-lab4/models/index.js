const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'database.sqlite'),
  logging: false 
});

const User = require('./user')(sequelize);
const Expense = require('./expense')(sequelize);

User.hasMany(Expense, { foreignKey: 'userId' });

Expense.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Expense
};
