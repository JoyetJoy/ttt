const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

BigInt.prototype.toJSON = function() { return this.toString() };

async function main() {
  const page = await prisma.pages.findFirst({
    where: { page_slug: 'home' }
  });
  
  if (page) {
    const contents = await prisma.widget_contents.findFirst({
      where: { page_id: page.id, widget_slug: 'about-content' }
    });
    
    if (contents && contents.widget_content) {
      let contentStr = JSON.stringify(contents.widget_content);
      
      // Replace variations of Gateway Tours & Travels
      contentStr = contentStr.replace(/GATEWAY Tours & Travels/g, 'Trivandrum Top Taxi');
      contentStr = contentStr.replace(/GATEWAY Tours &amp; Travels/g, 'Trivandrum Top Taxi');
      contentStr = contentStr.replace(/GATEWAY/g, 'Trivandrum Top Taxi');
      
      await prisma.widget_contents.update({
        where: { id: contents.id },
        data: { widget_content: JSON.parse(contentStr) }
      });
      
      console.log('Successfully updated about-content widget!');
    } else {
      console.log('Widget content not found.');
    }
  } else {
    console.log('Home page not found.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
