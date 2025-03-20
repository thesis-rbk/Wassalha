// mobile/backend/src/routes/chat.route.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { authenticateUser } = require("../middleware/middleware");
const upload = require("../middleware/multerMiddleware");

/**
 * Chat Routes
 * These routes handle chat-related operations including file uploads
 */

// All routes require authentication
router.use(authenticateUser);

// Get all chats for the current user
router.get("/", chatController.getUserChats);

// Get a specific chat by ID
router.get("/:id", chatController.getChatById);

// Get messages for a specific chat
router.get("/:id/messages", chatController.getChatMessages);

// Create a new chat
router.post("/", chatController.createChat);

// Add a message to a chat
router.post("/:id/messages", chatController.createMessage);

/**
 * File Upload Route for Chat
 * This route allows users to upload files to a chat
 * - Uses multer middleware to handle multipart form data
 * - The uploaded file is processed by the uploadChatFile controller
 * - The file is stored in the uploads directory and a media record is created
 */
router.post("/:id/upload", (req, res, next) => {
  console.log('Received chat file upload request');
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        success: false, 
        error: err.message,
        message: 'File upload failed'
      });
    }
    next();
  });
}, chatController.uploadChatFile);

// Mark messages as read
router.patch("/:id/messages/read", chatController.markMessagesAsRead);

// Add logging middleware to track all chat route access
router.use((req, res, next) => {
  console.log("📡 Chat route accessed:", {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  });
  next();
});

module.exports = router;
