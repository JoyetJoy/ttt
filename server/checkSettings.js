const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.settings.findMany();
  console.log(records.filter(r => r.value && r.value.includes('Q Tours')));
}

main().catch(console.error).finally(() => prisma.$disconnect());
