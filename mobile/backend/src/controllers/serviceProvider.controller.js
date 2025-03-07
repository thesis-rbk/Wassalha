const prisma = require("../../prisma/index");

// Fetch all service providers with required fields
exports.getAllServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await prisma.serviceProvider.findMany({
      select: { // Use select to specify the fields to fetch
        id: true,
        userId: true,
        type: true,
        brandName: true,
        subscriptionLevel: true,
        isEligible: true,
        followerCount: true,
        user: { // Include user data if needed
          select: {
            id: true,
            name: true, // Include any other user fields you need
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      data: serviceProviders,
    });
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service providers",
      error: error.message,
    });
  }
}; 