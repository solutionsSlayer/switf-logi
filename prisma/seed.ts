import { PrismaClient, DeliveryStatus, Priority, CustomerTier, AttemptStatus, ClaimType, ClaimStatus, InsuranceStatus } from '@prisma/client';
import { addDays, subDays, format } from 'date-fns';
import { faker } from '@faker-js/faker/locale/fr';

const prisma = new PrismaClient();

const TOTAL_CUSTOMERS = 1000;
const TOTAL_DELIVERIES = 5000;
const REGIONS = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Lille', 'Toulouse', 'Nantes', 'Strasbourg'];

async function main() {
  // Nettoyage de la base dans le bon ordre
  await Promise.all([
    prisma.insurance.deleteMany(),
    prisma.claim.deleteMany(),
    prisma.deliveryAttempt.deleteMany(),
  ]);

  await prisma.delivery.deleteMany();
  await prisma.customerPreference.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.deliveryTrend.deleteMany();
  await prisma.region.deleteMany();

  // Création des régions
  const regions = await Promise.all(
    REGIONS.map(name => 
      prisma.region.create({
        data: {
          name,
          performance: 90 + Math.random() * 10, // Performance entre 90 et 100
        }
      })
    )
  );

  // Création des clients
  const customers = await Promise.all(
    Array.from({ length: TOTAL_CUSTOMERS }).map(() => {
      const tier = faker.helpers.arrayElement(Object.values(CustomerTier));
      return prisma.customer.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
          loyaltyPoints: faker.number.int({ min: 0, max: 5000 }),
          tier,
          preferences: tier !== 'STANDARD' ? {
            create: {
              preferredTime: faker.helpers.arrayElement(['08:00-12:00', '14:00-18:00', '18:00-20:00']),
              specialInstructions: faker.helpers.arrayElement([
                'Code entrée: 1234',
                'Sonner avant livraison',
                'Laisser chez le gardien',
                null
              ]),
            }
          } : undefined
        }
      });
    })
  );

  // Création des livraisons et données associées
  const deliveries = await Promise.all(
    Array.from({ length: TOTAL_DELIVERIES }).map(async (_, index) => {
      const customer = faker.helpers.arrayElement(customers);
      const region = faker.helpers.arrayElement(regions);
      const priority = faker.helpers.arrayElement(Object.values(Priority));
      const status = faker.helpers.arrayElement(Object.values(DeliveryStatus));
      const expectedDelivery = faker.date.between({
        from: subDays(new Date(), 30),
        to: addDays(new Date(), 7)
      });
      const isDelivered = status === 'DELIVERED';
      const hasDelay = Math.random() > 0.8;
      const delay = hasDelay ? faker.number.int({ min: 1, max: 72 }) : null;

      const delivery = await prisma.delivery.create({
        data: {
          trackingNumber: `SL-2024-${(index + 1).toString().padStart(6, '0')}`,
          status,
          customerId: customer.id,
          destination: region.name,
          expectedDelivery,
          actualDelivery: isDelivered ? addDays(expectedDelivery, delay || 0) : null,
          delay,
          weight: Number(faker.number.float({ min: 0.1, max: 30 }).toFixed(1)),
          dimensions: `${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 10, max: 100 })}x${faker.number.int({ min: 10, max: 100 })}`,
          priority,
          signature: faker.datatype.boolean(),
          notes: faker.helpers.arrayElement([null, 'Fragile', 'Urgent', 'Volumineux']),
          regionId: region.id,
        }
      });

      // Création des tentatives de livraison
      if (isDelivered || status === 'IN_TRANSIT') {
        const attempts = faker.number.int({ min: 1, max: 3 });
        await Promise.all(
          Array.from({ length: attempts }).map((_, i) =>
            prisma.deliveryAttempt.create({
              data: {
                deliveryId: delivery.id,
                attemptDate: addDays(expectedDelivery, i),
                status: i === attempts - 1 && isDelivered ? 
                  AttemptStatus.SUCCESS : 
                  faker.helpers.arrayElement([AttemptStatus.NO_ONE_HOME, AttemptStatus.WRONG_ADDRESS, AttemptStatus.REFUSED]),
                notes: faker.helpers.arrayElement([null, 'Client absent', 'Adresse incorrecte', 'Refusé par le client']),
              }
            })
          )
        );
      }

      // Création d'assurance (70% des livraisons)
      if (Math.random() < 0.7) {
        await prisma.insurance.create({
          data: {
            deliveryId: delivery.id,
            coverage: Number(faker.number.float({ min: 100, max: 5000 }).toFixed(2)),
            premium: Number(faker.number.float({ min: 5, max: 250 }).toFixed(2)),
            status: faker.helpers.arrayElement(Object.values(InsuranceStatus)),
          }
        });
      }

      // Création de réclamation (10% des livraisons)
      if (Math.random() < 0.1) {
        await prisma.claim.create({
          data: {
            customerId: customer.id,
            deliveryId: delivery.id,
            type: faker.helpers.arrayElement(Object.values(ClaimType)),
            status: faker.helpers.arrayElement(Object.values(ClaimStatus)),
            amount: Number(faker.number.float({ min: 50, max: 1000 }).toFixed(2)),
            description: faker.helpers.arrayElement([
              'Colis endommagé',
              'Retard important',
              'Colis perdu',
              'Contenu manquant'
            ]),
            resolution: faker.helpers.arrayElement([null, 'Remboursement effectué', 'En cours de traitement', 'Réclamation rejetée']),
          }
        });
      }

      return delivery;
    })
  );

  // Création des tendances de livraison sur 30 jours
  await Promise.all(
    Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(new Date(), 29 - i);
      const deliveries = faker.number.int({ min: 150, max: 300 });
      const onTime = Math.floor(deliveries * (0.85 + Math.random() * 0.15));
      return prisma.deliveryTrend.create({
        data: {
          date,
          deliveries,
          onTime,
          delayed: deliveries - onTime,
        }
      });
    })
  );

  console.log('Base de données peuplée avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });