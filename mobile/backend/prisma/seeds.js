const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function seed() {
  // Clear existing data using deleteMany
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.traveler.deleteMany();
  await prisma.goods.deleteMany();
  await prisma.request.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pickup.deleteMany();
  await prisma.category.deleteMany();
  await prisma.serviceProvider.deleteMany();
  await prisma.sponsorCheckout.deleteMany();
  await prisma.reviewSponsor.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.sponsorship.deleteMany();
  await prisma.goodsPost.deleteMany();
  await prisma.promoPost.deleteMany();
  await prisma.reputation.deleteMany();
  await prisma.reputationTransaction.deleteMany();
  await prisma.goodsProcess.deleteMany();
  await prisma.processEvent.deleteMany();
  await prisma.pickupSuggestion.deleteMany();
  await prisma.orderSponsor.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.codeSubmission.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.experienceReview.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.message.deleteMany();
  await prisma.media.deleteMany();

  // Seed Users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phoneNumber: faker.phone.number(),
        password: faker.internet.password(),
        role: faker.helpers.arrayElement(['USER', 'ADMIN', 'SUPER_ADMIN']),
        hasCompletedOnboarding: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
    users.push(user);
  }

  // Seed Profiles
  const profiles = [];
  for (const user of users) {
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        bio: faker.lorem.sentence(),
        country: faker.helpers.arrayElement(['USA', 'CANADA', 'UK', 'AUSTRALIA', 'GERMANY', 'FRANCE', 'INDIA', 'JAPAN', 'TUNISIA', 'MOROCCO', 'ALGERIA', 'TURKEY', 'SPAIN', 'ITALY', 'PORTUGAL', 'NETHERLANDS', 'BELGIUM', 'SWEDEN', 'NORWAY', 'DENMARK', 'FINLAND', 'ICELAND', 'AUSTRIA', 'SWITZERLAND', 'BELARUS', 'RUSSIA', 'CHINA', 'BRAZIL', 'ARGENTINA', 'CHILE', 'MEXICO', 'COLOMBIA', 'PERU', 'VENEZUELA', 'ECUADOR', 'PARAGUAY', 'URUGUAY', 'BOLIVIA', 'OTHER']),
        phoneNumber: faker.phone.number(),
        balance: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        isAnonymous: faker.datatype.boolean(),
        isBanned: faker.datatype.boolean(),
        isVerified: faker.datatype.boolean(),
        isOnline: faker.datatype.boolean(),
        isSponsor: faker.datatype.boolean(),
        preferredCategories: faker.lorem.word(),
        referralSource: faker.helpers.arrayElement(['SOCIAL_MEDIA', 'FRIEND_RECOMMENDATION', 'APP_STORE', 'GOOGLE_SEARCH', 'ADVERTISEMENT', 'OTHER']),
      },
    });
    profiles.push(profile);
  }

  // Seed Travelers
  const travelers = [];
  for (const user of users.slice(0, 5)) {
    const traveler = await prisma.traveler.create({
      data: {
        userId: user.id,
        idCard: faker.string.alphanumeric(10),
        bankCard: faker.finance.creditCardNumber(),
        isVerified: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
    travelers.push(traveler);
  }

  // Seed Categories
  const categories = [];
  for (let i = 0; i < 5; i++) {
    const category = await prisma.category.create({
      data: {
        name: faker.commerce.department(),
        description: faker.lorem.sentence(),
        isDisabled: faker.datatype.boolean(),
      },
    });
    categories.push(category);
  }

  // Seed Goods
  const goods = [];
  for (let i = 0; i < 10; i++) {
    const good = await prisma.goods.create({
      data: {
        name: faker.commerce.productName(),
        size: faker.helpers.arrayElement(['Small', 'Medium', 'Large']),
        weight: faker.number.float({ min: 0.1, max: 10, fractionDigits: 2 }),
        price: faker.number.float({ min: 5, max: 500, fractionDigits: 2 }),
        description: faker.commerce.productDescription(),
        goodsUrl: faker.internet.url(),
        isVerified: faker.datatype.boolean(),
        categoryId: faker.helpers.arrayElement(categories).id,
      },
    });
    goods.push(good);
  }

  // Seed Service Providers
  const serviceProviders = [];
  for (const user of users.slice(0, 3)) {
    const sp = await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        type: faker.helpers.arrayElement(['PENDING_SPONSOR', 'SPONSOR', 'SUBSCRIBER']),
        isVerified: faker.datatype.boolean(),
        badge: faker.lorem.word(),
        idCard: faker.string.alphanumeric(10),
        passport: faker.string.alphanumeric(12),
        license: faker.string.alphanumeric(8),
        creditCard: faker.finance.creditCardNumber().slice(-4),
        selfie: faker.image.url(),
        questionnaireAnswers: { answers: faker.lorem.sentences(3) },
        subscriptionLevel: faker.helpers.arrayElement(['Basic', 'Premium', 'Elite']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
    serviceProviders.push(sp);
  }

  // Seed Subscriptions
  const subscriptions = [];
  for (let i = 0; i < 5; i++) {
    const subscription = await prisma.subscription.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        price: faker.number.float({ min: 5, max: 100, fractionDigits: 2 }),
        duration: faker.number.int({ min: 30, max: 365 }),
        type: faker.helpers.arrayElement(['STREAMING', 'SOFTWARE', 'GAMING', 'EDUCATION', 'OTHER']),
        categoryId: faker.helpers.arrayElement(categories).id,
        isActive: faker.datatype.boolean(),
        users: { connect: [{ id: faker.helpers.arrayElement(users).id }] },
      },
    });
    subscriptions.push(subscription);
  }

  // Seed Sponsorships
  const sponsorships = [];
  for (let i = 0; i < 5; i++) {
    const sponsorship = await prisma.sponsorship.create({
      data: {
        description: faker.lorem.sentence(),
        price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        duration: faker.number.int({ min: 7, max: 90 }),
        platform: faker.helpers.arrayElement(['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'TIKTOK', 'OTHER']),
        categoryId: faker.helpers.arrayElement(categories).id,
        isActive: faker.datatype.boolean(),
        sponsorId: faker.helpers.arrayElement(serviceProviders).id,
        status: faker.helpers.arrayElement(['pending', 'active', 'completed']),
        users: { connect: [{ id: faker.helpers.arrayElement(users).id }] },
        userId: faker.helpers.arrayElement(users).id,
        updatedAt: faker.date.recent(),
      },
    });
    sponsorships.push(sponsorship);
  }

  // Seed SponsorCheckout
  for (const sponsorship of sponsorships.slice(0, 3)) {
    await prisma.sponsorCheckout.create({
      data: {
        buyerId: faker.helpers.arrayElement(users).id,
        cardNumber: faker.finance.creditCardNumber(),
        cardExpiryMm: faker.date.future().getMonth().toString().padStart(2, '0'),
        cardExpiryYyyy: faker.date.future().getFullYear().toString(),
        cardCvc: faker.finance.creditCardCVV(),
        cardholderName: faker.person.fullName(),
        amount: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
        qrCode: faker.string.alphanumeric(10),
        paymentUrl: faker.internet.url(),
        currency: faker.helpers.arrayElement(['USD', 'EUR', 'TND']),
        status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'REFUND', 'FAILED', 'PROCCESSING']),
        paymentMethod: faker.helpers.arrayElement(['CARD', 'D17', 'STRIPE', 'PAYPAL', 'BANKTRANSFER']),
        transactionId: faker.string.uuid(),
        sponsorShipId: sponsorship.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  // Seed Requests
  const requests = [];
  for (let i = 0; i < 8; i++) {
    const request = await prisma.request.create({
      data: {
        status: faker.helpers.arrayElement(['PENDING', 'ACCEPTED', 'CANCELLED', 'REJECTED']),
        sponsorId: faker.helpers.maybe(() => faker.helpers.arrayElement(users).id, 0.5),
        userId: faker.helpers.arrayElement(users).id,
        goodsId: faker.helpers.arrayElement(goods).id,
        quantity: faker.number.int({ min: 1, max: 10 }),
        goodsLocation: faker.location.city(),
        goodsDestination: faker.location.city(),
        date: faker.date.future(),
        withBox: faker.datatype.boolean(),
      },
    });
    requests.push(request);
  }

  // Seed Orders
  const orders = [];
  for (const request of requests.slice(0, 5)) {
    const order = await prisma.order.create({
      data: {
        requestId: request.id,
        travelerId: faker.helpers.arrayElement(users).id,
        departureDate: faker.date.soon(),
        arrivalDate: faker.date.future(),
        trackingNumber: faker.string.alphanumeric(12),
        totalAmount: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        paymentStatus: faker.helpers.arrayElement(['ON_HOLD', 'PAYED', 'REFUNDED']),
        orderStatus: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED']),
      },
    });
    orders.push(order);
  }

  // Seed Payments
  for (const order of orders) {
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: faker.number.float({ min: 5, max: order.totalAmount || 100, fractionDigits: 2 }),
        currency: faker.helpers.arrayElement(['USD', 'EUR', 'TND']),
        status: faker.helpers.arrayElement(['PENDING', 'COMPLETED', 'REFUND', 'FAILED', 'PROCCESSING']),
        paymentMethod: faker.helpers.arrayElement(['CARD', 'D17', 'STRIPE', 'PAYPAL', 'BANKTRANSFER']),
        transactionId: faker.string.uuid(),
        qrCode: faker.string.alphanumeric(10),
        paymentUrl: faker.internet.url(),
      },
    });
  }

  // Seed Pickups
  const pickups = [];
  for (const order of orders) {
    const pickup = await prisma.pickup.create({
      data: {
        orderId: order.id,
        pickupType: faker.helpers.arrayElement(['AIRPORT', 'IN_PERSON', 'PICKUPPOINT', 'DELIVERY']),
        location: faker.location.city(),
        address: faker.location.streetAddress(),
        qrCode: faker.string.alphanumeric(8),
        coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
        contactPhoneNumber: faker.phone.number(),
        travelerconfirmed: faker.datatype.boolean(),
        userconfirmed: faker.datatype.boolean(),
        status: faker.helpers.arrayElement(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED', 'DELIVERED']),
        scheduledTime: faker.date.soon(),
      },
    });
    pickups.push(pickup);
  }

  // Seed Notifications
  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        senderId: faker.helpers.arrayElement(users).id,
        type: faker.helpers.arrayElement(['REQUEST', 'ACCEPTED', 'REJECTED', 'ORDER_CREATED', 'PAYMENT_INITIATED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PICKUP_SCHEDULE', 'DELIVERY_COMPLETED', 'SYSTEM_ALERT']),
        title: faker.lorem.sentence(3),
        message: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['READ', 'UNREAD']),
        requestId: faker.helpers.maybe(() => faker.helpers.arrayElement(requests).id, 0.3),
        orderId: faker.helpers.maybe(() => faker.helpers.arrayElement(orders).id, 0.3),
        pickupId: faker.helpers.maybe(() => faker.helpers.arrayElement(pickups).id, 0.3),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  // Seed Reviews
  for (let i = 0; i < 5; i++) {
    await prisma.review.create({
      data: {
        reviewerId: faker.helpers.arrayElement(users).id,
        reviewedId: faker.helpers.arrayElement(users).id,
        orderId: faker.helpers.maybe(() => faker.helpers.arrayElement(orders).id, 0.5),
        rating: faker.number.int({ min: 1, max: 5 }),
        title: faker.lorem.sentence(3),
        comment: faker.lorem.paragraph(),
        reviewType: faker.helpers.arrayElement(['USER_REVIEW', 'EXPERIENCE_REVIEW', 'DELIVERYMAN_REVIEW', 'PICKUPPOINT_REVIEW']),
        status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED', 'EDITED']),
      },
    });
  }

  // Seed ExperienceReviews
  for (const order of orders.slice(0, 3)) {
    await prisma.experienceReview.create({
      data: {
        reviewerId: faker.helpers.arrayElement(users).id,
        orderId: order.id,
        rating: faker.number.int({ min: 1, max: 5 }),
        createdAt: faker.date.past(),
      },
    });
  }

  // Seed Chats
  const chats = [];
  for (let i = 0; i < 5; i++) {
    const chat = await prisma.chat.create({
      data: {
        requesterId: faker.helpers.arrayElement(users).id,
        providerId: faker.helpers.arrayElement(users).id,
        productId: faker.helpers.arrayElement(goods).id,
      },
    });
    chats.push(chat);
  }

  // Seed Messages
  for (const chat of chats) {
    await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId: chat.requesterId,
        receiverId: chat.providerId,
        type: 'text',
        content: faker.lorem.sentence(),
        isRead: faker.datatype.boolean(),
        time: faker.date.recent(),
      },
    });
  }

  // Seed Media
  const mediaItems = [];
  for (let i = 0; i < 5; i++) {
    const media = await prisma.media.create({
      data: {
        url: faker.image.url(), // Generates a random image URL
        type: 'IMAGE', // Fixed to only insert images
        mimeType: faker.helpers.arrayElement(['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']), // Common image MIME types
        extension: faker.helpers.arrayElement(['JPG', 'JPEG', 'PNG', 'GIF', 'SVG']), // Image file extensions only
        filename: `${faker.system.commonFileName()}.${faker.helpers.arrayElement(['jpg', 'jpeg', 'png', 'gif', 'svg'])}`, // Ensures filename matches image extension
        size: faker.number.float({ min: 0.1, max: 100, fractionDigits: 2 }), // Size in MB, reasonable for images
        width: faker.number.int({ min: 100, max: 1920 }), // Typical image width range
        height: faker.number.int({ min: 100, max: 1080 }), // Typical image height range
        duration: null, // Set to null since images don’t have duration
      },
    });
    mediaItems.push(media);
  }

  // Seed GoodsPosts
  for (let i = 0; i < 5; i++) {
    await prisma.goodsPost.create({
      data: {
        title: faker.lorem.sentence(3),
        content: faker.lorem.paragraph(),
        travelerId: faker.helpers.arrayElement(users).id,
        departureDate: faker.date.soon(),
        arrivalDate: faker.date.future(),
        availableKg: faker.number.float({ min: 1, max: 50, fractionDigits: 2 }),
        originLocation: faker.location.city(),
        airportLocation: faker.location.city(),
        phoneNumber: faker.phone.number(),
        categoryId: faker.helpers.arrayElement(categories).id,
        isPublished: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  // Seed PromoPosts
  for (let i = 0; i < 5; i++) {
    await prisma.promoPost.create({
      data: {
        title: faker.lorem.sentence(3),
        content: faker.lorem.paragraph(),
        publisherId: faker.helpers.arrayElement(users).id,
        categoryId: faker.helpers.arrayElement(categories).id,
        isPublished: faker.datatype.boolean(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  // Seed Reputation
  const reputations = [];
  for (const user of users) {
    const reputation = await prisma.reputation.create({
      data: {
        userId: user.id,
        score: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
        totalRatings: faker.number.int({ min: 0, max: 50 }),
        positiveRatings: faker.number.int({ min: 0, max: 40 }),
        negativeRatings: faker.number.int({ min: 0, max: 10 }),
        level: faker.number.int({ min: 1, max: 5 }),
        lastUpdated: faker.date.recent(),
        createdAt: faker.date.past(),
      },
    });
    reputations.push(reputation);
  }

  // Seed ReputationTransactions
  for (const reputation of reputations.slice(0, 3)) {
    await prisma.reputationTransaction.create({
      data: {
        reputationId: reputation.id,
        change: faker.number.float({ min: -10, max: 10, fractionDigits: 2 }),
        eventType: faker.helpers.arrayElement(['REVIEW', 'FEEDBACK', 'ADMIN_ACTION']),
        comment: faker.lorem.sentence(),
        createdAt: faker.date.past(),
      },
    });
  }

  // Seed GoodsProcess
  for (const order of orders) {
    await prisma.goodsProcess.create({
      data: {
        orderId: order.id,
        status: faker.helpers.arrayElement(['PREINITIALIZED', 'INITIALIZED', 'CONFIRMED', 'PAID', 'IN_TRANSIT', 'PICKUP_MEET', 'FINALIZED', 'CANCELLED']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  // Seed ProcessEvent
  for (const order of orders.slice(0, 3)) {
    await prisma.processEvent.create({
      data: {
        goodsProcessId: order.id,
        fromStatus: faker.helpers.arrayElement(['PREINITIALIZED', 'INITIALIZED', 'CONFIRMED']),
        toStatus: faker.helpers.arrayElement(['PAID', 'IN_TRANSIT', 'PICKUP_MEET', 'FINALIZED', 'CANCELLED']),
        changedByUserId: faker.helpers.arrayElement(users).id,
        note: faker.lorem.sentence(),
        createdAt: faker.date.past(),
      },
    });
  }

  // Seed PickupSuggestion
  for (const order of orders.slice(0, 3)) {
    await prisma.pickupSuggestion.create({
      data: {
        pickupId: faker.helpers.maybe(() => faker.helpers.arrayElement(pickups).id, 0.5),
        orderId: order.id,
        userId: faker.helpers.arrayElement(users).id,
        pickupType: faker.helpers.arrayElement(['AIRPORT', 'IN_PERSON', 'PICKUPPOINT', 'DELIVERY']),
        location: faker.location.city(),
        address: faker.location.streetAddress(),
        qrCode: faker.string.alphanumeric(8),
        coordinates: `${faker.location.latitude()},${faker.location.longitude()}`,
        contactPhoneNumber: faker.phone.number(),
        scheduledTime: faker.date.soon(),
        createdAt: faker.date.past(),
      },
    });
  }

  // Seed OrderSponsor
  for (const sponsorship of sponsorships.slice(0, 3)) {
    await prisma.orderSponsor.create({
      data: {
        serviceProviderId: sponsorship.sponsorId,
        sponsorshipId: sponsorship.id,
        recipientId: faker.helpers.arrayElement(users).id,
        amount: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
        status: faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'REJECTED', 'IN_TRANSIT', 'DELIVERED']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  // Seed Tickets
  const tickets = [];
  for (let i = 0; i < 5; i++) {
    const ticket = await prisma.ticket.create({
      data: {
        title: faker.lorem.sentence(3),
        description: faker.lorem.paragraph(),
        userId: faker.helpers.arrayElement(users).id,
        status: faker.helpers.arrayElement(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
        category: faker.helpers.arrayElement(['REQUEST_ISSUE', 'OFFER_ISSUE', 'PAYMENT_ISSUE', 'PICKUP_ISSUE', 'DELIVERY_ISSUE', 'TRAVELER_NON_COMPLIANCE', 'OTHER']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
    tickets.push(ticket);
  }

  // Seed TicketMessages
  for (const ticket of tickets) {
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: ticket.userId,
        content: faker.lorem.paragraph(),
        isAdmin: faker.datatype.boolean(),
        createdAt: faker.date.past(),
      },
    });
  }

  // Seed CodeSubmission
  for (const request of requests.slice(0, 3)) {
    await prisma.codeSubmission.create({
      data: {
        requestId: request.id,
        sponsorId: faker.helpers.arrayElement(users).id,
        code: faker.string.alphanumeric(10),
        accountDetails: faker.finance.iban(),
        type: faker.helpers.arrayElement(['CODE', 'ACCOUNT']),
        status: faker.helpers.arrayElement(['SUBMITTED', 'DELIVERED']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  // Seed ReviewSponsor
  for (const sponsorship of sponsorships.slice(0, 3)) {
    await prisma.reviewSponsor.create({
      data: {
        reviewer_id: faker.helpers.arrayElement(profiles).id,
        reviewed_user_id: faker.helpers.arrayElement(profiles).id,
        sponsorshipRating: faker.number.int({ min: 1, max: 5 }),
        serviceProviderRating: faker.number.int({ min: 1, max: 5 }),
        sponsorshipId: sponsorship.id,
        serviceProviderId: sponsorship.sponsorId,
        comment: faker.lorem.sentence(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
    });
  }

  console.log('Seeding completed!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });