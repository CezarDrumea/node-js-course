const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define("User", {
    username: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    }
});

module.exports = User;
