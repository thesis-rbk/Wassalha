const prisma = require("../../prisma");

const sponsor = {
    createSponsorShip: async (req, res) => {
        try {
            const { name, description, price, duration, platform, categoryId, sponsorId, recipientId, product, amount } = req.body;

            const sponsorships = await prisma.sponsorship.create({
                data: {
                    name,
                    description,
                    price,
                    duration,
                    platform,
                    category: {
                        connect: { id: categoryId }
                    },
                    sponsor: {
                        connect: { id: sponsorId }
                    },
                    recipient: recipientId ? {
                        connect: { id: recipientId }
                    } : undefined,
                    product,
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
        const { reviewer_id, reviewed_user_id, rating } = req.body;

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
            const subscriptions = await prisma.subscription.findMany({})
            res.status(200).send(subscriptions)
        } catch (err) {
            console.log("errrrr", err)
            res.status(400).send({ errrrr: err })
        }
    }
}

module.exports = sponsor;