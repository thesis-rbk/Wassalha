const prisma = require("../../prisma");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require("axios")
const sponsor = {
    createSponsorShip: async (req, res) => {
        const sponsorId = req.user?.id;

        try {
            const { description, price, duration, platform, categoryId, amount } = req.body;

            const sponsorships = await prisma.sponsorship.create({
                data: {
                    description,
                    price,
                    duration,
                    platform,
                    category: {
                        connect: { id: parseInt(categoryId) } // Changed from string to integer
                    },
                    sponsor: {
                        connect: { id: parseInt(sponsorId) } // Changed from string to integer
                    },
                    amount,
                    status: "pending",
                },
            });
            res.status(200).send(sponsorships);
        } catch (err) {
            console.log("err", err);
            res.status(401).send({ messageError: err });
        }
    },
    createSubscription: async (req, res) => {
        try {
            const { name, description, price, duration, type, categoryId, isActive } = req.body;

            const subscription = await prisma.subscription.create({
                data: {
                    name,
                    description,
                    price,
                    duration,
                    type,
                    category: {
                        connect: { id: categoryId }
                    },
                    isActive: isActive ?? true, // Default to true if not provided
                },
            });
            res.status(200).send(subscription);
        } catch (err) {
            console.log("err", err);
            res.status(400).send({ message: err });
        }
    },
    rewiewSubscription: async (req, res) => {
        const { id } = req.params;
        try {
            const review = await prisma.reviewSponsor.findMany({
                where: { reviewed_user_id: parseInt(id) }
            });
            res.status(200).send(review);
        } catch (err) {
            console.log("err", err);
            res.status(400).send({ message: err });
        }
    },
    reviewCreate: async (req, res) => {
        const { reviewer_id = 1, reviewed_user_id = 1, rating } = req.body;

        try {
            // Validate required fields
            if (!reviewer_id || !reviewed_user_id || !rating) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Create the review
            const newReview = await prisma.reviewSponsor.create({
                data: {
                    reviewer_id,
                    reviewed_user_id,
                    rating,
                },
            });

            return res.status(201).json(newReview);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error creating review' });
        }
    },
    allSub: async (req, res) => {
        try {
            const subscriptions = await prisma.sponsorship.findMany({ include: { category: true } })
            res.status(200).send(subscriptions)
        } catch (err) {
            console.log("errrrr", err)
            res.status(400).send({ errrrr: err })
        }
    },
    search: async (req, res) => {
        const { searchTerm } = req.query;

        try {
            console.log("Search query parameters:", req.query);

            const whereConditions = {
                isActive: true,
            };
            if (searchTerm) {
                const search = searchTerm.toString();
                const searchUpper = search.toUpperCase();

                const availablePlatforms = [
                    'FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'TIKTOK', 'OTHER',
                ];

                const matchingPlatforms = availablePlatforms.filter(platform =>
                    platform.includes(searchUpper)
                );

                whereConditions.OR = [
                    { description: { contains: search } },
                    ...(matchingPlatforms.length > 0 ? [{ platform: { in: matchingPlatforms } }] : []),
                ];
            }
            const sponsorships = await prisma.sponsorship.findMany({
                where: whereConditions,
                include: {
                    category: { select: { id: true, name: true } },
                    sponsor: {
                        select: {
                            id: true,
                            userId: true,
                            type: true,
                            isVerified: true,
                            badge: true,
                            user: { select: { id: true, name: true, email: true } },
                        },
                    },
                    users: { select: { id: true, name: true } },
                },
                orderBy: {
                    updatedAt: "desc", // Changed from `createdAt` to `updatedAt`
                },
            });
            return res.status(200).json(sponsorships);
        } catch (err) {
            console.log("Error in sponsorship search:", err);
            return res.status(400).send({ message: "Something went wrong", error: err.message });
        }
    }
    ,
    getAllCategories: async (req, res) => {
        try {
            const categories = await prisma.category.findMany();
            return res.status(200).send(categories)
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw new Error("Could not fetch categories.");
        }
    },
    getAllNotificationById: async (req, res) => {
        const { id } = req.params
        try {
            const notifications = await prisma.notification.findMany({ where: { userId: parseInt(id) } })
            res.status(200).send(notifications)
        } catch (err) {
            res.status(401).send({ "err": err })
        }
    },
    paymentSponsor: async (req, res) => {
        const { id } = req.user
        console.log("bueyr idddddddd", id)
        try {
            const { amount, cardExpiryMm, cardExpiryYyyy, cardholderName, sponsorShipId, cardNumber, cardCvc } = req.body;

            // Create a payment method using a test token
            const paymentMethods = await stripe.paymentMethods.create({
                type: "card",
                card: {
                    token: "tok_visa", // Test token for Visa: 4242424242424242
                },
            });
            const paymentMethodId = paymentMethods.id;

            // Create and confirm the payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency: "eur",
                payment_method_types: ["card"],
                payment_method: paymentMethodId,
                confirm: true, // Confirm immediately for testing
            });

            // Check payment status
            if (paymentIntent.status === "succeeded") {
                console.log("Payment succeeded immediately!");
            } else if (paymentIntent.status === "requires_action" || paymentIntent.status === "requires_confirmation") {
                console.log("Payment requires additional action:", paymentIntent.status);
            } else {
                console.log("Payment status:", paymentIntent.status);
            }

            // Store payment information in the database
            const payment = await prisma.sponsorCheckout.create({
                data: {
                    amount: Math.round(amount),
                    currency: "TND",
                    paymentMethod: "CARD",
                    status: paymentIntent.status === "succeeded" ? "COMPLETED" : "PENDING",
                    transactionId: paymentIntent.id,
                    qrCode: paymentIntent.client_secret,
                    paymentUrl: paymentIntent.next_action?.use_stripe_sdk?.url,
                    cardExpiryYyyy,
                    cardholderName,
                    sponsorShipId: parseInt(sponsorShipId),
                    buyerId: parseInt(id),
                    cardExpiryMm,
                    cardNumber,
                    cardCvc
                },
            });

            // Mock transfer for testing
            if (paymentIntent.status === "succeeded") {
                const fullPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
                console.log("fullllll", fullPaymentIntent);
                const chargeId = fullPaymentIntent.latest_charge;

                const connectedAccountId = process.env.PROFILE_STRIPE_ID
                // Mock transfer response instead of calling Stripe
                const mockTransfer = {
                    id: "tr_mock_" + Date.now(), // Fake transfer ID
                    amount: amount * 100, // Convert to cents
                    currency: "eur",
                    destination: connectedAccountId,
                    source_transaction: chargeId,
                };
                console.log("Transferred to Connected Account (mocked):", mockTransfer.id);
            }
            const sub = await prisma.sponsorship.findUnique({ where: { id: payment.sponsorShipId }, include: { sponsor: true } })
            const order = await prisma.orderSponsor.create({
                data: {
                    serviceProviderId: parseInt(sub.sponsor.id),
                    sponsorshipId: parseFloat(sub.id),
                    recipientId: parseInt(id),
                    amount: Math.round(amount),
                    status: "PENDING",
                },
            });
            res.send({
                message: "successfully initiated", order
            });
        } catch (error) {
            console.error("Payment error:", error);
            res.status(400).send({
                error: "Payment processing failed",
                message: error.message,
                type: error.type,
            });
        }
    },
    checkSponsor: async (req, res) => {
        const sponsorId = req.user.id
        try {
            if (!sponsorId) {
                res.status(200).send(false)
            } else {
                res.status(200).send(true)
            }
        } catch (err) {
            console.log("err", err)
        }
    },
    findOneSponsor: async (req, res) => {
        try {
            const { id } = req.params;
            const sponsor = await prisma.sponsorship.findUnique({
                where: { id: parseInt(id) },
                include: {
                    sponsor: true,
                }
            });
            res.status(200).send(sponsor);
        } catch (err) {
            console.log("err", err)
        }
    },
    sponsorShipReview: async (req, res) => {
        const { id } = req.params;
        try {
            const allRev = await prisma.reviewSponsor.findMany({ where: { sponsorshipId: parseInt(id) } });
            res.status(200).send(allRev);
        } catch (err) {
            console.log("err", err)
            res.status(400).send({ message: err });
        }
    },
    initiatePayment: async (req, res) => {
        const { amount, description, firstName, lastName, phoneNumber, email, orderId } = req.body;
        console.log("amount", process.env.KONNECT_BASE_URL)
        try {
            // Sending the payment initiation request to Konnect API
            const response = await axios.post(`https://api.sandbox.konnect.network/api/v2/payments/init-payment`, {
                receiverWalletId: "67ddea382f786e7f606a343f", // Your Konnect wallet ID
                token: 'TND', // Currency (TND, EUR, USD)
                amount: amount, // Amount in millimes (TND) or cents (EUR, USD)
                type: 'immediate', // Type of payment: immediate or partial
                description: description,
                acceptedPaymentMethods: [
                    "wallet",
                    "bank_card",
                    "e-DINAR"
                ],
                lifespan: 60,
                checkoutForm: true,
                addPaymentFeesToAmount: true,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                email: email,
                orderId: orderId,
                successUrl: 'https://api.sandbox.konnect.network/api/v2/success', // Redirect URL on success
                failUrl: 'https://api.sandbox.konnect.network/api/v2/failure', // Redirect URL on failure
                webhook: 'https://merchant.tech/api/notification_payment', // Webhook for payment status updates
                theme: 'light',
            }, {
                headers: {
                    'x-api-key': "67ddea352f786e7f606a342c:Mh4rmXRd04JUyJYNQtIQIvBUg2S8U", // Your Konnect API Key
                },
            });

            // Returning the payment URL to the client
            return res.status(200).json({
                success: true,
                payUrl: response.data.payUrl, // URL to the payment page
                paymentRef: response.data.paymentRef, // Payment reference ID
            });
        } catch (error) {
            console.error("Error initiating payment:", error);
        }
    },
    createOrderSponsor: async (req, res) => {
        const { id } = req.user
        try {
            const { serviceProviderId, sponsorshipId, amount, status } = req.body;

            // Validate required fields
            if (!serviceProviderId || !sponsorshipId || !amount || !status) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Create the order
            const newOrder = await prisma.orderSponsor.create({
                data: {
                    serviceProviderId,
                    sponsorshipId,
                    recipientId: id,
                    amount,
                    status: "PENDING",
                },
            });
            console.log("createddddd succffffff order")
            return res.status(201).json({ message: 'Order created successfully', data: newOrder });
        } catch (error) {
            console.error('Error creating order:', error);
            throw error
        }
    },
    getAllRequestsSponsor: async (req, res) => {
        const { id } = req.user
        try {
            const serviceProvider = await prisma.serviceProvider.findUnique({ where: { userId: id } })
            const requests = await prisma.orderSponsor.findMany({
                where: { serviceProviderId: serviceProvider.id }, include: {
                    sponsorship: true,     // Include sponsorship details
                    recipient: true        // Include recipient (User) details
                }
            })
            res.send({ requests })
        } catch (err) {
            console.log("errrrrrrrrr", err)
            res.Send({ message: err })
        }
    }
}
module.exports = sponsor;