import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seed() {
  // Clean existing data
  await prisma.$transaction([
    prisma.processEvent.deleteMany(),
    prisma.goodsProcess.deleteMany(),
    prisma.reputationTransaction.deleteMany(),
    prisma.reputation.deleteMany(),
    prisma.promoPost.deleteMany(),
    prisma.goodsPost.deleteMany(),
    prisma.message.deleteMany(),
    prisma.chat.deleteMany(),
    prisma.sponsorship.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.review.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.pickup.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.order.deleteMany(),
    prisma.request.deleteMany(),
    prisma.goods.deleteMany(),
    prisma.category.deleteMany(),
    prisma.media.deleteMany(),
    prisma.serviceProvider.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Create Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phoneNumber: faker.phone.number(),
          password: faker.internet.password(),
        },
      });
    })
  );

  // Create Profiles
  const profiles = await Promise.all(
    users.map((user) =>
      prisma.profile.create({
        data: {
          userId: user.id,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          bio: faker.lorem.sentence(),
          country: faker.helpers.arrayElement([
            "USA",
            "CANADA",
            "UK",
            "TUNISIA",
            "FRANCE",
            "GERMANY",
          ]),
          gender: faker.helpers.arrayElement(["MALE", "FEMALE"]),
          isVerified: faker.datatype.boolean(),
        },
      })
    )
  );

  // Create Media
  const media = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      return prisma.media.create({
        data: {
          url: faker.image.url(),
          type: faker.helpers.arrayElement([
            "IMAGE",
            "VIDEO",
            "AUDIO",
            "DOCUMENT",
            "OTHER",
          ]),
          mimeType: faker.system.mimeType(),
          extension: faker.helpers.arrayElement([
            "JPG",
            "JPEG",
            "PNG",
            "PDF",
            "MP4",
            "DOCX",
          ]),
          filename: faker.system.fileName(),
          size: faker.number.float({ min: 1, max: 1000 }),
          width: faker.number.int({ min: 100, max: 1920 }),
          height: faker.number.int({ min: 100, max: 1080 }),
        },
      });
    })
  );

  // Create Categories
  const categories = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.category.create({
        data: {
          name: faker.commerce.department(),
          description: faker.lorem.sentence(),
        },
      });
    })
  );

  // Create Goods
  const goods = await Promise.all(
    Array.from({ length: 15 }).map(async () => {
      return prisma.goods.create({
        data: {
          name: faker.commerce.productName(),
          size: `${faker.number.int({ min: 1, max: 100 })}x${faker.number.int({
            min: 1,
            max: 100,
          })}`,
          weight: faker.number.float({ min: 0.1, max: 50 }),
          price: faker.number.float({ min: 1, max: 1000 }),
          description: faker.commerce.productDescription(),
          imageId: faker.helpers.arrayElement(media).id,
          goodsUrl: faker.internet.url(),
          isVerified: faker.datatype.boolean(),
          categoryId: faker.helpers.arrayElement(categories).id,
        },
      });
    })
  );

  // Create Requests
  const requests = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.request.create({
        data: {
          userId: faker.helpers.arrayElement(users).id,
          goodsId: faker.helpers.arrayElement(goods).id,
          quantity: faker.number.int({ min: 1, max: 5 }),
          goodsLocation: faker.location.city(),
          goodsDestination: faker.location.city(),
          date: faker.date.recent(),
          status: faker.helpers.arrayElement([
            "PENDING",
            "ACCEPTED",
            "CANCELLED",
            "REJECTED",
          ]),
        },
      });
    })
  );

  // Create Orders
  const orders = await Promise.all(
    requests.map(async (request) => {
      return prisma.order.create({
        data: {
          requestId: request.id,
          travelerId: faker.helpers.arrayElement(users).id,
          departureDate: faker.date.soon(),
          arrivalDate: faker.date.future(),
          trackingNumber: faker.string.alphanumeric(10),
          totalAmount: faker.number.float({ min: 10, max: 500 }),
          paymentStatus: faker.helpers.arrayElement([
            "ON_HOLD",
            "PAYED",
            "REFUNDED",
          ]),
          orderStatus: faker.helpers.arrayElement([
            "PENDING",
            "IN_TRANSIT",
            "DELIVERED",
          ]),
        },
      });
    })
  );

  // Create Payments
  const payments = await Promise.all(
    orders.map(async (order) => {
      return prisma.payment.create({
        data: {
          orderId: order.id,
          amount:
            order.totalAmount || faker.number.float({ min: 10, max: 500 }),
          currency: faker.helpers.arrayElement(["DOLLAR", "EURO", "TND"]),
          status: faker.helpers.arrayElement([
            "PENDING",
            "COMPLETED",
            "REFUND",
            "FAILED",
            "PROCCESSING",
          ]),
          paymentMethod: faker.helpers.arrayElement([
            "CREDITCARD",
            "STRIPE",
            "PAYPAL",
            "BANKTRANSFER",
          ]),
          transactionId: faker.string.uuid(),
        },
      });
    })
  );

  // Create Pickups
  const pickups = await Promise.all(
    orders.map(async (order) => {
      return prisma.pickup.create({
        data: {
          orderId: order.id,
          pickupType: faker.helpers.arrayElement([
            "AIRPORT",
            "IN_PERSON",
            "PICKUPPOINT",
            "DELIVERY",
          ]),
          location: faker.location.city(),
          address: faker.location.streetAddress(),
          coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
          contactPhoneNumber: faker.phone.number(),
          status: faker.helpers.arrayElement([
            "SCHEDULED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
            "DELAYED",
            "DELIVERED",
          ]),
          scheduledTime: faker.date.soon(),
        },
      });
    })
  );

  // Create Notifications
  const notifications = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      return prisma.notification.create({
        data: {
          userId: faker.helpers.arrayElement(users).id,
          type: faker.helpers.arrayElement([
            "REQUEST",
            "ACCEPTED",
            "REJECTED",
            "ORDER_CREATED",
            "PAYMENT_SUCCESS",
            "PAYMENT_FAILED",
            "PICKUP_SCHEDULE",
            "DELIVERY_COMPLETED",
            "SYSTEM_ALERT",
          ]),
          title: faker.lorem.sentence(5),
          message: faker.lorem.paragraph(1),
          status: faker.helpers.arrayElement(["READ", "UNREAD"]),
          requestId: faker.helpers.maybe(
            () => faker.helpers.arrayElement(requests).id,
            { probability: 0.5 }
          ),
          orderId: faker.helpers.maybe(
            () => faker.helpers.arrayElement(orders).id,
            { probability: 0.5 }
          ),
          pickupId: faker.helpers.maybe(
            () => faker.helpers.arrayElement(pickups).id,
            { probability: 0.5 }
          ),
        },
      });
    })
  );

  // Create Reviews
  const reviews = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.review.create({
        data: {
          reviewerId: faker.helpers.arrayElement(users).id,
          reviewedId: faker.helpers.arrayElement(users).id,
          orderId: faker.helpers.arrayElement(orders).id,
          rating: faker.number.int({ min: 1, max: 5 }),
          title: faker.lorem.sentence(3),
          comment: faker.lorem.paragraph(1),
          reviewType: faker.helpers.arrayElement([
            "USER_REVIEW",
            "EXPERIENCE_REVIEW",
            "DELIVERYMAN_REVIEW",
            "PICKUPPOINT_REVIEW",
          ]),
          status: faker.helpers.arrayElement([
            "PENDING",
            "APPROVED",
            "REJECTED",
            "EDITED",
          ]),
        },
      });
    })
  );

  // Create Service Providers
  const serviceProviders = await Promise.all(
    users.slice(0, 5).map(async (user) => {
      return prisma.serviceProvider.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(["SPONSOR", "SUBSCRIBER"]),
          isVerified: faker.datatype.boolean(),
          badge: faker.datatype.boolean()
            ? faker.string.alphanumeric(8)
            : undefined,
          idCard: faker.datatype.boolean()
            ? faker.number.int({ min: 100000000, max: 999999999 }).toString()
            : undefined,
          passport: faker.datatype.boolean()
            ? faker.string.alphanumeric(10)
            : undefined,
          license: faker.datatype.boolean()
            ? faker.number.int({ min: 1000000000, max: 9999999999 }).toString()
            : undefined,
          creditCard: faker.datatype.boolean()
            ? faker.finance.creditCardNumber().slice(-4)
            : undefined,
          subscriptionLevel: faker.helpers.arrayElement(["BASIC", "PREMIUM"]),
        },
      });
    })
  );

  // Create Subscriptions
  const subscriptions = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.subscription.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          price: faker.number.float({ min: 5, max: 50 }),
          duration: faker.number.int({ min: 30, max: 365 }),
          type: faker.helpers.arrayElement([
            "STREAMING",
            "SOFTWARE",
            "GAMING",
            "EDUCATION",
            "OTHER",
          ]),
          categoryId: faker.helpers.arrayElement(categories).id,
          users: { connect: [{ id: faker.helpers.arrayElement(users).id }] },
        },
      });
    })
  );

  // Create Sponsorships
  const sponsorships = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      const sponsor = faker.helpers.arrayElement(serviceProviders);
      const recipient = faker.helpers.arrayElement(users);
      const category = faker.helpers.arrayElement(categories);

      return prisma.sponsorship.create({
        data: {
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          price: faker.number.float({ min: 100, max: 1000 }),
          duration: faker.number.int({ min: 30, max: 365 }),
          platform: faker.helpers.arrayElement([
            "FACEBOOK",
            "INSTAGRAM",
            "YOUTUBE",
            "TWITTER",
            "TIKTOK",
            "OTHER",
          ]),
          product: faker.commerce.productName(),
          amount: faker.number.float({ min: 100, max: 1000 }),
          category: { connect: { id: category.id } },
          sponsor: { connect: { id: sponsor.id } },
          recipient: { connect: { id: recipient.id } },
        },
      });
    })
  );

  // Create Chats
  const chats = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.chat.create({
        data: {
          requesterId: faker.helpers.arrayElement(users).id,
          providerId: faker.helpers.arrayElement(users).id,
          productId: faker.helpers.arrayElement(goods).id,
        },
      });
    })
  );

  // Create Messages
  const messages = await Promise.all(
    Array.from({ length: 20 }).map(async () => {
      const chat = faker.helpers.arrayElement(chats);
      const isRequester = faker.datatype.boolean();
      const senderId = isRequester ? chat.requesterId : chat.providerId;
      const receiverId = isRequester ? chat.providerId : chat.requesterId;

      return prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: senderId,
          receiverId: receiverId,
          type: "text",
          content: faker.lorem.sentence(),
          mediaId: faker.helpers.maybe(
            () => faker.helpers.arrayElement(media).id,
            { probability: 0.3 }
          ),
          isRead: faker.datatype.boolean(),
        },
      });
    })
  );

  // Create Goods Processes
  const goodsProcesses = await Promise.all(
    orders.map(async (order) => {
      return prisma.goodsProcess.create({
        data: {
          orderId: order.id,
          status: faker.helpers.arrayElement([
            "INITIALIZED",
            "CONFIRMED",
            "PAID",
            "IN_TRANSIT",
            "PICKUP_MEET",
            "FINALIZED",
          ]),
        },
      });
    })
  );

  // Create Process Events
  const processEvents = await Promise.all(
    goodsProcesses.map(async (process) => {
      return prisma.processEvent.create({
        data: {
          goodsProcessId: process.id,
          fromStatus: "INITIALIZED",
          toStatus: process.status,
          changedByUserId: faker.helpers.arrayElement(users).id,
          note: faker.lorem.sentence(),
        },
      });
    })
  );

  // Create Reputations
  const reputations = await Promise.all(
    users.map(async (user) => {
      return prisma.reputation.create({
        data: {
          userId: user.id,
          score: faker.number.float({ min: 0, max: 100 }),
          totalRatings: faker.number.int({ min: 0, max: 50 }),
          positiveRatings: faker.number.int({ min: 0, max: 40 }),
          negativeRatings: faker.number.int({ min: 0, max: 10 }),
          level: faker.number.int({ min: 1, max: 5 }),
        },
      });
    })
  );

  // Create Reputation Transactions
  const reputationTransactions = await Promise.all(
    reputations.map(async (rep) => {
      return prisma.reputationTransaction.create({
        data: {
          reputationId: rep.id,
          change: faker.number.float({ min: -10, max: 10 }),
          eventType: faker.helpers.arrayElement(["REVIEW", "FEEDBACK"]),
          comment: faker.lorem.sentence(),
        },
      });
    })
  );

  // Create Goods Posts
  const goodsPosts = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.goodsPost.create({
        data: {
          title: faker.lorem.sentence(3),
          content: faker.lorem.paragraph(1),
          travelerId: faker.helpers.arrayElement(users).id,
          arrivalDate: faker.date.future(),
          availableKg: faker.number.float({ min: 1, max: 50 }),
          phoneNumber: faker.phone.number(),
          airportLocation: faker.location.city(),
          categoryId: faker.helpers.arrayElement(categories).id,
          isPublished: faker.datatype.boolean(),
        },
      });
    })
  );

  // Create Promo Posts
  const promoPosts = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      return prisma.promoPost.create({
        data: {
          title: faker.lorem.sentence(3),
          content: faker.lorem.paragraph(1).substring(0, 255),
          publisherId: faker.helpers.arrayElement(users).id,
          categoryId: faker.helpers.arrayElement(categories).id,
          isPublished: faker.datatype.boolean(),
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