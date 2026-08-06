const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.users.findMany();
  console.log(users.map(u => ({ id: u.id, fname: u.fname, lname: u.lname })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
