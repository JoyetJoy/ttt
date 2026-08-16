const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = prisma._baseDmmf.modelMap || prisma._dmmf.datamodel.models;
  const modelList = Array.isArray(models) ? models : Object.values(models);

  let totalUpdated = 0;

  for (const model of modelList) {
    const modelName = model.name;
    const stringFields = model.fields.filter(f => f.type === 'String').map(f => f.name);

    if (stringFields.length === 0) continue;

    try {
      const records = await prisma[modelName].findMany();
      for (const record of records) {
        let updated = false;
        const data = {};

        for (const field of stringFields) {
          if (typeof record[field] === 'string') {
            const original = record[field];
            // Case-insensitive replacement
            const replaced = original
              .replace(/Q Tours & Travels/gi, 'Trivandrum Top Taxi')
              .replace(/GATEWAY Tours & Travels/gi, 'Trivandrum Top Taxi')
              .replace(/Q Tours and Travels/gi, 'GATEWAY Tours and Travels')
              .replace(/Q Tours/gi, 'GATEWAY Tours');
            
            if (replaced !== original) {
              data[field] = replaced;
              updated = true;
            }
          }
        }

        if (updated) {
          // Prisma expects the primary key for the where clause.
          // Let's find the ID field. Usually 'id', but let's check.
          const idField = model.fields.find(f => f.isId)?.name || 'id';
          if (record[idField]) {
            await prisma[modelName].update({
              where: { [idField]: record[idField] },
              data
            });
            console.log(`Updated record ${record[idField]} in ${modelName}`);
            totalUpdated++;
          }
        }
      }
    } catch (e) {
      // Ignore models that might be views or unsupported
    }
  }
  
  console.log(`Total records updated: ${totalUpdated}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
