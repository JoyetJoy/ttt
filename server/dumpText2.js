const { PrismaClient, Prisma } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const models = Prisma.dmmf.datamodel.models;
  let fileContent = '';

  for (const model of models) {
    const modelName = model.name;
    const stringFields = model.fields.filter(f => f.type === 'String' || f.type === 'Text' || f.type === 'LongText').map(f => f.name);

    if (stringFields.length === 0) continue;

    try {
      const records = await prisma[modelName].findMany();
      if (records.length === 0) continue;

      for (const record of records) {
        for (const field of stringFields) {
          if (record[field] && typeof record[field] === 'string') {
            const val = record[field];
            if (val.toLowerCase().includes('q tour') || val.toLowerCase().includes('q-tour') || val.toLowerCase().includes('tours and travels')) {
              fileContent += `MODEL: ${modelName} | ID: ${record.id} | FIELD: ${field}\nVAL: ${val}\n\n`;
            }
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }
  
  fs.writeFileSync('db_dump.txt', fileContent);
  console.log('Finished dumping, found: ' + (fileContent.length > 0));
}

main().catch(console.error).finally(() => prisma.$disconnect());
