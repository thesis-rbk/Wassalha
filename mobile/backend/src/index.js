require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const requestRoutes = require("./routes/requestRoutes");

// const userRoutes = require("./routes/userRoutes");
const http = require("http"); // Required for Socket.IO

// Import routes
const productRoutes = require("./routes/productRoutes");

// Import tracking socket
const trackingSocket = require("./sockets/trackingSocket");

const app = express();
const server = http.createServer(app); // Create HTTP server

// Middleware
app.use(cors());
app.use(express.json());

// Routes (REST API will still work)
app.use("/api/products", productRoutes);
// Routes
app.use("/api/requests", requestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Initialize sockets
trackingSocket(server);

// Use `server.listen()` instead of `app.listen()`
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
