const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tour = await prisma.tours.findUnique({ where: { id: 20 } });
  if (tour) {
    const fields = ['faqs', 'includes', 'excludes', 'highlights', 'itinerary', 'person_types', 'extra_prices', 'service_fees', 'fixed_dates', 'open_hours', 'attribute_terms'];
    
    let updateData = {};
    for (const f of fields) {
      if (tour[f] && tour[f].length > 20000) { // Clear anything over 20KB
        console.log(`Field ${f} is HUGE: ${tour[f].length} bytes. Clearing it.`);
        updateData[f] = '[]'; // Reset to empty array JSON string
      } else if (tour[f]) {
        console.log(`Field ${f} size: ${tour[f].length} bytes.`);
      }
    }
    
    // Check content field as well, just in case
    if (tour.content && tour.content.length > 500000) {
       console.log(`Field content is HUGE: ${tour.content.length} bytes. Clearing it.`);
       updateData.content = '';
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.tours.update({
        where: { id: 20 },
        data: updateData
      });
      console.log('Cleared huge fields from DB!');
    } else {
      console.log('No huge fields found in DB.');
    }
  } else {
    console.log('Tour 20 not found');
  }
  await prisma.$disconnect();
}
check();
