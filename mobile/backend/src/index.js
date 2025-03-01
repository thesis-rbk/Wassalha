require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/user.route");
require('dotenv').config();

// const userRoutes = require("./routes/userRoutes");
const http = require("http"); // Required for Socket.IO

// Import routes
const productRoutes = require("./routes/productRoutes");

// Import tracking socket
// const trackingSocket = require("./sockets/trackingSocket");

const all = require("./routes/alltravNpost");
const app = express();
const server = http.createServer(app); // Create HTTP server (This is used by both Express and Socket.IO)


// Middleware
app.use(cors());
app.use(express.json());


// Routes (REST API will still work)
app.use("/api/products", productRoutes);
app.use("/api", all);
// Routes
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

// Initialize sockets
// trackingSocket(server); // Initialize the Socket.IO server with the same HTTP server

// Use `server.listen()` instead of `app.listen()`
// **Why:** 
// The reason we need to use `server.listen()` here is because Express (`app`) is now being handled 
// by the underlying HTTP server (`server`) that we created with `http.createServer(app)`. This allows us to 
// run both Express routes and Socket.IO on the same server, preventing conflicts.
// 
// If we were to use `app.listen()` and `server.listen()` both, it would try to listen on the same port twice,
// which will result in an error.

const PORT = process.env.PORT || 5000;
// server.listen() allows us to start the HTTP server and enable Socket.IO communication on the same port
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// **Conflicting line (to be commented out):**
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// This line is unnecessary since `server.listen()` is already serving both Express and Socket.IO.
