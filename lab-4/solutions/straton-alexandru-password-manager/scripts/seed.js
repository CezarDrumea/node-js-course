import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.password.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      password: 'pass1',
      name: 'Alex',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'user2',
      password: 'pass2',
      name: 'Cezar',
    },
  });

  console.log('Users created:', { user1, user2 });

  // Create sample passwords (encrypted format will be handled by the app)
  const password1 = await prisma.password.create({
    data: {
      website: 'github.com',
      username: 'alex_dev',
      password: JSON.stringify({
        encrypted: 'sample_encrypted_data',
        iv: 'sample_iv',
        authTag: 'sample_tag',
      }),
      notes: 'GitHub personal account',
      userId: user1.id,
    },
  });

  console.log('Sample password created:', password1);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
