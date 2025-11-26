'use strict';

module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('users', [
            {
                username: 'student1',
                password: '1234',
                name: 'Mihai',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                username: 'student2',
                password: 'pass',
                name: 'Cezar',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('users', { username: ['student1', 'student2'] });
    }
};
