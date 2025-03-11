const prisma = require("../../prisma");

const sponsor = {
    createSponsorShip: async (req, res) => {
        try {
            const { name, description, price, duration, platform, categoryId, sponsorId, recipientId, product, amount } = req.body;

            const sponsorship = await prisma.sponsorship.create({
                data: {
                    name,
                    description,
                    price,
                    duration,
                    platform,
                    categoryId,
                    sponsorId,
                    recipientId,
                    product,
                    amount,
                    status: "pending",
                },
            });
            res.status(200).send(sponsorship)
        } catch (err) {
            console.log("err", err)
            res.status(401).send({ message: err })
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
                    categoryId,
                    isActive: isActive ?? true, // Default to true if not provided
                },
            });
            res.status(400).send(subscription)
        } catch (err) {
            console.log("errrrrrrrrrrr", err)
            res.status(400).send({ message: err })
        }
    },
    rewiewSubscription: async (req, res) => {
        try {

        } catch (err) {
            console.log("errrr", err)
            res.status(400).send({ message: err })
        }
    }

}