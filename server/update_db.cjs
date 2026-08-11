const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

BigInt.prototype.toJSON = function() { return this.toString() };

async function main() {
  const page = await prisma.pages.findFirst({
    where: { page_slug: 'home' }
  });
  if (!page) return;
  
  const heroWidget = await prisma.widget_contents.findFirst({
    where: { 
      page_id: page.id,
      widget_slug: 'sliders'
    }
  });

  if (!heroWidget) return;

  const newContent = {
    "slider": {
      "1": {
        "title": "Premium City Transport with Trivandrum Top Taxi",
        "description": "Experience Safe, Comfortable, And Reliable Rides Across The City. Our Premium Fleet Ensures You Arrive At Your Destination In Style And On Time.",
        "location": "City Transport",
        "img": "kerala_taxi_hero_1.jpg",
        "button_text": "Book Now",
        "button_url": "/transports",
        "rating_logo": "",
        "rating": "5"
      },
      "2": {
        "title": "Explore the City in Comfort",
        "description": "Discover Local Attractions With Our Customized Sightseeing Tours. Travel With Passionate Drivers Committed To Excellence.",
        "location": "City Tours",
        "img": "kerala_taxi_hero_2.jpg",
        "button_text": "Book Now",
        "button_url": "/transports",
        "rating_logo": "",
        "rating": "5"
      },
      "3": {
        "title": "Luxury Airport Transfers",
        "description": "Start Or End Your Journey Seamlessly. We Provide Punctual And Luxurious Airport Transfer Services Tailored To Your Schedule.",
        "location": "Airport Transfer",
        "img": "kerala_taxi_hero_3.jpg",
        "button_text": "Book Now",
        "button_url": "/transports",
        "rating_logo": "",
        "rating": "5"
      }
    }
  };

  await prisma.widget_contents.update({
    where: { id: heroWidget.id },
    data: { widget_content: JSON.stringify(newContent) }
  });

  console.log("Updated sliders widget successfully with 3 Kerala slides!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
