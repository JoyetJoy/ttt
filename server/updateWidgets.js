const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.widget_contents.findMany();
  let count = 0;
  for (const record of records) {
    if (record.widget_content && typeof record.widget_content === 'string') {
      const original = record.widget_content;
      // Replace variations of Q Tours in the JSON string
      const updatedStr = original
        .replace(/Q Tours & Travels/gi, 'GATEWAY Tours & Travels')
        .replace(/Q Tours and Travels/gi, 'GATEWAY Tours and Travels')
        .replace(/Q Tours/gi, 'GATEWAY Tours');

      if (updatedStr !== original) {
        await prisma.widget_contents.update({
          where: { id: record.id },
          data: { widget_content: updatedStr }
        });
        count++;
        console.log(`Updated widget_contents ID ${record.id}`);
      }
    }
  }
  console.log(`Updated ${count} widget_contents records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
