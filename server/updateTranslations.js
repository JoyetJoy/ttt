const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const pageTranslations = await prisma.page_translations.findMany();
    const widgetTranslations = await prisma.widget_content_translations.findMany();
    
    let count = 0;
    
    for (const record of pageTranslations) {
      if ((record.title && record.title.includes('Q Tours')) || (record.content && record.content.includes('Q Tours'))) {
         let newTitle = record.title;
         let newContent = record.content;
         
         if (newTitle) {
           newTitle = newTitle.replace(/Q Tours & Travels/gi, 'Trivandrum Top Taxi')
                              .replace(/Q Tours and Travels/gi, 'GATEWAY Tours and Travels')
                              .replace(/Q Tours/gi, 'GATEWAY Tours');
         }
         
         if (newContent) {
           newContent = newContent.replace(/Q Tours & Travels/gi, 'Trivandrum Top Taxi')
                                  .replace(/Q Tours and Travels/gi, 'GATEWAY Tours and Travels')
                                  .replace(/Q Tours/gi, 'GATEWAY Tours');
         }
         
         await prisma.page_translations.update({
           where: { id: record.id },
           data: { title: newTitle, content: newContent }
         });
         count++;
      }
    }
    
    for (const record of widgetTranslations) {
      if ((record.title && record.title.includes('Q Tours')) || (record.content && record.content.includes('Q Tours'))) {
         let newTitle = record.title;
         let newContent = record.content;
         
         if (newTitle) {
           newTitle = newTitle.replace(/Q Tours & Travels/gi, 'Trivandrum Top Taxi')
                              .replace(/Q Tours and Travels/gi, 'GATEWAY Tours and Travels')
                              .replace(/Q Tours/gi, 'GATEWAY Tours');
         }
         
         if (newContent) {
           newContent = newContent.replace(/Q Tours & Travels/gi, 'Trivandrum Top Taxi')
                                  .replace(/Q Tours and Travels/gi, 'GATEWAY Tours and Travels')
                                  .replace(/Q Tours/gi, 'GATEWAY Tours');
         }
         
         await prisma.widget_content_translations.update({
           where: { id: record.id },
           data: { title: newTitle, content: newContent }
         });
         count++;
      }
    }
    
    console.log('Updated ' + count + ' translation records.');

  } catch(e) {
    console.error(e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
