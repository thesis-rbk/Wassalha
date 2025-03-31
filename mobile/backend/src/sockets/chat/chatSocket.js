// mobile/backend/src/sockets/chat/chatSocket.js
const prisma = require("../../../prisma/index");
const chatService = require("../../services/chatService");
const jwt = require("jsonwebtoken");

const authenticateSocket = async (socket, next) => {
  try {
    console.log("Authenticating chat socket...");
    
    // Try to get token from auth object
    const token = socket.handshake.auth.token;
    
    if (token) {
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user ID to socket
        socket.user = { id: decoded.id };
        console.log(`✅ Socket authenticated with token for user: ${decoded.id}`);
        return next();
      } catch (error) {
        console.error("JWT verification error:", error.message);
        // Continue to try other auth methods
      }
    }
    
    // If token auth failed, try query/auth userId
    const userId = socket.handshake.query.userId || socket.handshake.auth.userId;
    
    if (userId) {
      // Cast userId to number
      const userIdNum = parseInt(userId, 10);
      if (isNaN(userIdNum)) {
        return next(new Error("Invalid user ID"));
      }
      
      socket.user = { id: userIdNum };
      console.log(`✅ Socket authenticated with userId: ${userIdNum}`);
      return next();
    }
    
    console.error("❌ No valid authentication method found");
    return next(new Error("Authentication required"));
  } catch (error) {
    console.error("Socket authentication error:", error);
    return next(new Error("Authentication failed"));
  }
};

// Store the IO instance
let io;

// Add this function
const setIO = (ioInstance) => {
  io = ioInstance;
};

// Define the chat handlers function with IO parameter
const chatHandlers = (socket) => {
  console.log("🗨️ New chat connection:", socket.id, "User:", socket.user?.id);

  // When a user joins a chat room
  socket.on("join_chat", async (chatId) => {
    if (!chatId) {
      console.log("⚠️ Warning: Attempted to join chat with undefined chatId");
      return;
    }

    try {
      const userId = socket.user?.id;
      if (!userId) {
        socket.emit("error", { message: "Authentication required" });
        return;
      }
      
      // Ensure chatId is a number
      const chatIdNum = parseInt(chatId, 10);
      if (isNaN(chatIdNum)) {
        socket.emit("error", { message: "Invalid chat ID" });
        return;
      }

      // Check if user is part of this chat
      console.log(`Checking if user ${userId} can access chat ${chatIdNum}...`);
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatIdNum,
          OR: [
            { requesterId: userId },
            { providerId: userId }
          ]
        }
      });

      if (!chat) {
        console.error(`⚠️ User ${userId} attempted to join chat ${chatIdNum} without access`);
        socket.emit("error", { message: "Unauthorized access to chat" });
        return;
      }

      console.log(`User ${userId} verified for chat ${chatIdNum}: requester=${chat.requesterId}, provider=${chat.providerId}`);
      
      const roomName = `chat_${chatIdNum}`;
      socket.join(roomName);
      console.log(`👤 User ${userId} joined chat room: ${roomName}`);

      // Send confirmation back to the client
      socket.emit("joined_chat", { room: roomName, chatId: chatIdNum });
    } catch (error) {
      console.error("Error joining chat room:", error);
      socket.emit("error", { message: "Failed to join chat room" });
    }
  });

  // When a user sends a message
  socket.on("send_message", async (data) => {
    try {
      const userId = socket.user?.id;
      if (!userId) {
        socket.emit("error", { message: "Authentication required" });
        return;
      }
      
      console.log(`User ${userId} attempting to send message to chat ${data.chatId}`);

      // Parse chatId as number
      const chatId = parseInt(data.chatId, 10);
      if (isNaN(chatId)) {
        socket.emit("error", { message: "Invalid chat ID" });
        return;
      }

      // Find the chat to get the other user's ID
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }

      // Ensure sender is part of this chat
      if (chat.requesterId !== userId && chat.providerId !== userId) {
        console.error(`❌ User ${userId} attempted to send message in chat ${chatId} - requester=${chat.requesterId}, provider=${chat.providerId}`);
        throw new Error("Unauthorized access to chat");
      }

      // Determine receiver ID (the other user)
      const receiverId =
        chat.requesterId === userId ? chat.providerId : chat.requesterId;

      console.log(`Creating message from ${userId} to ${receiverId} in chat ${chatId}`);
      
      // Create the message
      const message = await prisma.message.create({
        data: {
          chatId: chatId,
          senderId: userId,
          receiverId,
          type: data.type || "text",
          content: data.content,
          mediaId: data.mediaId ? parseInt(data.mediaId) : undefined,
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

      console.log(`Message created with ID ${message.id}, broadcasting to room chat_${chatId}`);
      
      // Use the stored io instead of getIO()
      if (io) {
        //io.of("/chat").to(`chat_${chatId}`).emit("receive_message", message);
        io.of("/chat").to(`chat_${chatId}`).except(socket.id).emit("receive_message", message);
      } else {
        console.error("IO instance not available");
      }

      // Confirm to sender
      socket.emit("message_sent", {
        success: true,
        messageId: message.id,
        timestamp: message.time,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", {
        message: error.message || "Failed to send message",
      });
    }
  });

  // When a user marks a message as read
  socket.on("mark_read", async (data) => {
    try {
      const { messageId } = data;
      const userId = socket.user?.id;

      if (!userId) {
        socket.emit("error", { message: "Authentication required" });
        return;
      }

      // DIRECT IMPLEMENTATION instead of using chatService
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
      if (io) {
        io.of("/chat").to(`chat_${message.chatId}`).emit("message_read", {
          messageId,
          chatId: message.chatId,
        });
      } else {
        console.error("IO instance not available for read receipt");
        // Still mark as read in database even if broadcasting fails
      }

      // Success response
      socket.emit("read_confirmed", { messageId });
    } catch (error) {
      console.error("Error marking message as read:", error);
      socket.emit("error", {
        message: error.message || "Failed to mark message as read",
      });
    }
  });

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log("👋 User disconnected from chat:", socket.id);
  });
};

// Export both functions plus setIO
module.exports = {
  chatHandlers,
  authenticateSocket,
  setIO,
};
