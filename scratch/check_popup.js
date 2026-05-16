const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const popup = await prisma.popup.findFirst();
  console.log('Popup Data:', JSON.stringify(popup, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
