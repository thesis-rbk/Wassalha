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

const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

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
      'orderSponsor',
      'promoPost',
      'goodsPost',
      'pickupSuggestion',
      'notification',
      'review',
      'payment',
      'pickup',
      'order',
      'request',
      'ticketMessage',
      'ticket',
      'sponsorship',
      'subscription',
      'goods',
      'category',
      'serviceProvider',
      'profile',
      'traveler',
      'media',
      'user',
      'codeSubmission',
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
        prisma.User.create({
          data: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            phoneNumber: faker.phone.number(),
            googleId: faker.datatype.boolean() ? faker.string.alphanumeric(21) : null,
            password: faker.datatype.boolean() ? faker.internet.password() : null,
            hasCompletedOnboarding: faker.datatype.boolean(),
            role: faker.helpers.arrayElement(['USER', 'ADMIN', 'SUPER_ADMIN']),
            resetToken: faker.datatype.boolean() ? faker.string.uuid() : null,
            resetTokenExpiry: faker.datatype.boolean() ? faker.date.future() : null,
          },
        })
      )
    );
    console.log('Created users');
    const imageUrls = [
      // Photos of people (reel)
      'https://images.pexels.com/photos/1239292/pexels-photo-1239292.jpeg',
      'https://images.pexels.com/photos/1492578/pexels-photo-1492578.jpeg',
      'https://images.pexels.com/photos/1461748/pexels-photo-1461748.jpeg',
      'https://images.pexels.com/photos/3073992/pexels-photo-3073992.jpeg',
      'https://images.pexels.com/photos/1704122/pexels-photo-1704122.jpeg',
      'https://images.pexels.com/photos/2166797/pexels-photo-2166797.jpeg',
      'https://images.pexels.com/photos/1422096/pexels-photo-1422096.jpeg',
      'https://images.pexels.com/photos/1463592/pexels-photo-1463592.jpeg',
      'https://images.pexels.com/photos/3182782/pexels-photo-3182782.jpeg',
      'https://images.pexels.com/photos/3807506/pexels-photo-3807506.jpeg',
      'https://images.pexels.com/photos/1246952/pexels-photo-1246952.jpeg',
      'https://images.pexels.com/photos/1742387/pexels-photo-1742387.jpeg',
      'https://images.pexels.com/photos/3231479/pexels-photo-3231479.jpeg',
      'https://images.pexels.com/photos/3771896/pexels-photo-3771896.jpeg',
      'https://images.pexels.com/photos/2725245/pexels-photo-2725245.jpeg',
      'https://images.pexels.com/photos/2504350/pexels-photo-2504350.jpeg',
      'https://images.pexels.com/photos/1883807/pexels-photo-1883807.jpeg',
      'https://images.pexels.com/photos/1711776/pexels-photo-1711776.jpeg',
      'https://images.pexels.com/photos/2105703/pexels-photo-2105703.jpeg',
      'https://images.pexels.com/photos/1583330/pexels-photo-1583330.jpeg',

      // Product photos
      'https://images.pexels.com/photos/1267317/pexels-photo-1267317.jpeg',
      'https://images.pexels.com/photos/1404561/pexels-photo-1404561.jpeg',
      'https://images.pexels.com/photos/1704121/pexels-photo-1704121.jpeg',
      'https://images.pexels.com/photos/1587620/pexels-photo-1587620.jpeg',
      'https://images.pexels.com/photos/3026802/pexels-photo-3026802.jpeg',
      'https://images.pexels.com/photos/1195990/pexels-photo-1195990.jpeg',
      'https://images.pexels.com/photos/1797413/pexels-photo-1797413.jpeg',
      'https://images.pexels.com/photos/2201398/pexels-photo-2201398.jpeg',
      'https://images.pexels.com/photos/4075712/pexels-photo-4075712.jpeg',
      'https://images.pexels.com/photos/1531537/pexels-photo-1531537.jpeg',
      'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
      'https://images.pexels.com/photos/2265475/pexels-photo-2265475.jpeg',
      'https://images.pexels.com/photos/1704123/pexels-photo-1704123.jpeg',
      'https://images.pexels.com/photos/3300162/pexels-photo-3300162.jpeg',
      'https://images.pexels.com/photos/2912967/pexels-photo-2912967.jpeg',
      'https://images.pexels.com/photos/1151681/pexels-photo-1151681.jpeg',
      'https://images.pexels.com/photos/3585595/pexels-photo-3585595.jpeg',
      'https://images.pexels.com/photos/1193070/pexels-photo-1193070.jpeg',
      'https://images.pexels.com/photos/1704106/pexels-photo-1704106.jpeg',
      'https://images.pexels.com/photos/2977554/pexels-photo-2977554.jpeg',
      'https://images.pexels.com/photos/1679604/pexels-photo-1679604.jpeg',

      // People (Profiles)
      'https://images.pexels.com/photos/1901144/pexels-photo-1901144.jpeg',
      'https://images.pexels.com/photos/3455337/pexels-photo-3455337.jpeg',
      'https://images.pexels.com/photos/2016807/pexels-photo-2016807.jpeg',
      'https://images.pexels.com/photos/2042494/pexels-photo-2042494.jpeg',
      'https://images.pexels.com/photos/2657245/pexels-photo-2657245.jpeg',
      'https://images.pexels.com/photos/1751555/pexels-photo-1751555.jpeg',
      'https://images.pexels.com/photos/3144689/pexels-photo-3144689.jpeg',
      'https://images.pexels.com/photos/2362534/pexels-photo-2362534.jpeg',
      'https://images.pexels.com/photos/3727433/pexels-photo-3727433.jpeg',
      'https://images.pexels.com/photos/1532358/pexels-photo-1532358.jpeg',
      'https://images.pexels.com/photos/2816133/pexels-photo-2816133.jpeg',
      'https://images.pexels.com/photos/1744025/pexels-photo-1744025.jpeg',
      'https://images.pexels.com/photos/1298600/pexels-photo-1298600.jpeg',
      'https://images.pexels.com/photos/1793611/pexels-photo-1793611.jpeg',
      'https://images.pexels.com/photos/3795063/pexels-photo-3795063.jpeg',
      'https://images.pexels.com/photos/2846216/pexels-photo-2846216.jpeg',
      'https://images.pexels.com/photos/1555611/pexels-photo-1555611.jpeg',
      'https://images.pexels.com/photos/1663746/pexels-photo-1663746.jpeg',
      'https://images.pexels.com/photos/3775829/pexels-photo-3775829.jpeg',
      'https://images.pexels.com/photos/3442195/pexels-photo-3442195.jpeg',

      // Product photos
      'https://images.pexels.com/photos/2825301/pexels-photo-2825301.jpeg',
      'https://images.pexels.com/photos/1053290/pexels-photo-1053290.jpeg',
      'https://images.pexels.com/photos/2061216/pexels-photo-2061216.jpeg',
      'https://images.pexels.com/photos/1173239/pexels-photo-1173239.jpeg',
      'https://images.pexels.com/photos/2995741/pexels-photo-2995741.jpeg',
      'https://images.pexels.com/photos/3152496/pexels-photo-3152496.jpeg',
      'https://images.pexels.com/photos/2837435/pexels-photo-2837435.jpeg',
      'https://images.pexels.com/photos/1296671/pexels-photo-1296671.jpeg',
      'https://images.pexels.com/photos/1771789/pexels-photo-1771789.jpeg',
      'https://images.pexels.com/photos/3371293/pexels-photo-3371293.jpeg',
      'https://images.pexels.com/photos/2061775/pexels-photo-2061775.jpeg',
      'https://images.pexels.com/photos/2204091/pexels-photo-2204091.jpeg',
      'https://images.pexels.com/photos/1471530/pexels-photo-1471530.jpeg',
      'https://images.pexels.com/photos/3184437/pexels-photo-3184437.jpeg',
      'https://images.pexels.com/photos/3279744/pexels-photo-3279744.jpeg',
      'https://images.pexels.com/photos/1194734/pexels-photo-1194734.jpeg',
      'https://images.pexels.com/photos/1958595/pexels-photo-1958595.jpeg',
      'https://images.pexels.com/photos/1628229/pexels-photo-1628229.jpeg',
      'https://images.pexels.com/photos/3535062/pexels-photo-3535062.jpeg',

      // More Profile Photos
      'https://images.pexels.com/photos/2267417/pexels-photo-2267417.jpeg',
      'https://images.pexels.com/photos/2267412/pexels-photo-2267412.jpeg',
      'https://images.pexels.com/photos/2641561/pexels-photo-2641561.jpeg',
      'https://images.pexels.com/photos/2654159/pexels-photo-2654159.jpeg',
      'https://images.pexels.com/photos/2077582/pexels-photo-2077582.jpeg',
      'https://images.pexels.com/photos/2377709/pexels-photo-2377709.jpeg',
      'https://images.pexels.com/photos/1537150/pexels-photo-1537150.jpeg',
      'https://images.pexels.com/photos/1767666/pexels-photo-1767666.jpeg',
      'https://images.pexels.com/photos/3172882/pexels-photo-3172882.jpeg',
      'https://images.pexels.com/photos/2873131/pexels-photo-2873131.jpeg',
      'https://images.pexels.com/photos/3408745/pexels-photo-3408745.jpeg',
      'https://images.pexels.com/photos/3106172/pexels-photo-3106172.jpeg',
      'https://images.pexels.com/photos/2111154/pexels-photo-2111154.jpeg',
      'https://images.pexels.com/photos/3660439/pexels-photo-3660439.jpeg',
      'https://images.pexels.com/photos/2960481/pexels-photo-2960481.jpeg',
      'https://images.pexels.com/photos/1180997/pexels-photo-1180997.jpeg',
      'https://images.pexels.com/photos/1437984/pexels-photo-1437984.jpeg',
      'https://images.pexels.com/photos/2687417/pexels-photo-2687417.jpeg',
      'https://images.pexels.com/photos/2633535/pexels-photo-2633535.jpeg',
      'https://images.pexels.com/photos/1597401/pexels-photo-1597401.jpeg'
    ];
    // Create Media
    const media = await Promise.all(
      Array.from({ length: 20 }).map(() =>
        prisma.media.create({
          data: {
            url: faker.image.url(imageUrls),
            type: faker.helpers.arrayElement(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER']),
            mimeType: faker.system.mimeType(),
            extension: faker.helpers.arrayElement([
              'JPG', 'JPEG', 'PNG', 'GIF', 'SVG', 'PDF', 'DOC', 'DOCX', 'XLS', 'XLSX',
              'MP4', 'MOV', 'AVI', 'MP3', 'WAV', 'OTHER',
            ]),
            filename: faker.system.fileName(),
            size: faker.number.float({ min: 1, max: 1000 }),
            width: faker.number.int({ min: 100, max: 1920 }),
            height: faker.number.int({ min: 100, max: 1080 }),
            duration: faker.datatype.boolean() ? faker.number.int({ min: 1, max: 300 }) : null,
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
    console.log('Created travelers');
    const usedImageIds = new Set();  // Keeps track of the used imageIds to prevent duplicates

    const profiles = await Promise.all(
      users.map((user) =>
        prisma.profile.create({
          data: {
            userId: user.id,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            bio: faker.lorem.sentence(),
            country: faker.helpers.arrayElement([
              'USA', 'CANADA', 'UK', 'AUSTRALIA', 'GERMANY', 'FRANCE', 'INDIA', 'JAPAN',
              'TUNISIA', 'MOROCCO', 'ALGERIA', 'TURKEY', 'SPAIN', 'ITALY', 'PORTUGAL',
              'NETHERLANDS', 'BELGIUM', 'SWEDEN', 'NORWAY', 'DENMARK', 'FINLAND', 'ICELAND',
              'AUSTRIA', 'SWITZERLAND', 'BELARUS', 'RUSSIA', 'CHINA', 'BRAZIL', 'ARGENTINA',
              'CHILE', 'MEXICO', 'COLOMBIA', 'PERU', 'VENEZUELA', 'ECUADOR', 'PARAGUAY',
              'URUGUAY', 'BOLIVIA', 'OTHER',
            ]),
            phoneNumber: faker.phone.number(),
            imageId: faker.datatype.boolean()
              ? (() => {
                // Ensure unique imageId selection
                let imageId;
                do {
                  imageId = faker.helpers.arrayElement(media).id;
                } while (usedImageIds.has(imageId));  // Keep checking until unique
                usedImageIds.add(imageId);  // Mark the imageId as used
                return imageId;
              })()
              : null,
            gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
            isAnonymous: faker.datatype.boolean(),
            isBanned: faker.datatype.boolean(),
            isVerified: faker.datatype.boolean(),
            isOnline: faker.datatype.boolean(),
            isSponsor: faker.datatype.boolean(),
            preferredCategories: faker.datatype.boolean() ? faker.commerce.department() : null,
            referralSource: faker.helpers.arrayElement([
              'SOCIAL_MEDIA', 'FRIEND_RECOMMENDATION', 'APP_STORE', 'GOOGLE_SEARCH',
              'ADVERTISEMENT', 'OTHER',
            ]),
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
            type: faker.helpers.arrayElement(['PENDING_SPONSOR', 'SPONSOR', 'SUBSCRIBER']),
            isVerified: faker.datatype.boolean(),
            badge: faker.datatype.boolean() ? faker.string.alphanumeric(8) : null,
            idCard: faker.datatype.boolean() ? faker.number.int({ min: 100000000, max: 999999999 }).toString() : null,
            passport: faker.datatype.boolean() ? faker.string.alphanumeric(10) : null,
            license: faker.datatype.boolean() ? faker.number.int({ min: 1000000000, max: 9999999999 }).toString() : null,
            creditCard: faker.datatype.boolean() ? faker.finance.creditCardNumber().slice(-4) : null,
            selfie: faker.datatype.boolean() ? faker.image.url() : null,
            questionnaireAnswers: faker.datatype.boolean() ? { answers: faker.lorem.sentences(3) } : null,
            subscriptionLevel: faker.datatype.boolean() ? faker.helpers.arrayElement(['BASIC', 'PREMIUM', 'PRO']) : null,
          },
        })
      )
    );
    console.log('Created service providers');

    // Create Sponsorships
    const sponsorships = await Promise.all(
      Array.from({ length: 5 }).map(() => {
        const sponsor = faker.helpers.arrayElement(serviceProviders);
        const creator = faker.helpers.arrayElement(users);
        return prisma.sponsorship.create({
          data: {
            description: faker.lorem.sentence(),
            price: faker.number.float({ min: 100, max: 1000 }),
            duration: faker.number.int({ min: 30, max: 365 }),
            platform: faker.helpers.arrayElement(['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'TIKTOK', 'OTHER']),
            categoryId: faker.helpers.arrayElement(categories).id,
            sponsorId: sponsor.id,
            userId: creator.id,
            status: faker.helpers.arrayElement(['pending', 'active', 'completed']),
            isActive: faker.datatype.boolean(),
          },
        });
      })
    );
    console.log('Created sponsorships');

    // Create Sponsor Checkouts
    const sponsorCheckouts = await Promise.all(
      sponsorships.map((sponsorship) =>
        prisma.sponsorCheckout.create({
          data: {
            buyerId: faker.helpers.arrayElement(users).id,
            cardNumber: faker.finance.creditCardNumber(),
            cardExpiryMm: String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0'),
            cardExpiryYyyy: String(faker.date.future().getFullYear()),
            cardCvc: faker.finance.creditCardCVV(),
            cardholderName: faker.person.fullName(),
            amount: sponsorship.price,
            qrCode: faker.datatype.boolean() ? faker.string.alphanumeric(10) : null,
            paymentUrl: faker.datatype.boolean() ? faker.internet.url() : null,
            currency: faker.helpers.arrayElement(['USD', 'EUR', 'TND']),
            status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'REFUND', 'FAILED', 'PROCCESSING']),
            paymentMethod: faker.helpers.arrayElement(['CARD', 'D17', 'STRIPE', 'PAYPAL', 'BANKTRANSFER']),
            transactionId: faker.datatype.boolean() ? faker.string.uuid() : null,
            sponsorShipId: sponsorship.id,
          },
        })
      )
    );
    console.log('Created sponsor checkouts');

    // Create Order Sponsors
    const orderSponsors = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.orderSponsor.create({
          data: {
            serviceProviderId: faker.helpers.arrayElement(serviceProviders).id,
            sponsorshipId: faker.helpers.arrayElement(sponsorships).id,
            recipientId: faker.helpers.arrayElement(users).id,
            amount: faker.number.float({ min: 100, max: 1000 }),
            status: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'REJECTED', 'IN_TRANSIT', 'DELIVERED']),
          },
        })
      )
    );
    console.log('Created order sponsors');

    // Create Review Sponsors
    const reviewSponsors = await Promise.all(
      Array.from({ length: 5 }).map(() => {
        const reviewer = faker.helpers.arrayElement(profiles);
        const reviewed = faker.helpers.arrayElement(profiles.filter((p) => p.id !== reviewer.id));
        return prisma.reviewSponsor.create({
          data: {
            reviewer_id: reviewer.id,
            reviewed_user_id: reviewed.id,
            sponsorshipRating: faker.number.int({ min: 1, max: 5 }),
            serviceProviderRating: faker.number.int({ min: 1, max: 5 }),
            sponsorshipId: faker.helpers.arrayElement(sponsorships).id,
            serviceProviderId: faker.helpers.arrayElement(serviceProviders).id,
            comment: faker.lorem.sentence(),
          },
        });
      })
    );
    console.log('Created review sponsors');

    // Create Tickets
    const tickets = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.ticket.create({
          data: {
            title: faker.lorem.sentence(3),
            description: faker.lorem.paragraph(),
            userId: faker.helpers.arrayElement(users).id,
            status: faker.helpers.arrayElement(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
            category: faker.helpers.arrayElement([
              'REQUEST_ISSUE', 'OFFER_ISSUE', 'PAYMENT_ISSUE', 'PICKUP_ISSUE',
              'DELIVERY_ISSUE', 'TRAVELER_NON_COMPLIANCE', 'OTHER',
            ]),
            media: faker.datatype.boolean()
              ? { connect: [{ id: faker.helpers.arrayElement(media).id }] }
              : undefined,
          },
        })
      )
    );
    console.log('Created tickets');

    // Create Ticket Messages
    const ticketMessages = await Promise.all(
      tickets.flatMap((ticket) =>
        Array.from({ length: 3 }).map(() =>
          prisma.ticketMessage.create({
            data: {
              ticketId: ticket.id,
              senderId: faker.helpers.arrayElement(users).id,
              content: faker.lorem.paragraph(),
              isAdmin: faker.datatype.boolean(),
              media: faker.datatype.boolean()
                ? { connect: [{ id: faker.helpers.arrayElement(media).id }] }
                : undefined,
            },
          })
        )
      )
    );
    console.log('Created ticket messages');

    // Create Goods
    const goods = await Promise.all(
      Array.from({ length: 15 }).map(() =>
        prisma.goods.create({
          data: {
            name: faker.commerce.productName(),
            size: `${faker.number.int({ min: 1, max: 100 })}x${faker.number.int({ min: 1, max: 100 })}`,
            weight: faker.number.float({ min: 0.1, max: 50 }),
            price: faker.number.float({ min: 1, max: 1000 }),
            description: faker.commerce.productDescription(),
            imageId: faker.datatype.boolean() ? faker.helpers.arrayElement(media).id : null,
            goodsUrl: faker.datatype.boolean() ? faker.internet.url() : null,
            isVerified: faker.datatype.boolean(),
            categoryId: faker.helpers.arrayElement(categories).id,
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
            userId: faker.helpers.arrayElement(users).id,
            sponsorId: faker.datatype.boolean() ? faker.helpers.arrayElement(users).id : null,
            goodsId: faker.helpers.arrayElement(goods).id,
            quantity: faker.number.int({ min: 1, max: 5 }),
            goodsLocation: faker.location.city(),
            goodsDestination: faker.location.city(),
            date: faker.date.recent(),
            status: faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'CANCELLED', 'REJECTED']),
            withBox: faker.datatype.boolean(),
          },
        })
      )
    );
    console.log('Created requests');

    // Create Orders
    const orders = await Promise.all(
      requests.map((request) =>
        prisma.order.create({
          data: {
            requestId: request.id,
            travelerId: faker.helpers.arrayElement(users).id,
            departureDate: faker.date.soon(),
            arrivalDate: faker.date.future(),
            trackingNumber: faker.string.alphanumeric(10),
            totalAmount: faker.number.float({ min: 10, max: 500 }),
            paymentStatus: faker.helpers.arrayElement(['ON_HOLD', 'PAYED', 'REFUNDED']),
            orderStatus: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED']),
            verificationImageId: faker.datatype.boolean() ? faker.helpers.arrayElement(media).id : null,
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
            orderId: order.id,
            amount: order.totalAmount || faker.number.float({ min: 10, max: 500 }),
            currency: faker.helpers.arrayElement(['USD', 'EUR', 'TND']),
            status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'REFUND', 'FAILED', 'PROCCESSING']),
            paymentMethod: faker.helpers.arrayElement(['CARD', 'D17', 'STRIPE', 'PAYPAL', 'BANKTRANSFER']),
            transactionId: faker.datatype.boolean() ? faker.string.uuid() : null,
            qrCode: faker.datatype.boolean() ? faker.string.alphanumeric(10) : null,
            paymentUrl: faker.datatype.boolean() ? faker.internet.url() : null,
          },
        })
      )
    );
    console.log('Created payments');

    // Create Pickups
    const pickups = await Promise.all(
      orders.map((order) =>
        prisma.pickup.create({
          data: {
            orderId: order.id,
            pickupType: faker.helpers.arrayElement(['AIRPORT', 'IN_PERSON', 'PICKUPPOINT', 'DELIVERY']),
            location: faker.location.city(),
            address: faker.location.streetAddress(),
            qrCode: faker.datatype.boolean() ? faker.string.alphanumeric(10) : null,
            coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
            contactPhoneNumber: faker.phone.number(),
            travelerconfirmed: faker.datatype.boolean(),
            userconfirmed: faker.datatype.boolean(),
            status: faker.helpers.arrayElement(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED', 'DELIVERED']),
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
          data: { pickupId: pickups[index].id },
        })
      )
    );
    console.log('Updated requests with pickups');

    // Create Pickup Suggestions
    const pickupSuggestions = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.pickupSuggestion.create({
          data: {
            pickupId: faker.datatype.boolean() ? faker.helpers.arrayElement(pickups).id : null,
            orderId: faker.helpers.arrayElement(orders).id,
            userId: faker.helpers.arrayElement(users).id,
            pickupType: faker.helpers.arrayElement(['AIRPORT', 'IN_PERSON', 'PICKUPPOINT', 'DELIVERY']),
            location: faker.location.city(),
            address: faker.location.streetAddress(),
            qrCode: faker.datatype.boolean() ? faker.string.alphanumeric(10) : null,
            coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
            contactPhoneNumber: faker.phone.number(),
            scheduledTime: faker.date.soon(),
          },
        })
      )
    );
    console.log('Created pickup suggestions');

    // Create Notifications
    const notifications = await Promise.all(
      Array.from({ length: 10 }).map(() =>
        prisma.notification.create({
          data: {
            userId: faker.helpers.arrayElement(users).id,
            senderId: faker.datatype.boolean() ? faker.helpers.arrayElement(users).id : null,
            type: faker.helpers.arrayElement([
              'REQUEST', 'ACCEPTED', 'REJECTED', 'ORDER_CREATED', 'PAYMENT_INITIATED',
              'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PICKUP_SCHEDULE',
              'DELIVERY_COMPLETED', 'SYSTEM_ALERT',
            ]),
            title: faker.lorem.sentence(3),
            message: faker.lorem.paragraph(1),
            status: faker.helpers.arrayElement(['READ', 'UNREAD']),
            requestId: faker.datatype.boolean() ? faker.helpers.arrayElement(requests).id : null,
            orderId: faker.datatype.boolean() ? faker.helpers.arrayElement(orders).id : null,
            pickupId: faker.datatype.boolean() ? faker.helpers.arrayElement(pickups).id : null,
          },
        })
      )
    );
    console.log('Created notifications');

    // Create Reviews
    const reviews = await Promise.all(
      Array.from({ length: 10 }).map(() => {
        const reviewer = faker.helpers.arrayElement(users);
        const reviewed = faker.helpers.arrayElement(users.filter((u) => u.id !== reviewer.id));
        return prisma.review.create({
          data: {
            reviewerId: reviewer.id,
            reviewedId: reviewed.id,
            orderId: faker.datatype.boolean() ? faker.helpers.arrayElement(orders).id : null,
            rating: faker.number.int({ min: 1, max: 5 }),
            title: faker.lorem.sentence(3),
            comment: faker.lorem.paragraph(1),
            reviewType: faker.helpers.arrayElement(['USER_REVIEW', 'EXPERIENCE_REVIEW', 'DELIVERYMAN_REVIEW', 'PICKUPPOINT_REVIEW']),
            status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED', 'EDITED']),
          },
        });
      })
    );
    console.log('Created reviews');

    // Create Subscriptions
    const subscriptions = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.subscription.create({
          data: {
            name: faker.commerce.productName(),
            description: faker.lorem.sentence(),
            price: faker.number.float({ min: 5, max: 50 }),
            duration: faker.number.int({ min: 30, max: 365 }),
            type: faker.helpers.arrayElement(['STREAMING', 'SOFTWARE', 'GAMING', 'EDUCATION', 'OTHER']),
            categoryId: faker.helpers.arrayElement(categories).id,
            users: { connect: [{ id: faker.helpers.arrayElement(users).id }] },
            isActive: faker.datatype.boolean(),
          },
        })
      )
    );
    console.log('Created subscriptions');

    // Create Chats
    const chats = await Promise.all(
      Array.from({ length: 5 }).map(() => {
        const requester = faker.helpers.arrayElement(users);
        const provider = faker.helpers.arrayElement(users.filter((u) => u.id !== requester.id));
        return prisma.chat.create({
          data: {
            requesterId: requester.id,
            providerId: provider.id,
            productId: faker.helpers.arrayElement(goods).id,
          },
        });
      })
    );
    console.log('Created chats');

    // Create Messages
    const messages = await Promise.all(
      chats.flatMap((chat) =>
        Array.from({ length: 5 }).map(() => {
          const senderId = faker.helpers.arrayElement([chat.requesterId, chat.providerId]);
          const receiverId = senderId === chat.requesterId ? chat.providerId : chat.requesterId;
          return prisma.message.create({
            data: {
              chatId: chat.id,
              senderId: senderId,
              receiverId: receiverId,
              type: faker.helpers.arrayElement(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO']),
              content: faker.lorem.sentence(),
              mediaId: faker.datatype.boolean() ? faker.helpers.arrayElement(media).id : null,
              isRead: faker.datatype.boolean(),
              time: faker.date.recent(),
            },
          });
        })
      )
    );
    console.log('Created messages');

    // Create Goods Processes
    const goodsProcesses = await Promise.all(
      orders.map((order) =>
        prisma.goodsProcess.create({
          data: {
            orderId: order.id,
            status: faker.helpers.arrayElement([
              'PREINITIALIZED', 'INITIALIZED', 'CONFIRMED', 'PAID', 'IN_TRANSIT',
              'PICKUP_MEET', 'FINALIZED', 'CANCELLED',
            ]),
          },
        })
      )
    );
    console.log('Created goods processes');

    // Create Process Events
    const processEvents = await Promise.all(
      goodsProcesses.flatMap((process) =>
        Array.from({ length: 3 }).map(() => {
          const fromStatus = faker.helpers.arrayElement([
            'PREINITIALIZED', 'INITIALIZED', 'CONFIRMED', 'PAID', 'IN_TRANSIT',
            'PICKUP_MEET', 'FINALIZED', 'CANCELLED',
          ]);
          const toStatus = faker.helpers.arrayElement([
            'PREINITIALIZED', 'INITIALIZED', 'CONFIRMED', 'PAID', 'IN_TRANSIT',
            'PICKUP_MEET', 'FINALIZED', 'CANCELLED',
          ]);
          return prisma.processEvent.create({
            data: {
              goodsProcessId: process.id,
              fromStatus,
              toStatus,
              changedByUserId: faker.datatype.boolean() ? faker.helpers.arrayElement(users).id : null,
              note: faker.lorem.sentence(),
            },
          });
        })
      )
    );
    console.log('Created process events');

    // Create Reputations
    const reputations = await Promise.all(
      users.map((user) =>
        prisma.reputation.create({
          data: {
            userId: user.id,
            score: faker.number.float({ min: 0, max: 100 }),
            totalRatings: faker.number.int({ min: 0, max: 50 }),
            positiveRatings: faker.number.int({ min: 0, max: 40 }),
            negativeRatings: faker.number.int({ min: 0, max: 10 }),
            level: faker.number.int({ min: 1, max: 5 }),
          },
        })
      )
    );
    console.log('Created reputations');

    // Create Reputation Transactions
    const reputationTransactions = await Promise.all(
      reputations.flatMap((reputation) =>
        Array.from({ length: 3 }).map(() =>
          prisma.reputationTransaction.create({
            data: {
              reputationId: reputation.id,
              change: faker.number.float({ min: -10, max: 10 }),
              eventType: faker.helpers.arrayElement(['REVIEW', 'FEEDBACK', 'ADMIN_ACTION']),
              comment: faker.lorem.sentence(),
            },
          })
        )
      )
    );
    console.log('Created reputation transactions');

    // Create Goods Posts
    const goodsPosts = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.goodsPost.create({
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
        })
      )
    );
    console.log('Created goods posts');

    // Create Promo Posts
    const promoPosts = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.promoPost.create({
          data: {
            title: faker.lorem.sentence(3),
            content: faker.lorem.paragraph(1),
            publisherId: faker.helpers.arrayElement(users).id,
            categoryId: faker.helpers.arrayElement(categories).id,
            isPublished: faker.datatype.boolean(),
          },
        })
      )
    );
    console.log('Created promo posts');

    // Create Code Submissions
    const codeSubmissions = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.codeSubmission.create({
          data: {
            requestId: faker.helpers.arrayElement(requests).id,
            sponsorId: faker.helpers.arrayElement(users).id,
            code: faker.datatype.boolean() ? faker.string.alphanumeric(10) : null,
            accountDetails: faker.datatype.boolean() ? faker.finance.iban() : null,
            type: faker.helpers.arrayElement(['CODE', 'ACCOUNT']),
            status: faker.helpers.arrayElement(['SUBMITTED', 'DELIVERED', 'PENDING', 'REJECTED']),
          },
        })
      )
    );
    console.log('Created code submissions');

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error in seed function:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting database seeding...');
    await seed();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();