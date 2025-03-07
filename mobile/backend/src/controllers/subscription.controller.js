const prisma = require("../../prisma/index");

// Fetch all subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        users: true, // Correctly include the users relation
        // Add any other related models you want to include
      },
    });
    res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscriptions",
      error: error.message,
    });
  }
}; 