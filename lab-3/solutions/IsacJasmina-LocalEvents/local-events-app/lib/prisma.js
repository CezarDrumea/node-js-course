import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  omit: {
    user: {
      password: true  // Exclude password din TOATE query-urile User
    }
  }
});

export default prisma;