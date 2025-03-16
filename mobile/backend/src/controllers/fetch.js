const prisma = require("../../prisma/index");
const fetch = {
    All: async (req, res) => {
        const traveler = []
        const sponsor = []
        try {
            const result = await prisma.reputation.findMany({
                where: {
                    score: {
                        gte: 40, // Rating greater than or equal to 4
                    },
                },
                include: {
                    user: {
                        include: {
                            profile: { include: { image: true } },
                        },
                    },
                },
            });
            for (let i = 0; i < result.length; i++) {
                const findspons = await prisma.serviceProvider.findUnique({ where: { userId: result[i]["userId"] } })
                if (findspons) {
                    sponsor.push(result[i])
                } else {
                    traveler.push(result[i])
                }
            }
            res.status(200).json({ "traveler": traveler, "sponsor": sponsor });
        } catch (err) {
            console.error("Error fetching best travelers:", err); // Log the error for debugging
            res.status(401).json({ error: err.message }); // Send a more specific error message
        }
    },

    searchRequestsTraveler: async (req, res) => {
        try {
            const { body } = req.query
            if (!body) {
                const all = await prisma.goodsPost.findMany()
                return res.status(200).json(all);
            }
            const filtrer = await prisma.goodsPost.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: body,
                            },
                        },
                        {
                            content: {
                                contains: body,
                            },
                        },
                        {
                            airportLocation: {
                                contains: body,
                            },
                        },
                    ],
                },
            });

            return res.status(200).send(filtrer)
        } catch (err) {
            console.log("errrrrrrrrrrrr", err)
            return res.status(400).send({ message: 'Something went wrong' })
        }
    }
}
module.exports = fetch