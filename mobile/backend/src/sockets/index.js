// Import Socket.IO server and our feature handlers
const { Server } = require('socket.io');
const notificationHandlers = require('./notifications/notificationSocket');
const { trackingHandlers } = require('./tracking/trackingSocket');
const chatHandlers = require('./chat/chatSocket');

// Global socket instance - kept outside function so it can be accessed by getIO()
let io;

// Main socket initialization function - takes HTTP server as parameter
const initializeSocket = (server) => {
    // Create single Socket.IO instance with CORS settings
    // This is our main socket server that all features will use
    io = new Server(server, {
        cors: {
            origin: "*",     // Allow all origins (modify in production)
            methods: ["GET", "POST"]  // Allowed HTTP methods
        }
    });

    // Create separate channels (namespaces) for different features
    // This helps organize different socket functionalities
    const notifications = io.of('/notifications');  // Notification channel
    const tracking = io.of('/tracking');           // Tracking channel
    const chat = io.of('/chat');                  // Chat channel

    // Handle connections to notification namespace
    notifications.on('connection', (socket) => {
        console.log('👋 User connected to notifications:', socket.id);
        // Pass socket to notification handlers to manage notification events
        notificationHandlers(socket);
    });

    // Handle connections to tracking namespace
    tracking.on('connection', (socket) => {
        console.log('✈️ Client connected to tracking:', socket.id);
        // Pass socket to tracking handlers to manage tracking events
        trackingHandlers(socket);
    });

    // Handle connections to chat namespace
    chat.on('connection', (socket) => {
        console.log('💬 Client connected to chat:', socket.id);
        // Pass socket to chat handlers to manage chat events
        chatHandlers(socket);
    });

    return io;
};

// Helper function to access socket instance from other parts of the app
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Export functions to be used in main server file
module.exports = {
    initializeSocket,
    getIO
};