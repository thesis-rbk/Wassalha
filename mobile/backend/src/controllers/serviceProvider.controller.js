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

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if subscription exists before attempting to delete
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingSubscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    await prisma.subscription.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Subscription deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete subscription",
      error: error.message,
    });
  }
};
