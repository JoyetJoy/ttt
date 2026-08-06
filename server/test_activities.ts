import prisma from './src/prisma'; 
prisma.activities.findMany().then(console.log).catch(console.error);
