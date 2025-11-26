'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('sessions', {
            id:        { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.literal('gen_random_uuid()') },
            userId:    { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
        });
    },
    async down(queryInterface) { await queryInterface.dropTable('sessions'); }
};
