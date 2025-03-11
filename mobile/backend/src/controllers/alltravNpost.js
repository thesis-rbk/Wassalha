const prisma = require('../../prisma/index');


const alltick = {
    allorders: async (req, res) => {
        try {
            const result = await prisma.goodsPost.findMany({
                include: {
                    traveler: { include: { profile: true } },
                }
            })
            res.status(200).json(result)
        } catch (err) {
            console.log("errorrrrrrrrrrrrrrrrrrr", err)
            res.status(400).json({ message: "error" })
        }
    }
}
module.exports = alltick