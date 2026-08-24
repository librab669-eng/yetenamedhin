const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.expense.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.family.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.backupLog.deleteMany({});
  await prisma.setting.deleteMany({});
  console.log('Cleared all data');
}

main().catch(console.error).finally(() => prisma.$disconnect());
