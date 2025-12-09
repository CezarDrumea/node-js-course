const { Sequelize } = require('sequelize');
const path = require('path');

// Sequelize cu SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'database.sqlite'),
  logging: false 
});

const User = require('./user')(sequelize);
const Expense = require('./expense')(sequelize);

// definim relațiile, deoarece un user poate avea mai multe cheltuili
User.hasMany(Expense, { foreignKey: 'userId' });

// orice cheltuială poate apartine unui singur user
Expense.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Expense
};
