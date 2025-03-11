import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  console.log("Starting database seeding...");

  // ========== SEED USERS ==========
  console.log("Seeding users...");
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phoneNumber: faker.phone.number(),
          password: faker.internet.password(),
          isSponsor: faker.datatype.boolean(),
          hasCompletedOnboarding: faker.datatype.boolean(),
        },
      });
    })
  );
  console.log(`Created ${users.length} users`);

  // ========== SEED PROFILES ==========
  console.log("Seeding profiles...");
  const profiles = await Promise.all(
    users.map(async (user) => {
      return prisma.profile.create({
        data: {
          userId: user.id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          bio: faker.lorem.words(5), // Shorter bio
          country: faker.helpers.arrayElement([
            "USA", "CANADA", "UK", "FRANCE", "GERMANY"
          ]),
          phoneNumber: faker.phone.number(),
          gender: faker.helpers.arrayElement(["MALE", "FEMALE"]),
          isAnonymous: false,
          isBanned: false,
          isVerified: faker.datatype.boolean(),
          isOnline: faker.datatype.boolean(),
          preferredCategories: faker.commerce.department(),
          referralSource: faker.helpers.arrayElement([
            "SOCIAL_MEDIA", "FRIEND_RECOMMENDATION", "APP_STORE", 
            "GOOGLE_SEARCH", "ADVERTISEMENT", "OTHER"
          ]),
        },
      });
    })
  );
  console.log(`Created ${profiles.length} profiles`);

  // ========== SEED SERVICE PROVIDERS ==========
  console.log("Seeding service providers...");
  const serviceProviders = await Promise.all(
    users.slice(0, 3).map(async (user) => {
      return prisma.serviceProvider.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(["SPONSOR", "SUBSCRIBER"]),
          subscriptionLevel: faker.helpers.arrayElement(["BASIC", "PREMIUM"]),
          isVerified: faker.datatype.boolean(),
          badge: faker.system.fileName(),
          idCard: faker.string.uuid(),
          passport: faker.string.alphanumeric(9),
          license: faker.string.alphanumeric(12),
          creditCard: faker.finance.creditCardNumber().slice(-4),
        },
      });
    })
  );
  console.log(`Created ${serviceProviders.length} service providers`);

  // ========== SEED CATEGORIES ==========
  console.log("Seeding categories...");
  const categories = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.category.create({
        data: {
          name: faker.commerce.department(),
          description: faker.commerce.productDescription(),
          isDisabled: false,
        },
      });
    })
  );
  console.log(`Created ${categories.length} categories`);

  // ========== SEED SPONSORSHIPS ==========
  console.log("Seeding sponsorships...");
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
          platform: faker.helpers.arrayElement([
            "FACEBOOK", "INSTAGRAM", "YOUTUBE", "TWITTER", "TIKTOK", "OTHER"
          ]),
          categoryId: faker.helpers.arrayElement(categories).id,
          isActive: true,
          sponsorId: serviceProvider.id,
          recipientId: recipient.id,
          product: faker.commerce.productName(),
          amount: faker.number.float({ min: 50, max: 500 }),
          status: faker.helpers.arrayElement(["pending", "approved", "rejected"]),
        },
      });
    })
  );
  console.log(`Created ${sponsorships.length} sponsorships`);

  // ========== SEED MEDIA ==========
  console.log("Seeding media...");
  const media = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.media.create({
        data: {
          url: faker.image.url(),
          type: faker.helpers.arrayElement(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"]),
          mimeType: faker.system.mimeType(),
          extension: faker.helpers.arrayElement(["JPG", "PNG", "PDF", "MP4", "OTHER"]),
          filename: faker.system.fileName(),
          size: faker.number.float({ min: 100, max: 10000 }),
          width: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 1920 })),
          height: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 1080 })),
        },
      });
    })
  );

  // ========== SEED GOODS ==========
  console.log("Seeding goods...");
  const goods = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.goods.create({
        data: {
          name: faker.commerce.productName(),
          size: faker.helpers.arrayElement(["Small", "Medium", "Large"]),
          weight: faker.number.float({ min: 0.1, max: 20 }),
          price: faker.number.float({ min: 10, max: 1000 }),
          description: faker.commerce.productDescription(),
          imageId: faker.helpers.arrayElement(media).id,
          goodsUrl: faker.internet.url(),
          isVerified: faker.datatype.boolean(),
          categoryId: faker.helpers.arrayElement(categories).id,
        },
      });
    })
  );

  // ========== SEED REQUESTS ==========
  console.log("Seeding requests...");
  const requests = await Promise.all(
    Array.from({ length: 3 }).map(async () => {
      return prisma.request.create({
        data: {
          userId: faker.helpers.arrayElement(users).id,
          goodsId: faker.helpers.arrayElement(goods).id,
          quantity: faker.number.int({ min: 1, max: 5 }),
          goodsLocation: faker.location.country(),
          goodsDestination: faker.location.country(),
          date: faker.date.future(),
          status: faker.helpers.arrayElement(["PENDING", "ACCEPTED", "CANCELLED", "REJECTED"]),
          withBox: faker.datatype.boolean(),
        },
      });
    })
  );

  // ========== SEED ORDERS ==========
  console.log("Seeding orders...");
  const orders = await Promise.all(
    requests.map(async (request) => {
      return prisma.order.create({
        data: {
          requestId: request.id,
          travelerId: faker.helpers.arrayElement(users).id,
          departureDate: faker.date.future(),
          arrivalDate: faker.date.future(),
          trackingNumber: faker.string.alphanumeric(10),
          totalAmount: faker.number.float({ min: 50, max: 500 }),
          paymentStatus: faker.helpers.arrayElement(["ON_HOLD", "PAYED", "REFUNDED"]),
          orderStatus: faker.helpers.arrayElement(["PENDING", "IN_TRANSIT", "DELIVERED"]),
        },
      });
    })
  );

  // ========== SEED PAYMENTS ==========
  console.log("Seeding payments...");
  await Promise.all(
    orders.map(async (order) => {
      return prisma.payment.create({
        data: {
          orderId: order.id,
          amount: faker.number.float({ min: 50, max: 500 }),
          currency: faker.helpers.arrayElement(["DOLLAR", "EURO", "TND"]),
          status: faker.helpers.arrayElement(["PENDING", "COMPLETED", "REFUND", "FAILED", "PROCCESSING"]),
          paymentMethod: faker.helpers.arrayElement(["CREDITCARD", "D17", "STRIPE", "PAYPAL", "BANKTRANSFER"]),
          transactionId: faker.string.uuid(),
          paymentUrl: faker.internet.url(),
        },
      });
    })
  );

  // ========== SEED PICKUPS ==========
  console.log("Seeding pickups...");
  await Promise.all(
    orders.map(async (order) => {
      return prisma.pickup.create({
        data: {
          orderId: order.id,
          pickupType: faker.helpers.arrayElement(["AIRPORT", "IN_PERSON", "PICKUPPOINT", "DELIVERY"]),
          location: faker.location.city(),
          address: faker.location.streetAddress(),
          coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
          contactPhoneNumber: faker.phone.number(),
          status: faker.helpers.arrayElement(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DELAYED", "DELIVERED"]),
          scheduledTime: faker.date.future(),
        },
      });
    })
  );

  // ========== SEED REVIEWS ==========
  console.log("Seeding reviews...");
  await Promise.all(
    orders.map(async (order) => {
      return prisma.review.create({
        data: {
          reviewerId: faker.helpers.arrayElement(users).id,
          reviewedId: faker.helpers.arrayElement(users).id,
          orderId: order.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          title: faker.lorem.sentence(3),
          comment: faker.lorem.sentence(5),
          reviewType: faker.helpers.arrayElement([
            "USER_REVIEW", "EXPERIENCE_REVIEW", "DELIVERYMAN_REVIEW", "PICKUPPOINT_REVIEW"
          ]),
          status: faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED", "EDITED"]),
        },
      });
    })
  );

  // ========== SEED CHATS ==========
  console.log("Seeding chats...");
  const chats = await Promise.all(
    Array.from({ length: 3 }).map(async () => {
      return prisma.chat.create({
        data: {
          requesterId: faker.helpers.arrayElement(users).id,
          providerId: faker.helpers.arrayElement(users).id,
          productId: faker.helpers.arrayElement(goods).id,
        },
      });
    })
  );

  // ========== SEED MESSAGES ==========
  console.log("Seeding messages...");
  await Promise.all(
    chats.flatMap(chat => 
      Array.from({ length: 3 }).map(async () => {
        return prisma.message.create({
          data: {
            chatId: chat.id,
            senderId: chat.requesterId,
            receiverId: chat.providerId,
            type: faker.helpers.arrayElement(["TEXT", "IMAGE"]),
            content: faker.lorem.sentence(3),
            mediaId: faker.helpers.maybe(() => faker.helpers.arrayElement(media).id),
            isRead: faker.datatype.boolean(),
            time: faker.date.recent(),
          },
        });
      })
    )
  );

  // ========== SEED GOODS PROCESSES ==========
  console.log("Seeding goods processes...");
  await Promise.all(
    orders.map(async (order) => {
      return prisma.goodsProcess.create({
        data: {
          orderId: order.id,
          status: faker.helpers.arrayElement([
            "INITIALIZED", "CONFIRMED", "PAID", "IN_TRANSIT", 
            "PICKUP_MEET", "FINALIZED", "CANCELLED"
          ]),
        },
      });
    })
  );

  // ========== SEED GOODS POSTS ==========
  console.log("Seeding goods posts...");
  const goodsPosts = await Promise.all(
    Array.from({ length: 6 }).map(async () => {
      const traveler = faker.helpers.arrayElement(users);
      return prisma.goodsPost.create({
        data: {
          title: faker.commerce.productName(),
          content: faker.lorem.sentence(10),
          travelerId: traveler.id,
          arrivalDate: faker.date.future(),
          availableKg: faker.number.float({ min: 1, max: 30, precision: 0.5 }),
          phoneNumber: faker.phone.number(),
          airportLocation: faker.helpers.arrayElement([
            "Charles de Gaulle Airport",
            "Heathrow Airport",
            "Dubai International Airport",
            "John F. Kennedy Airport",
            "Tunis-Carthage Airport",
            "Frankfurt Airport"
          ]),
          categoryId: faker.helpers.arrayElement(categories).id,
          isPublished: true,
        },
      });
    })
  );
  console.log(`Created ${goodsPosts.length} goods posts`);

  // ========== SEED PROMO POSTS ==========
  console.log("Seeding promo posts...");
  const promoPosts = await Promise.all(
    Array.from({ length: 4 }).map(async () => {
      const publisher = faker.helpers.arrayElement(users);
      return prisma.promoPost.create({
        data: {
          title: faker.commerce.productName(),
          content: faker.lorem.paragraph(2),
          publisherId: publisher.id,
          categoryId: faker.helpers.arrayElement(categories).id,
          isPublished: true,
        },
      });
    })
  );
  console.log(`Created ${promoPosts.length} promo posts`);

  console.log("Database seeding completed successfully!");
}

async function main() {
  try {
    await seed();
  } catch (e) {
    console.error("Error seeding database:", e);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
