require("dotenv").config();

// Import Socket.IO server and our feature handlers
const { Server } = require("socket.io");
const notificationHandlers = require("./notifications/notificationSocket");
const processTrackSocket = require("./processTrack/processTrackSocket");
const { trackingHandlers } = require("./tracking/trackingSocket");
const {
  chatHandlers,
  authenticateSocket,
  setIO,
} = require("./chat/chatSocket");
const pickupSocket = require("./pickupSocket/pickupSocket"); // Adjust path if needed

// ADD THIS: Create authentication middleware for notifications
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma/index");

// Global socket instance - kept outside function so it can be accessed by getIO()
let io;

// Authentication middleware for notification sockets
const authenticateNotificationSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error("Notification socket authentication error:", error);
    next(new Error("Invalid or expired token"));
  }
};

// Main socket initialization function - takes HTTP server as parameter
const initializeSocket = (server) => {
  // Create single Socket.IO instance with CORS settings
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins (modify in production)
      methods: ["GET", "POST"], // Allowed HTTP methods
    },
  });

  // Pass the io instance to chatSocket
  setIO(io);

  // Create separate channels (namespaces) for different features
  const notifications = io.of("/notifications");
  const tracking = io.of("/tracking");
  const chat = io.of("/chat");
  const pickup = io.of("/pickup");
  const processTrack = io.of("/processTrack");

  // Set up processTrack handlers once
  processTrackSocket(processTrack);

  // Handle connections to notification namespace
  notifications
    .use(authenticateNotificationSocket)
    .on("connection", (socket) => {
      console.log(
        "👋 User connected to notifications:",
        socket.id,
        "User:",
        socket.user.id
      );
      notificationHandlers(socket);
    });

  // Handle connections to tracking namespace
  tracking.on("connection", (socket) => {
    console.log("✈️ Client connected to tracking:", socket.id);
    trackingHandlers(socket);
  });

  // Handle connections to chat namespace
  chat.use(authenticateSocket).on("connection", (socket) => {
    console.log("💬 Client connected to chat:", socket.id);
    chatHandlers(socket);
  });

  // Handle connections to pickup namespace
  pickup.on("connection", (socket) => {
    console.log("🚚 Client connected to pickup:", socket.id);
    pickupSocket(pickup); // Pass the pickup namespace to pickupSocket
  });

  return io;
};

// Helper function to access socket instance from other parts of the app
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Export functions to be used in main server file
module.exports = {
  initializeSocket,
  getIO,
};
