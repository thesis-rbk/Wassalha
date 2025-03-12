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
                        connect: { id: 11 }
                    },
                    sponsor: {
                        connect: { id: sponsorId }
                    },
                    recipient: recipientId ? {
                        connect: { id: recipientId }
                    } : undefined,
                    product: "hellloooo",
                    amount: 23,
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
            const subscriptions = await prisma.sponsorship.findMany({ include: { category: true } })
            res.status(200).send(subscriptions)
        } catch (err) {
            console.log("errrrr", err)
            res.status(400).send({ errrrr: err })
        }
    },
    search: async (req, res) => {
        const {
            nameContains,
            descriptionContains,
            platformContains,
            productContains,
            statusContains,
            minPrice,
            maxPrice,
            minDuration,
            maxDuration,
            minAmount,
            maxAmount,
            sponsorNameContains,
            recipientNameContains
        } = req.query;

        try {
            console.log("helloooo query", req.query);

            // If no filters provided, return all sponsorships
            if (!nameContains && !descriptionContains && !platformContains && !productContains &&
                !statusContains && !minPrice && !maxPrice && !minDuration && !maxDuration &&
                !minAmount && !maxAmount && !sponsorNameContains && !recipientNameContains) {
                const allSponsorships = await prisma.sponsorship.findMany({
                    include: {
                        category: true,
                        sponsor: { include: { user: true } },
                        recipient: true,
                        users: true
                    }
                });
                return res.status(200).json(allSponsorships);
            }

            // Filtered search
            const filteredSponsorships = await prisma.sponsorship.findMany({
                where: {
                    OR: [
                        nameContains && {
                            name: {
                                contains: nameContains,
                            }
                        },
                        descriptionContains && {
                            description: {
                                contains: descriptionContains,
                            }
                        },
                        platformContains && {
                            platform: {
                                contains: platformContains,
                            }
                        },
                        productContains && {
                            product: {
                                contains: productContains,
                            }
                        },
                        statusContains && {
                            status: {
                                contains: statusContains,
                            }
                        },
                        sponsorNameContains && {
                            sponsor: {
                                user: {
                                    name: {
                                        contains: sponsorNameContains,
                                    }
                                }
                            }
                        },
                        recipientNameContains && {
                            recipient: {
                                name: {
                                    contains: recipientNameContains,
                                }
                            }
                        }
                    ].filter(Boolean),
                    AND: [
                        minPrice && {
                            price: { gte: Number(minPrice) }
                        },
                        maxPrice && {
                            price: { lte: Number(maxPrice) }
                        },
                        minDuration && {
                            duration: { gte: Number(minDuration) }
                        },
                        maxDuration && {
                            duration: { lte: Number(maxDuration) }
                        },
                        minAmount && {
                            amount: { gte: Number(minAmount) }
                        },
                        maxAmount && {
                            amount: { lte: Number(maxAmount) }
                        }
                    ].filter(Boolean)
                },
                include: {
                    category: {
                        select: { id: true, name: true }
                    },
                    sponsor: {
                        select: {
                            id: true,
                            userId: true,
                            type: true,
                            isVerified: true,
                            badge: true,
                            user: {
                                select: { id: true, name: true, email: true }
                            }
                        }
                    },
                    recipient: {
                        select: { id: true, name: true, email: true }
                    },
                    users: {
                        select: { id: true, name: true }
                    }
                }
            });

            return res.status(200).send(filteredSponsorships);
        } catch (err) {
            console.log("errrrrrrrrrrrr", err);
            return res.status(400).send({ message: 'Something went wrong' });
        }
    },
    getAllCategories: async (req, res) => {
        try {
            const categories = await prisma.category.findMany();
            return res.status(200).send(categories)
        } catch (error) {
            console.error("Error fetching categories:", error);
            throw new Error("Could not fetch categories.");
        }
    }
}

module.exports = sponsor;