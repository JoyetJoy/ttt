const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function replaceInTable(model, fields) {
  try {
    const records = await prisma[model].findMany();
    let count = 0;
    for(const record of records) {
      let updated = false;
      const data = {};
      for(const field of fields) {
        if (record[field] && typeof record[field] === 'string' && record[field].includes('Q Tours')) {
          data[field] = record[field]
            .replace(/Q Tours & Travels/g, 'GATEWAY Tours & Travels')
            .replace(/Q Tours and Travels/gi, 'GATEWAY Tours and Travels')
            .replace(/Q Tours/g, 'GATEWAY Tours');
          updated = true;
        }
      }
      if(updated) {
        await prisma[model].update({ where: { id: record.id }, data });
        count++;
      }
    }
    console.log(`Updated ${count} records in ${model}`);
  } catch (e) {
    console.log(`Error updating ${model}: ${e.message}`);
  }
}

async function main() {
  await replaceInTable('activities', ['title', 'meta_title', 'meta_desc', 'meta_keyward', 'shoulder']);
  await replaceInTable('blogs', ['title', 'short_description', 'long_description', 'meta_title', 'meta_desc']);
  await replaceInTable('destinations', ['title', 'meta_title', 'meta_desc', 'meta_keyward', 'shoulder']);
  await replaceInTable('hotels', ['title', 'meta_title', 'meta_desc', 'meta_keyward']);
  await replaceInTable('tours', ['title', 'meta_title', 'meta_desc', 'meta_keyward', 'shoulder']);
  await replaceInTable('transports', ['title', 'meta_title', 'meta_desc', 'meta_keyward', 'shoulder']);
  await replaceInTable('settings', ['value']);
  await replaceInTable('pages', ['title', 'content', 'meta_title', 'meta_desc']);
  await replaceInTable('widget_contents', ['title', 'content']);
  await replaceInTable('tour_translations', ['title']);
  await replaceInTable('destination_translations', ['title']);
}

main().catch(console.error).finally(() => prisma.$disconnect());
