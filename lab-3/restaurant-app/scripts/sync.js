import { syncDb } from '../models/index.js';
const force = process.argv.includes('--force');
const alter = process.argv.includes('--alter');
(async () => {
  await syncDb({ force, alter });
  console.log('Database synced', { force, alter });
  process.exit(0);
})();
