import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  // Seed Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phoneNumber: faker.phone.number(),
          password: faker.internet.password(),
          isSponsor: faker.datatype.boolean(),
          createdAt: faker.date.past(),
          updatedAt: new Date(),
        },
      });
    })
  );

  // Seed Service Providers
  const serviceProviders = await Promise.all(
    users.slice(0, 3).map(async (user) => {
      return prisma.serviceProvider.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(["SPONSOR", "SUBSCRIBER"]),
          subscriptionLevel: faker.helpers.arrayElement(["BASIC", "PREMIUM"]),
          isVerified: faker.datatype.boolean(),
          badge: faker.helpers.maybe(() => faker.system.fileName()),
          idCard: faker.helpers.maybe(() => faker.string.uuid()),
          passport: faker.helpers.maybe(() => faker.string.alphanumeric(9)),
          license: faker.helpers.maybe(() => faker.string.alphanumeric(12)),
          creditCard: faker.helpers.maybe(() => faker.finance.creditCardNumber().slice(-4)),
          createdAt: faker.date.past(),
          updatedAt: new Date(),
        },
      });
    })
  );

  // Update Users with Service Provider IDs where applicable
  await Promise.all(
    serviceProviders.map(async (sp) => {
      return prisma.user.update({
        where: { id: sp.userId },
        data: { serviceProviderId: sp.id.toString() },
      });
    })
  );

  // Create categories first
  const categories = await Promise.all(
    Array.from({ length: 3 }).map(async () => {
      return prisma.category.create({
        data: {
          name: faker.commerce.department(),
          description: faker.commerce.productDescription(),
        },
      });
    })
  );

  // Seed Sponsorships with relations
  const sponsorships = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      const serviceProvider = faker.helpers.arrayElement(serviceProviders);
      const recipient = faker.helpers.arrayElement(users.filter(u => u.id !== serviceProvider.userId));
      
      return prisma.sponsorship.create({
        data: {
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          price: faker.number.float({ min: 100, max: 1000 }),
          duration: faker.number.int({ min: 30, max: 365 }),
          platform: faker.helpers.arrayElement(["FACEBOOK", "INSTAGRAM", "YOUTUBE", "TWITTER", "TIKTOK", "OTHER"]),
          categoryId: faker.helpers.arrayElement(categories).id,
          sponsorId: serviceProvider.id,
          recipientId: recipient.id,
          product: faker.commerce.productName(),
          amount: faker.number.float({ min: 50, max: 500 }),
          status: faker.helpers.arrayElement(["pending", "approved", "rejected"]),
          createdAt: faker.date.past(),
          updatedAt: new Date(),
        },
      });
    })
  );

  console.log("Seeding completed successfully!");
}

async function main() {
  try {
    await seed();
  } catch (e) {
    console.error("Error seeding database:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
