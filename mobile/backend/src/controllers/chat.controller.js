const prisma = require("../../prisma/index");
const chatService = require("../services/chatService");
const path = require('path');

// Get all chats for a user (both as requester and provider)
const getUserChats = async (req, res) => {
  const userId = req.user.id;
  console.log("🔍 Getting chats for user:", userId);

  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        goods: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            time: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    console.log("✅ Found chats:", chats.length);
    res.status(200).json(chats);
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message,
    });
  }
};

// Get a single chat by ID
const getChatById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log(`🔍 Getting chat ${id} for user ${userId}`);

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: parseInt(id) },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                imageId: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        goods: true,
      },
    });

    // Check if chat exists and user is a participant
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat not found" });
    }

    if (chat.requesterId !== userId && chat.providerId !== userId) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access to chat" });
    }

    console.log("✅ Chat found");
    res.status(200).json(chat);
  } catch (error) {
    console.error("❌ Error fetching chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat",
      error: error.message,
    });
  }
};

// Get chat messages
const getChatMessages = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log(`🔍 Getting messages for chat ${id}`);

  try {
    // First check if user is part of this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(id),
        OR: [{ requesterId: userId }, { providerId: userId }],
      },
    });

    if (!chat) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access to chat" });
    }

    // Get messages with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await prisma.message.findMany({
      where: { chatId: parseInt(id) },
      orderBy: { time: "desc" },
      skip,
      take: limit,
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

    // Count total messages
    const totalMessages = await prisma.message.count({
      where: { chatId: parseInt(id) },
    });

    console.log(`✅ Found ${messages.length} messages`);
    res.status(200).json({
      data: messages,
      page,
      limit,
      total: totalMessages,
      totalPages: Math.ceil(totalMessages / limit),
    });
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat messages",
      error: error.message,
    });
  }
};

// Create a new chat
const createChat = async (req, res) => {
  const { requesterId, providerId, productId } = req.body;
  console.log("🆕 Creating new chat", { requesterId, providerId, productId });

  // Check if current user is requester or provider
  const userId = req.user.id;
  if (userId !== parseInt(requesterId) && userId !== parseInt(providerId)) {
    return res.status(403).json({
      success: false,
      message: "You can only create chats where you are a participant",
    });
  }

  try {
    // Check if chat already exists between these users for this product
    const existingChat = await prisma.chat.findFirst({
      where: {
        requesterId: parseInt(requesterId),
        providerId: parseInt(providerId),
        productId: parseInt(productId),
      },
    });

    if (existingChat) {
      console.log("⚠️ Chat already exists:", existingChat.id);
      return res.status(200).json(existingChat);
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        requesterId: parseInt(requesterId),
        providerId: parseInt(providerId),
        productId: parseInt(productId),
      },
    });

    console.log("✅ Chat created:", newChat.id);
    res.status(201).json(newChat);
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
      error: error.message,
    });
  }
};

// Create a new message
const createMessage = async (req, res) => {
  const { id } = req.params;
  const { content, type = "text", mediaId } = req.body;
  const senderId = req.user.id;

  try {
    const message = await chatService.createMessage(
      parseInt(id),
      senderId,
      content,
      type,
      mediaId
    );

    res.status(201).json(message);
  } catch (error) {
    console.error("❌ Error creating message:", error);

    // Handle specific errors with appropriate status codes
    if (error.message === "Chat not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error.message === "Unauthorized access to chat") {
      return res.status(403).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create message",
      error: error.message,
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const messagesRead = await chatService.markMessagesAsRead(
      parseInt(id),
      userId
    );

    res.status(200).json({
      success: true,
      messagesRead,
    });
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);

    // Handle specific errors
    if (error.message === "Chat not found") {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error.message === "Unauthorized access to chat") {
      return res.status(403).json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

/**
 * Controller method to handle file uploads for chat messages
 * This allows users to send files (images, documents, etc.) in chat
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with upload result
 */
const uploadChatFile = async (req, res) => {
  const { id } = req.params; // Get chat ID from URL parameters
  const userId = req.user.id; // Get current user ID from authenticated user
  
  console.log(`📤 Uploading file for chat ${id} by user ${userId}`);
  
  try {
    // Step 1: Verify that a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false, 
        message: 'No file uploaded'
      });
    }
    
    // Log file details for debugging
    console.log('File details:', req.file);
    
    // Step 2: Check if user is a participant in this chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { requesterId: userId },
          { providerId: userId }
        ]
      }
    });
    
    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to chat'
      });
    }
    
    // Step 3: Determine file type based on extension and MIME type
    // Get file extension (defaulting to empty string if undefined)
    const originalName = req.file.originalname || req.file.filename || '';
    const fileExt = path.extname(originalName).toLowerCase();
    
    // Initialize mediaType based on both extension and MIME type
    let mediaType = 'DOCUMENT'; // Default type
    let fileExtensionForDb = 'OTHER'; // Default extension for database
    
    // Determine mediaType based on extension
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(fileExt)) {
      mediaType = 'IMAGE';
      // Map to valid enum values
      fileExtensionForDb = fileExt === '.jpg' ? 'JPG' : 
                          fileExt === '.jpeg' ? 'JPEG' : 
                          fileExt === '.png' ? 'PNG' : 
                          fileExt === '.gif' ? 'GIF' : 
                          fileExt === '.bmp' ? 'OTHER' : 
                          fileExt === '.webp' ? 'OTHER' : 'OTHER';
    } else if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(fileExt)) {
      mediaType = 'VIDEO';
      fileExtensionForDb = 'OTHER'; // Set appropriate enum if you have VIDEO extensions
    } else if (['.mp3', '.wav', '.ogg', '.m4a'].includes(fileExt)) {
      mediaType = 'AUDIO';
      fileExtensionForDb = 'OTHER'; // Set appropriate enum if you have AUDIO extensions
    } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(fileExt)) {
      mediaType = 'DOCUMENT';
      // Map to valid enum values
      fileExtensionForDb = fileExt === '.pdf' ? 'PDF' : 
                          fileExt === '.doc' ? 'DOC' : 
                          fileExt === '.docx' ? 'DOCX' : 
                          fileExt === '.xls' ? 'XLS' : 
                          fileExt === '.xlsx' ? 'XLSX' : 'OTHER';
    } else {
      // For unknown extensions, try to determine from MIME type as a fallback
      const mimeType = req.file.mimetype || '';
      
      if (mimeType.startsWith('image/')) {
        mediaType = 'IMAGE';
      } else if (mimeType.startsWith('video/')) {
        mediaType = 'VIDEO';
      } else if (mimeType.startsWith('audio/')) {
        mediaType = 'AUDIO';
      } else if (mimeType.includes('pdf') || 
                mimeType.includes('word') || 
                mimeType.includes('excel') || 
                mimeType.includes('powerpoint') ||
                mimeType.includes('text/')) {
        mediaType = 'DOCUMENT';
      }
      
      fileExtensionForDb = 'OTHER';
    }
    
    // Extract clean extension (without the dot) for logging
    const cleanExtension = fileExt ? fileExt.substring(1) : 'unknown';
    console.log(`File type determined: ${mediaType}, Extension: ${cleanExtension}`);
    
    // Step 4: Create a new record in the Media table
    const media = await prisma.media.create({
      data: {
        url: `/api/uploads/${req.file.filename}`,
        type: mediaType, // MediaType enum from our schema
        mimeType: req.file.mimetype || 'application/octet-stream', // Default MIME if not available
        extension: fileExtensionForDb, // FileExtension enum from our schema
        filename: originalName,
        size: req.file.size || 0 // Default to 0 if size is not available
      }
    });
    
    console.log('Created media:', media);
    
    // Step 5: Return success response with media details
    res.status(201).json({
      success: true,
      mediaId: media.id,
      url: `/api/uploads/${req.file.filename}`,
      type: mediaType,
      extension: cleanExtension,
      filename: originalName,
      mimeType: req.file.mimetype
    });
    
  } catch (error) {
    // Step 6: Handle errors, including potential Prisma validation errors
    console.error("❌ Error uploading chat file:", error);
    
    // Check for specific error types
    if (error.name === 'PrismaClientValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid file data for database',
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

module.exports = {
  getUserChats,
  getChatById,
  getChatMessages,
  createChat,
  createMessage,
  markMessagesAsRead,
  uploadChatFile,
};
