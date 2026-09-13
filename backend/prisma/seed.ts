import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing
  await prisma.maintenanceLog.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin HanaStore',
      email: 'admin@hanastore.local',
      passwordHash,
      role: 'admin',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Budi Customer',
      email: 'customer@hanastore.local',
      passwordHash,
      role: 'customer',
    },
  });

  console.log('Users created:', admin.email, customer.email);

  const catExcavator = await prisma.category.create({ data: { name: 'Excavator' } });
  const catBulldozer = await prisma.category.create({ data: { name: 'Bulldozer' } });
  const catCrane = await prisma.category.create({ data: { name: 'Crane' } });

  console.log('Categories created');

  const equipments = [
    { name: 'Excavator CAT 320', categoryId: catExcavator.id, dailyRate: 2500000, location: 'Jakarta', status: 'available' as const },
    { name: 'Excavator Komatsu PC200', categoryId: catExcavator.id, dailyRate: 2200000, location: 'Surabaya', status: 'available' as const },
    { name: 'Excavator Hitachi ZX200', categoryId: catExcavator.id, dailyRate: 2300000, location: 'Bandung', status: 'available' as const },
    { name: 'Excavator Kobelco SK200', categoryId: catExcavator.id, dailyRate: 2100000, location: 'Medan', status: 'rented' as const },
    { name: 'Bulldozer CAT D6', categoryId: catBulldozer.id, dailyRate: 3000000, location: 'Jakarta', status: 'available' as const },
    { name: 'Bulldozer Komatsu D65', categoryId: catBulldozer.id, dailyRate: 2800000, location: 'Semarang', status: 'available' as const },
    { name: 'Bulldozer Shantui SD16', categoryId: catBulldozer.id, dailyRate: 2000000, location: 'Yogyakarta', status: 'maintenance' as const },
    { name: 'Crane Tadano 25T', categoryId: catCrane.id, dailyRate: 3500000, location: 'Jakarta', status: 'available' as const },
    { name: 'Crane Kato 50T', categoryId: catCrane.id, dailyRate: 5000000, location: 'Surabaya', status: 'available' as const },
    { name: 'Crane Grove 80T', categoryId: catCrane.id, dailyRate: 7000000, location: 'Balikpapan', status: 'available' as const },
  ];

  for (const eq of equipments) {
    await prisma.equipment.create({
      data: {
        name: eq.name,
        categoryId: eq.categoryId,
        dailyRate: eq.dailyRate,
        location: eq.location,
        status: eq.status,
        photoUrl: `https://picsum.photos/seed/${encodeURIComponent(eq.name)}/600/400`,
      },
    });
  }

  console.log('Equipment seeded: 10 items');
  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
