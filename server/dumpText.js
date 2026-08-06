const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const models = prisma._baseDmmf.modelMap || prisma._dmmf.datamodel.models;
  const modelList = Array.isArray(models) ? models : Object.values(models);

  for (const model of modelList) {
    const modelName = model.name;
    const stringFields = model.fields.filter(f => f.type === 'String' || f.type === 'Text' || f.type === 'LongText').map(f => f.name);

    if (stringFields.length === 0) continue;

    try {
      const records = await prisma[modelName].findMany();
      if (records.length === 0) continue;

      let fileContent = '';
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
      if (fileContent) {
        fs.appendFileSync('db_dump.txt', fileContent);
      }
    } catch (e) {
      // Ignore
    }
  }
  
  console.log('Finished dumping');
}

main().catch(console.error).finally(() => prisma.$disconnect());
