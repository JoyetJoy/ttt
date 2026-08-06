const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const page = await prisma.pages.findFirst({
    where: { page_slug: 'home' }
  });
  
  if (!page) {
    console.log("No home page found");
    return;
  }

  const widgets = await prisma.widget_contents.findMany({
    where: { page_id: page.id },
    orderBy: { position: 'asc' }
  });

  console.log(JSON.stringify(widgets.map(w => ({
    id: w.id.toString(),
    slug: w.widget_slug,
    position: w.position
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
