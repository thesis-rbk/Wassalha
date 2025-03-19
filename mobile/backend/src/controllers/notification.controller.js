const prisma = require("../../prisma/index");

const getAllNotifications = async (req, res) => {
  console.log("📥 Getting all notifications request");
  console.log("👤 User ID:", req.user.id);

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        id: "desc", // Newest first
      },
      include: {
        request: true,
        order: true,
        pickup: true,
      },
    });

    console.log("✅ Notifications fetched successfully:", notifications.length);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Error in getAllNotifications:", error);
    console.error("Stack trace:", error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getUnreadCount = async (req, res) => {
  console.log("📥 Getting unread count request");
  console.log("👤 User ID:", req.user.id);

  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        status: "UNREAD",
      },
    });

    console.log("✅ Unread count fetched successfully:", count);
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("❌ Error in getUnreadCount:", error);
    console.error("Stack trace:", error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  console.log("📥 Mark as read request");
  console.log("👤 User ID:", req.user.id);
  console.log("📝 Notification ID:", req.params.id);

  try {
    const notificationId = parseInt(req.params.id);

    // First check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: req.user.id,
      },
    });

    if (!existingNotification) {
      console.log("❌ Notification not found or unauthorized");
      return res.status(404).json({
        success: false,
        error: "Notification not found or unauthorized",
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        status: "READ",
      },
    });

    console.log("✅ Notification marked as read successfully");
    res.status(200).json({
      success: true,
      data: updatedNotification,
    });
  } catch (error) {
    console.error("❌ Error in markAsRead:", error);
    console.error("Stack trace:", error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  console.log("📥 Delete notification request");
  console.log("👤 User ID:", req.user.id);
  console.log("📝 Notification ID:", req.params.id);

  try {
    const notificationId = parseInt(req.params.id);

    // First check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: req.user.id,
      },
    });

    if (!existingNotification) {
      console.log("❌ Notification not found or unauthorized");
      return res.status(404).json({
        success: false,
        error: "Notification not found or unauthorized",
      });
    }

    // Delete the notification
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    console.log("✅ Notification deleted successfully");
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error in deleteNotification:", error);
    console.error("Stack trace:", error.stack);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification,
};
