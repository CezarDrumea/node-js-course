'use strict';
module.exports = (sequelize, DataTypes) => {
    const Workout = sequelize.define('Workout', {
        date:     { type: DataTypes.DATEONLY, allowNull: false },
        type:     { type: DataTypes.STRING,   allowNull: false },
        duration: { type: DataTypes.INTEGER,  allowNull: false },
        calories: { type: DataTypes.INTEGER,  allowNull: false },
        notes:    { type: DataTypes.TEXT }
    }, { tableName: 'workouts' });
    return Workout;
};
