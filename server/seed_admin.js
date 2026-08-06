const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com';
  const password = '123456789';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email,
        password: hashedPassword,
        role: 3, // Assuming 3 or 4 is admin based on AdminRoute.jsx
      }
    });
    console.log('Admin user created successfully');
  } else {
    // If user exists, update password and role just in case
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: 3 }
    });
    console.log('Admin user updated successfully');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
