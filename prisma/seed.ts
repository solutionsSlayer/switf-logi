import { PrismaClient, DeliveryStatus } from '@prisma/client';
import { addDays, subDays, format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.deliveryTrend.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.region.deleteMany();

  // Create regions
  const regions = await Promise.all([
    prisma.region.create({
      data: { name: 'Paris', performance: 96 },
    }),
    prisma.region.create({
      data: { name: 'Lyon', performance: 94 },
    }),
    prisma.region.create({
      data: { name: 'Marseille', performance: 92 },
    }),
    prisma.region.create({
      data: { name: 'Bordeaux', performance: 95 },
    }),
    prisma.region.create({
      data: { name: 'Lille', performance: 93 },
    }),
  ]);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Marie Dubois',
        email: 'marie.dubois@example.com',
        phone: '+33123456789',
        address: '123 Rue de Paris, Paris',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Jean Martin',
        email: 'jean.martin@example.com',
        phone: '+33123456790',
        address: '456 Avenue de Lyon, Lyon',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sophie Bernard',
        email: 'sophie.bernard@example.com',
        phone: '+33123456791',
        address: '789 Boulevard de Marseille, Marseille',
      },
    }),
  ]);

  // Create deliveries
  const deliveries = await Promise.all([
    prisma.delivery.create({
      data: {
        trackingNumber: 'SL-2024-001',
        status: DeliveryStatus.DELIVERED,
        customerId: customers[0].id,
        destination: 'Paris',
        expectedDelivery: new Date(),
        actualDelivery: subDays(new Date(), 1),
        regionId: regions[0].id,
      },
    }),
    prisma.delivery.create({
      data: {
        trackingNumber: 'SL-2024-002',
        status: DeliveryStatus.DELAYED,
        customerId: customers[1].id,
        destination: 'Lyon',
        expectedDelivery: new Date(),
        actualDelivery: addDays(new Date(), 1),
        delay: 2.5,
        regionId: regions[1].id,
      },
    }),
    prisma.delivery.create({
      data: {
        trackingNumber: 'SL-2024-003',
        status: DeliveryStatus.IN_TRANSIT,
        customerId: customers[2].id,
        destination: 'Marseille',
        expectedDelivery: addDays(new Date(), 1),
        regionId: regions[2].id,
      },
    }),
  ]);

  // Create delivery trends for the last 7 days
  const today = new Date();
  const trends = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const date = subDays(today, 6 - index);
      const deliveries = Math.floor(Math.random() * 100) + 150;
      const onTime = Math.floor(deliveries * 0.95);
      const delayed = deliveries - onTime;

      return prisma.deliveryTrend.create({
        data: {
          date,
          deliveries,
          onTime,
          delayed,
        },
      });
    })
  );

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });