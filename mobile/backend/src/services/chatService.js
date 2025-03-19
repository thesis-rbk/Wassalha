const prisma = require("../../prisma/index");
const { getIO } = require("../sockets");

/**
 * Chat service with reusable business logic
 */
const chatService = {
  /**
   * Create a new message
   */
  async createMessage(
    chatId,
    senderId,
    content,
    type = "text",
    mediaId = null
  ) {
    // Find the chat to get the other user's ID
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(chatId) },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Ensure sender is part of this chat
    if (chat.requesterId !== senderId && chat.providerId !== senderId) {
      throw new Error("Unauthorized access to chat");
    }

    // Determine receiver ID (the other user)
    const receiverId =
      chat.requesterId === senderId ? chat.providerId : chat.requesterId;

    // Create the message
    const message = await prisma.message.create({
      data: {
        chatId: parseInt(chatId),
        senderId,
        receiverId,
        type,
        content,
        mediaId: mediaId ? parseInt(mediaId) : undefined,
        isRead: false,
        time: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageId: true,
              },
            },
          },
        },
        media: true,
      },
    });

    // Emit to chat room
    const io = getIO();
    io.of("/chat").to(`chat_${chatId}`).emit("receive_message", message);

    return message;
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId, userId) {
    // Find the chat
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(chatId) },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Ensure user is part of this chat
    if (chat.requesterId !== userId && chat.providerId !== userId) {
      throw new Error("Unauthorized access to chat");
    }

    // Mark all messages from the other user as read
    const result = await prisma.message.updateMany({
      where: {
        chatId: parseInt(chatId),
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Notify the sender that their messages were read
    const io = getIO();
    io.of("/chat")
      .to(`chat_${chatId}`)
      .emit("message_read", {
        chatId: parseInt(chatId),
        readBy: userId,
        count: result.count,
      });

    return result.count;
  },

  /**
   * Mark a single message as read
   */
  async markMessageAsRead(messageId, userId) {
    // Find the message
    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
      include: { chat: true },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // Ensure user is the recipient
    if (message.receiverId !== userId) {
      throw new Error("Unauthorized access to message");
    }

    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: { isRead: true },
    });

    // Notify the sender
    const io = getIO();
    io.of("/chat").to(`chat_${message.chatId}`).emit("message_read", {
      messageId,
      chatId: message.chatId,
    });

    return updatedMessage;
  },
};

module.exports = chatService;
