const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Global Community...');
  
  const globalCollege = await prisma.college.upsert({
    where: { domain: 'global.allumnova.cloud' },
    update: {},
    create: {
      id: 'cl_global_allumnova', // Using a fixed ID for cross-environment consistency
      name: 'Global Community',
      domain: 'global.allumnova.cloud',
      subdomain: 'global',
      primaryColor: '#3b82f6',
      location: 'Everywhere',
      website: 'https://allumnova.cloud'
    }
  });

  console.log('✅ Global Community Seeded:', globalCollege.name);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
