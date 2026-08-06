import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const categories = await prisma.tour_categories.findMany({
      orderBy: { name: 'asc' },
    });
    console.log("Success:", categories);
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
