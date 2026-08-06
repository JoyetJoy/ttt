const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const banners = await prisma.banner_twos.findMany();
  for (const b of banners) {
    if ((b.title && b.title.toLowerCase().includes('tours')) || (b.text && b.text.toLowerCase().includes('tours')) || (b.image && b.image.toLowerCase().includes('tours'))) {
      console.log('BANNER:', b);
    }
  }

  const pages = await prisma.pages.findMany();
  for (const p of pages) {
    if ((p.title && p.title.toLowerCase().includes('tours')) || (p.content && p.content.toLowerCase().includes('tours'))) {
      console.log('PAGE:', p.id);
    }
  }

  const widgets = await prisma.widget_contents.findMany();
  for (const w of widgets) {
    if ((w.title && w.title.toLowerCase().includes('tours')) || (w.content && w.content.toLowerCase().includes('tours'))) {
      console.log('WIDGET:', w.id, w.title, w.content ? w.content.substring(0, 50) : '');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
