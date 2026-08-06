const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pageTrans = await prisma.page_translations.findMany();
  for(const p of pageTrans) {
    if ((p.title && p.title.toLowerCase().includes('tours')) || (p.content && p.content.toLowerCase().includes('tours')))
      console.log('PageTrans:', p.id);
  }

  const widgetTrans = await prisma.widget_content_translations.findMany();
  for(const w of widgetTrans) {
    if ((w.title && w.title.toLowerCase().includes('tours')) || (w.content && w.content.toLowerCase().includes('tours')))
      console.log('WidgetTrans:', w.id);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
