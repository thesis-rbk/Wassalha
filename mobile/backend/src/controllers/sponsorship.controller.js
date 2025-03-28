const prisma = require("../../prisma/index");

// Fetch all sponsorships
exports.getAllSponsorships = async (req, res) => {
  try {
    const sponsorships = await prisma.sponsorship.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true, 
            description: true,
          },
        },
        sponsor: {
          select: {
            id: true,
            userId: true,
            type: true, 
            isVerified: true,
            badge: true,
            subscriptionLevel: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      data: sponsorships,
    });
  } catch (error) {
    console.error("Error fetching sponsorships:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sponsorships",
      error: error.message,
    });
  }
};

// Delete a sponsorship
exports.deleteSponsorship = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if sponsorship exists before attempting to delete
    const existingSponsorship = await prisma.sponsorship.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSponsorship) {
      return res.status(404).json({
        success: false,
        message: "Sponsorship not found"
      });
    }

    await prisma.sponsorship.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Sponsorship deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sponsorship:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete sponsorship",
      error: error.message,
    });
  }
}; 