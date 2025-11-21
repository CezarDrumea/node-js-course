import sequelize from '../src/config/database.js';
import User from '../src/model/User.js';
import Session from '../src/model/Session.js';
import Name from '../src/model/Name.js';

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connection to database has been established successfully.');

    // Synchronize models (create tables if they don't exist)
    await User.sync();
    await Session.sync();
    await Name.sync();

    console.log('All models were synchronized successfully.');

    // Seed initial data if needed
    const existingNames = await Name.count();
    if (existingNames === 0) {
      const initialNames = [
        { name: 'Andrei' },
        { name: 'Popescu' },
        { name: 'Maria' },
        { name: 'Ionescu' },
        { name: 'Ion' },
        { name: 'Vasilescu' },
        { name: 'Elena' },
        { name: 'Georgescu' },
        { name: 'Cristian' },
        { name: 'Dumitrescu' },
        { name: 'Ana' },
        { name: 'Marinescu' },
        { name: 'Mihai' },
        { name: 'Radu' },
        { name: 'Ioana' },
        { name: 'Stanescu' },
        { name: 'Gabriel' },
        { name: 'Petrescu' },
        { name: 'Alina' },
        { name: 'Tudor' },
      ];
      await Name.bulkCreate(initialNames);
      console.log('Initial names seeded.');
    }

    const existingUsers = await User.count();
    if (existingUsers === 0) {
      await User.create({ username: 'admin', password: '1234' });
      console.log('Initial admin user created.');
    }

  } catch (error) {
    console.error('Unable to connect to the database or synchronize models:', error);
  }
}

migrate();
