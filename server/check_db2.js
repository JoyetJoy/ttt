const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.tours.update({
    where: { id: 20 },
    data: {
      itinerary: '[]',
      faqs: '[]',
      highlights: '[]',
      includes: '[]',
      excludes: '[]'
    }
  });
  console.log("Database reset to clean arrays!");
  await prisma.$disconnect();
}
fix();
