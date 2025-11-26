'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const db = {};
const sequelize = config.use_env_variable
    ? new Sequelize(process.env[config.use_env_variable], config)
    : new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
    .filter(f => f.indexOf('.') !== 0 && f !== basename && f.endsWith('.js'))
    .forEach(f => {
        const model = require(path.join(__dirname, f))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

// associations
const { User, Session, Workout } = db;

if (User && Session) {
    User.hasMany(Session, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Session.belongsTo(User, { foreignKey: 'userId' });
}

if (User && Workout) {
    User.hasMany(Workout, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Workout.belongsTo(User, { foreignKey: 'userId' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
