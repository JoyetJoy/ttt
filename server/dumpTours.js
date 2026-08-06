const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const models = prisma._baseDmmf.modelMap || prisma._dmmf.datamodel.models;
  const modelList = Array.isArray(models) ? models : Object.values(models);

  let output = '';

  for (const model of modelList) {
    const modelName = model.name;
    const stringFields = model.fields.filter(f => f.type === 'String').map(f => f.name);

    if (stringFields.length === 0) continue;

    try {
      const records = await prisma[modelName].findMany();
      for (const record of records) {
        for (const field of stringFields) {
          if (typeof record[field] === 'string' && record[field].toLowerCase().includes('tours')) {
            output += `MODEL: ${modelName} | ID: ${record.id} | FIELD: ${field} | VAL: ${record[field].substring(0, 50)}\n`;
          }
        }
      }
    } catch (e) {
    }
  }
  
  fs.writeFileSync('db_tours.txt', output);
  console.log('Done');
}

main().catch(console.error).finally(() => prisma.$disconnect());
