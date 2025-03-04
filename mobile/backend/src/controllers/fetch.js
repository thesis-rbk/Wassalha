const prisma = require("../../prisma");
const fetch = {
    bestTraveler: async (req, res) => {
        try {
            const result = await prisma.review.findMany({
                where: {
                    rating: {
                        gte: 4, // Rating greater than or equal to 4
                    },
                },
                include: {
                    reviewed: { // The 'reviewed' user (the user being reviewed)
                        include: {
                            profile: true, // Eager load the profile of the reviewed user
                        },
                    },
                },
            });

            console.log("resulttttttt", result);
            res.status(200).json(result);
        } catch (err) {
            console.error("Error fetching best travelers:", err); // Log the error for debugging
            res.status(401).json({ error: err.message }); // Send a more specific error message
        }
    }

}
module.exports = fetch