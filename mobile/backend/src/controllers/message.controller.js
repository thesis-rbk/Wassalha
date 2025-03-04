const prisma = require("../../prisma");

// Fetch messages for the current user
exports.getMessages = async (req, res) => {
  const { userId } = req.query; // Get userId from query params

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: parseInt(userId) }, // Messages sent by the user
          { receiverId: parseInt(userId) }, // Messages received by the user
        ],
      },
      include: {
        sender: true, // Include sender details
        receiver: true, // Include receiver details
        chat: true, // Include chat details
      },
      orderBy: {
        time: "desc", // Sort by most recent messages
      },
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};
