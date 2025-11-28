**PASSWORD MANAGER**

### Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Initialize database:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

Visit `http://localhost:3000/login`

## Demo Credentials

- **User 1:** `user1` / `pass1`
- **User 2:** `user2` / `pass2`

## Available Scripts

```bash
npm start          # Start with auto-reload
npm run dev        # Start with nodemon
npm run db:push    # Sync Prisma schema with database
npm run db:seed    # Seed database with sample data
npm run db:reset   # Reset database (WARNING: deletes all data)
```