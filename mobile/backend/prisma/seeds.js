const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file with DATABASE_URL...');
  fs.writeFileSync(
    envPath,
    'DATABASE_URL="mysql://root:root@localhost:3306/your_database_name"'
  );
  console.log('.env file created. Please edit it with your actual database credentials.');
  process.exit(1);
}

const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const {
  Country,
  Gender,
  ReferralSource,
  RequestStatus,
  OrderStatus,
  PaymentStatus,
  PaymentCurrency,
  PaymentState,
  PaymentMethod,
  PickupType,
  PickupStatus,
  NotificationType,
  NotificationStatus,
  ReviewType,
  ReviewStatus,
  SubscriptionType,
  SponsorshipPlatform,
  ServiceProviderType,
  FileExtension,
  MediaType,
  ProcessStatus,
  Role,
  TicketStatus,
} = require("@prisma/client");

const prisma = new PrismaClient({
  log: ['error'],
});

async function seed() {
  try {
    console.log('Cleaning existing data...');

    const tables = [
      'reputationTransaction',
      'reputation',
      'processEvent',
      'goodsProcess',
      'message',
      'chat',
      'reviewSponsor',
      'sponsorCheckout',
      'promoPost',
      'goodsPost',
      'pickupSuggestion',
      'notification',
      'review',
      'payment',
      'pickup',
      'order',
      'request',
      'ticket',
      'sponsorship',
      'subscription',
      'goods',
      'category',
      'serviceProvider',
      'profile',
      'traveler',
      'media',
      'user'
    ];

    for (const table of tables) {
      try {
        console.log(`Deleting from ${table}...`);
        await prisma[table].deleteMany({});
      } catch (e) {
        if (e.code === 'P2021') {
          console.log(`Table ${table} doesn't exist, skipping.`);
        } else {
          console.error(`Error deleting from ${table}:`, e);
        }
      }
    }

    console.log('Database cleaned. Starting to seed...');

    // Create Users
    const users = await Promise.all(
      Array.from({ length: 10 }).map(() =>
        prisma.user.create({
          data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phoneNumber: faker.phone.number(),
            googleId: faker.datatype.boolean() ? faker.string.alphanumeric(21) : undefined,
            password: faker.datatype.boolean() ? faker.internet.password() : undefined,
            hasCompletedOnboarding: faker.datatype.boolean(),
            role: faker.helpers.enumValue(Role),
          },
        })
      )
    );
    console.log('Created users');

    // Create Media
    const media = await Promise.all(
      Array.from({ length: 20 }).map(() =>
        prisma.media.create({
          data: {
            url: faker.image.url(),
            type: faker.helpers.enumValue(MediaType),
            mimeType: faker.system.mimeType(),
            extension: faker.helpers.enumValue(FileExtension),
            filename: faker.system.fileName(),
            size: faker.number.float({ min: 1, max: 1000 }),
            width: faker.number.int({ min: 100, max: 1920 }),
            height: faker.number.int({ min: 100, max: 1080 }),
            duration: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 300 }) : undefined,
          },
        })
      )
    );
    console.log('Created media');

    // Create Categories
    const categories = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.category.create({
          data: {
            name: faker.commerce.department(),
            description: faker.lorem.sentence(),
            isDisabled: faker.datatype.boolean(),
          },
        })
      )
    );
    console.log('Created categories');

    // Create Travelers
    const travelers = await Promise.all(
      users.slice(0, 5).map((user) =>
        prisma.traveler.create({
          data: {
            userId: user.id,
            idCard: faker.number.int({ min: 100000000, max: 999999999 }).toString(),
            bankCard: faker.finance.creditCardNumber(),
            isVerified: faker.datatype.boolean(),
          },
        })
      )
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
            country: faker.helpers.enumValue(Country),
            phoneNumber: faker.phone.number(),
            gender: faker.helpers.enumValue(Gender),
            isAnonymous: faker.datatype.boolean(),
            isBanned: faker.datatype.boolean(),
            isVerified: faker.datatype.boolean(),
            isOnline: faker.datatype.boolean(),
            isSponsor: faker.datatype.boolean(),
            referralSource: faker.helpers.enumValue(ReferralSource),
          },
        })
      )
    );

    // Create Service Providers
    const serviceProviders = await Promise.all(
      users.slice(0, 5).map((user) =>
        prisma.serviceProvider.create({
          data: {
            userId: user.id,
            type: faker.helpers.enumValue(ServiceProviderType),
            isVerified: faker.datatype.boolean(),
            badge: faker.datatype.boolean() ? faker.string.alphanumeric(8) : undefined,
            idCard: faker.datatype.boolean() ? faker.number.int({ min: 100000000, max: 999999999 }).toString() : undefined,
            passport: faker.datatype.boolean() ? faker.string.alphanumeric(10) : undefined,
            license: faker.datatype.boolean() ? faker.number.int({ min: 1000000000, max: 9999999999 }).toString() : undefined,
            creditCard: faker.datatype.boolean() ? faker.finance.creditCardNumber().slice(-4) : undefined,
            subscriptionLevel: faker.helpers.arrayElement(["BASIC", "PREMIUM", "PRO"]),
          },
        })
      )
    );

    // Create Sponsorships
    const sponsorships = await Promise.all(
      Array.from({ length: 5 }).map(() => {
        const sponsor = faker.helpers.arrayElement(serviceProviders);
        const category = faker.helpers.arrayElement(categories);
        const creator = faker.helpers.arrayElement(users);

        return prisma.sponsorship.create({
          data: {
            description: faker.lorem.sentence(),
            price: faker.number.float({ min: 100, max: 1000 }),
            duration: faker.number.int({ min: 30, max: 365 }),
            platform: faker.helpers.enumValue(SponsorshipPlatform),
            category: { connect: { id: category.id } },
            sponsor: { connect: { id: sponsor.id } },
            status: faker.helpers.arrayElement(["pending", "active", "completed"]),
            User: { connect: { id: creator.id } },
          },
        });
      })
    );

    // Create SponsorCheckouts
    const sponsorCheckouts = await Promise.all(
      sponsorships.map((sponsorship) =>
        prisma.sponsorCheckout.create({
          data: {
            buyerId: faker.helpers.arrayElement(users).id,
            cardNumber: faker.finance.creditCardNumber(),
            cardExpiryMm: faker.date.month({ format: "MM" }),
            cardExpiryYyyy: faker.date.future().getFullYear().toString(),
            cardCvc: faker.finance.creditCardCVV(),
            cardholderName: faker.person.fullName(),
            postalCode: faker.location.zipCode(),
            amount: sponsorship.price,
            qrCode: faker.datatype.boolean() ? faker.string.alphanumeric(10) : undefined,
            paymentUrl: faker.datatype.boolean() ? faker.internet.url() : undefined,
            currency: faker.helpers.enumValue(PaymentCurrency),
            status: faker.helpers.enumValue(PaymentState),
            paymentMethod: faker.helpers.enumValue(PaymentMethod),
            transactionId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
            sponsorship: { connect: { id: sponsorship.id } },
          },
        })
      )
    );

    // Create ReviewSponsors
    const reviewSponsors = await Promise.all(
      profiles.map((reviewerProfile) => {
        const reviewedProfile = faker.helpers.arrayElement(profiles.filter((p) => p.userId !== reviewerProfile.userId));
        const sponsorship = faker.helpers.arrayElement(sponsorships);
        const serviceProvider = faker.helpers.arrayElement(serviceProviders);

        return prisma.reviewSponsor.create({
          data: {
            reviewer: { connect: { id: reviewerProfile.id } },
            reviewed_user: { connect: { id: reviewedProfile.id } },
            sponsorshipRating: faker.number.int({ min: 1, max: 5 }),
            serviceProviderRating: faker.number.int({ min: 1, max: 5 }),
            Sponsorship: { connect: { id: sponsorship.id } },
            serviceProvider: { connect: { id: serviceProvider.id } },
            comment: faker.lorem.sentence(),
          },
        });
      })
    );

    // Create Goods - Fixed to make image optional
    const goods = await Promise.all(
      Array.from({ length: 15 }).map(() =>
        prisma.goods.create({
          data: {
            name: faker.commerce.productName(),
            size: `${faker.number.int({ min: 1, max: 100 })}x${faker.number.int({ min: 1, max: 100 })}`,
            weight: faker.number.float({ min: 0.1, max: 50 }),
            price: faker.number.float({ min: 1, max: 1000 }),
            description: faker.commerce.productDescription(),
            image: faker.datatype.boolean() ? { connect: { id: faker.helpers.arrayElement(media).id } } : undefined, // Made optional
            goodsUrl: faker.datatype.boolean() ? faker.internet.url() : undefined,
            isVerified: faker.datatype.boolean(),
            category: { connect: { id: faker.helpers.arrayElement(categories).id } },
          },
        })
      )
    );
    console.log('Created goods');

    // Create Requests
    const requests = await Promise.all(
      Array.from({ length: 10 }).map(() =>
        prisma.request.create({
          data: {
            user: { connect: { id: faker.helpers.arrayElement(users).id } },
            goods: { connect: { id: faker.helpers.arrayElement(goods).id } },
            quantity: faker.number.int({ min: 1, max: 5 }),
            goodsLocation: faker.location.city(),
            goodsDestination: faker.location.city(),
            date: faker.date.recent(),
            status: faker.helpers.enumValue(RequestStatus),
            withBox: faker.datatype.boolean(),
          },
        })
      )
    );
    console.log('Created requests');

    // Create Orders - Ensure unique request mapping
    const orders = await Promise.all(
      requests.map((request) =>
        prisma.order.create({
          data: {
            request: { connect: { id: request.id } },
            traveler: { connect: { id: faker.helpers.arrayElement(users).id } },
            departureDate: faker.date.soon(),
            arrivalDate: faker.date.future(),
            trackingNumber: faker.string.alphanumeric(10),
            totalAmount: faker.number.float({ min: 10, max: 500 }),
            paymentStatus: faker.helpers.enumValue(PaymentStatus),
            orderStatus: faker.helpers.enumValue(OrderStatus),
            verificationImage: faker.datatype.boolean() ? { connect: { id: faker.helpers.arrayElement(media).id } } : undefined,
          },
        })
      )
    );
    console.log('Created orders');

    // Create Payments
    const payments = await Promise.all(
      orders.map((order) =>
        prisma.payment.create({
          data: {
            order: { connect: { id: order.id } },
            amount: order.totalAmount || faker.number.float({ min: 10, max: 500 }),
            currency: faker.helpers.enumValue(PaymentCurrency),
            status: faker.helpers.enumValue(PaymentState),
            paymentMethod: faker.helpers.enumValue(PaymentMethod),
            transactionId: faker.datatype.boolean() ? faker.string.uuid() : undefined,
            qrCode: faker.datatype.boolean() ? faker.string.alphanumeric(10) : undefined,
            paymentUrl: faker.datatype.boolean() ? faker.internet.url() : undefined,
          },
        })
      )
    );

    // Create Pickups - Ensure unique order mapping
    const pickups = await Promise.all(
      orders.map((order) =>
        prisma.pickup.create({
          data: {
            order: { connect: { id: order.id } },
            pickupType: faker.helpers.enumValue(PickupType),
            location: faker.location.city(),
            address: faker.location.streetAddress(),
            qrCode: faker.datatype.boolean() ? faker.string.alphanumeric(10) : undefined,
            coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
            contactPhoneNumber: faker.phone.number(),
            travelerconfirmed: faker.datatype.boolean(),
            userconfirmed: faker.datatype.boolean(),
            status: faker.helpers.enumValue(PickupStatus),
            scheduledTime: faker.date.soon(),
          },
        })
      )
    );
    console.log('Created pickups');

    // Update Requests with Pickups
    await Promise.all(
      requests.map((request, index) =>
        prisma.request.update({
          where: { id: request.id },
          data: {
            pickup: { connect: { id: pickups[index].id } },
          },
        })
      )
    );
    console.log('Updated requests with pickups');

    // Create Pickup Suggestions
    const pickupSuggestions = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.pickupSuggestion.create({
          data: {
            pickup: { connect: { id: faker.helpers.arrayElement(pickups).id } },
            orderId: faker.helpers.arrayElement(orders).id,
            user: { connect: { id: faker.helpers.arrayElement(users).id } },
            pickupType: faker.helpers.enumValue(PickupType),
            location: faker.location.city(),
            address: faker.location.streetAddress(),
            qrCode: faker.datatype.boolean() ? farke.string.alphanumeric(10) : undefined,
            coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
            contactPhoneNumber: faker.phone.number(),
            scheduledTime: faker.date.soon(),
          },
        })
      )
    );

    // Create Reviews
  

    // Create Subscriptions
    const subscriptions = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.subscription.create({
          data: {
            name: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            price: faker.number.float({ min: 5, max: 50 }),
            duration: faker.number.int({ min: 30, max: 365 }),
            type: faker.helpers.enumValue(SubscriptionType),
            category: { connect: { id: faker.helpers.arrayElement(categories).id } },
            users: { connect: [{ id: faker.helpers.arrayElement(users).id }] },
            isActive: faker.datatype.boolean(),
          },
        })
      )
    );

    // Create Chats


    // Create Tickets
    const tickets = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.ticket.create({
          data: {
            title: faker.lorem.sentence(3),
            description: faker.lorem.paragraph(1),
            user: { connect: { id: faker.helpers.arrayElement(users).id } },
            status: faker.helpers.enumValue(TicketStatus),
          },
        })
      )
    );

  

    // Create Goods Processes
    const goodsProcesses = await Promise.all(
      orders.map((order) =>
        prisma.goodsProcess.create({
          data: {
            order: { connect: { id: order.id } },
            status: faker.helpers.enumValue(ProcessStatus),
          },
        })
      )
    );

    // Create Process Events


    // Create Reputations
  

    // Create Reputation Transactions


    // Create Goods Posts
    const goodsPosts = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.goodsPost.create({
          data: {
            title: faker.lorem.sentence(3),
            content: faker.lorem.paragraph(1),
            traveler: { connect: { id: faker.helpers.arrayElement(users).id } },
            arrivalDate: faker.date.future(),
            availableKg: faker.number.float({ min: 1, max: 50 }),
            phoneNumber: faker.phone.number(),
            airportLocation: faker.location.city(),
            category: { connect: { id: faker.helpers.arrayElement(categories).id } },
            isPublished: faker.datatype.boolean(),
          },
        })
      )
    );

    // Create Promo Posts
    const promoPosts = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.promoPost.create({
          data: {
            title: faker.lorem.sentence(3),
            content: faker.lorem.paragraph(1).substring(0, 255),
            publisher: { connect: { id: faker.helpers.arrayElement(users).id } },
            category: { connect: { id: faker.helpers.arrayElement(categories).id } },
            isPublished: faker.datatype.boolean(),
          },
        })
      )
    );

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error in seed function:", error);
    throw error;
  }
}

async function main() {
  try {
    console.log("Starting database seeding...");
    await seed();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();