require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

// Import routes
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/user.route");
const productRoutes = require("./routes/productRoutes");
const scrapeRoutes = require("./routes/scrapeRoutes");
const categoryRoutes = require("./routes/category.route");
const profileRoutes = require("./routes/profileRoutes");
const mediaRoutes = require("./routes/media.route");
const all = require("./routes/alltravNpost");
// Import socket
const trackingSocket = require("./sockets/trackingSocket");



// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());




// Set up uploads directory
const createUploadsDir = require('./utils/createUploadsDir');
createUploadsDir();
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Routes

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api", all);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users/profile", profileRoutes);
app.use("/api/media", mediaRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});



// Initialize socket
trackingSocket(server);

// Start server
// Use `server.listen()` instead of `app.listen()`
// **Why:**
// The reason we need to use `server.listen()` here is because Express (`app`) is now being handled
// by the underlying HTTP server (`server`) that we created with `http.createServer(app)`. This allows us to
// run both Express routes and Socket.IO on the same server, preventing conflicts.
//
// If we were to use `app.listen()` and `server.listen()` both, it would try to listen on the same port twice,
// which will result in an error.

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
