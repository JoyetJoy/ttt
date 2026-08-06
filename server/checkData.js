const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const banners = await prisma.banner_twos.findMany();
    console.log('Banners:', banners);

    const pages = await prisma.pages.findMany();
    console.log('Pages:', pages.map(p => ({id: p.id, title: p.title, content: p.content ? p.content.substring(0,100) : ''})));
    
    const settings = await prisma.settings.findMany();
    console.log('Settings:', settings.filter(s => s.value && s.value.includes('Q Tours')));

    const widgets = await prisma.widget_contents.findMany();
    console.log('Widgets:', widgets.map(w => ({id: w.id, title: w.title, content: w.content ? w.content.substring(0,100) : ''})));

  } catch(e) {
    console.error(e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
