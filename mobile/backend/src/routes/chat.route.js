// mobile/backend/src/routes/chat.route.js
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { authenticateUser } = require("../middleware/middleware");

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

// Add this to your routes
router.post("/:id/messages", chatController.createMessage);

// Add this to your routes
router.patch("/:id/messages/read", chatController.markMessagesAsRead);

// Add logging middleware
router.use((req, res, next) => {
  console.log("📡 Chat route accessed:", {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  });
  next();
});

module.exports = router;
