import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../src/config/database.js';
import User from '../src/model/User.js';
import Name from '../src/model/Name.js';
import Session from '../src/model/Session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateData() {
  await sequelize.sync({ force: true });

  const dbJsonPath = path.join(__dirname, '..', 'db.json');
  const dbJson = JSON.parse(readFileSync(dbJsonPath, 'utf-8'));

  // Migrate users
  for (const userData of dbJson.users) {
    await User.create({ id: userData.id, username: userData.username, password: userData.password, name: userData.username });
  }

  // Migrate names
  for (const nameData of dbJson.names) {
    await Name.create({ id: nameData.id, name: nameData.name });
  }

  // Migrate saved_names (assuming they also go into the Name table)
  for (const savedNameData of dbJson.saved_names) {
    await Name.findOrCreate({ where: { id: savedNameData.id }, defaults: { name: savedNameData.name } });
  }

  // Migrate sessions
  for (const sessionData of dbJson.sessions) {
    await Session.create({ id: sessionData.id, userId: sessionData.userId, createdAt: sessionData.createdAt });
  }

  console.log('Database synced and seeded with data from db.json!');
}

migrateData();
