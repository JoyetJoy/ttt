const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const translations = await prisma.translations.findMany();
  for(const t of translations) {
    if (t.value && t.value.toLowerCase().includes('tours'))
      console.log('Translation:', t.id, t.key, t.value);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
