const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.pages.findFirst({
    where: { page_slug: 'home' }
  });
  if (page) {
    const contents = await prisma.widget_contents.findMany({
      where: { page_id: page.id }
    });
    console.log(contents.map(c => ({ slug: c.widget_slug, pos: c.position })));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
