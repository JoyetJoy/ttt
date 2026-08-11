const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

BigInt.prototype.toJSON = function() { return this.toString() };

async function main() {
  const page = await prisma.pages.findFirst({
    where: { page_slug: 'home' }
  });
  if (page) {
    const contents = await prisma.widget_contents.findFirst({
      where: { page_id: page.id, widget_slug: 'latest-product' }
    });
    console.log(contents.widget_content);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
