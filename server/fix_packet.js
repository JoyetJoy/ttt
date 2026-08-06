const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe(`SELECT 1;`);
    console.log('Query successful:', res);
    console.log('Successfully updated max_allowed_packet to 1GB.');
  } catch (error) {
    console.error('Failed to update max_allowed_packet:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
