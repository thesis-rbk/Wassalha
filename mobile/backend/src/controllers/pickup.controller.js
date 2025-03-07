const prisma = require("../../prisma");

exports.getAllPickups = async (req, res) => {
    try {
        const pickups = await prisma.pickup.findMany({
            include: {
                // Include any related models if necessary
            },
        });
        res.status(200).json({
            success: true,
            data: pickups,
        });
    } catch (error) {
        console.error("Error fetching pickups:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pickups",
            error: error.message,
        });
    }
}; 