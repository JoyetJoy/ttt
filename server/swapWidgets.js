const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.widget_contents.update({
    where: { id: 55n }, // latest-destination
    data: { position: 5 }
  });
  
  await prisma.widget_contents.update({
    where: { id: 40n }, // latest-product
    data: { position: 4 }
  });

  console.log("Positions swapped!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
