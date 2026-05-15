const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "thanhthaooo099@gmail.com";
  const password = "@Thao2004";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Checking if user ${email} exists...`);
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    console.log("Admin already exists. Updating password...");
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
  } else {
    console.log("Creating new admin user...");
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Admin",
        role: "admin",
      }
    });
  }
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
