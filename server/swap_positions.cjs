const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

BigInt.prototype.toJSON = function() { return this.toString() };

async function main() {
  const page = await prisma.pages.findFirst({
    where: { page_slug: 'home' }
  });
  
  if (page) {
    const aboutContent = await prisma.widget_contents.findFirst({
      where: { page_id: page.id, widget_slug: 'about-content' }
    });
    
    const latestProduct = await prisma.widget_contents.findFirst({
      where: { page_id: page.id, widget_slug: 'latest-product' }
    });
    
    if (aboutContent && latestProduct) {
      // Swap positions
      await prisma.widget_contents.update({
        where: { id: aboutContent.id },
        data: { position: 4 }
      });
      
      await prisma.widget_contents.update({
        where: { id: latestProduct.id },
        data: { position: 3 }
      });
      
      console.log('Successfully swapped positions!');
    } else {
      console.log('Widgets not found.');
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
