const prisma = require("../../prisma/index");

// Fetch all sponsorships
exports.getAllSponsorships = async (req, res) => {
  try {
    const sponsorships = await prisma.sponsorship.findMany({
      include: {
        users: true, // Correctly include the users relation
        category: true, // Include category if needed
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