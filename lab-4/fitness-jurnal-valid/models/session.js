'use strict';
module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    }, { tableName: 'sessions', updatedAt: false });
    return Session;
};
