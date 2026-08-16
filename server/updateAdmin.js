const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany({
    where: {
      OR: [
        { fname: { contains: 'Q Tours' } },
        { lname: { contains: 'Q Tours' } }
      ]
    }
  });
  console.log('Found users:', users);

  const update = await prisma.users.updateMany({
    where: {
      fname: { contains: 'Q Tours' }
    },
    data: {
      fname: 'Trivandrum Top Taxi',
      lname: ''
    }
  });
  console.log('Updated:', update);
}

main().catch(console.error).finally(() => prisma.$disconnect());
