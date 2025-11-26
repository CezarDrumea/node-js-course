'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('workouts', {
            id:        { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            userId:    { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            date:      { type: Sequelize.DATEONLY, allowNull: false },
            type:      { type: Sequelize.STRING, allowNull: false },
            duration:  { type: Sequelize.INTEGER, allowNull: false },
            calories:  { type: Sequelize.INTEGER, allowNull: false },
            notes:     { type: Sequelize.TEXT },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
        });
    },
    async down(queryInterface) { await queryInterface.dropTable('workouts'); }
};
