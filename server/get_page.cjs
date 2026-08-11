const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = await prisma.pages.findMany({
    where: { page_slug: 'home' }
  });
  console.log('Number of home pages:', pages.length);
  pages.forEach(p => {
    console.log('--- Page ID:', p.id, '---');
    console.log(p.widget_content_code);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
