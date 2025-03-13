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

// Add delete pickup function
exports.deletePickup = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if pickup exists before attempting to delete
        const existingPickup = await prisma.pickup.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingPickup) {
            return res.status(404).json({
                success: false,
                message: "Pickup not found"
            });
        }

        await prisma.pickup.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({
            success: true,
            message: "Pickup deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting pickup:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete pickup",
            error: error.message,
        });
    }
}; 