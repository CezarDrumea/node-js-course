'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false }, // demo: plain; use hash in prod
        name:     { type: DataTypes.STRING, allowNull: false }
    }, { tableName: 'users' });
    return User;
};
