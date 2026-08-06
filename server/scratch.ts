import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.widgets.findMany().then(res => console.log(JSON.stringify(res, (k,v) => typeof v === 'bigint' ? v.toString() : v, 2))).catch(console.error).finally(() => prisma.$disconnect());
