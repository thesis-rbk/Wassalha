require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
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

// Initialize sockets
trackingSocket(server);

// Use `server.listen()` instead of `app.listen()`
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
