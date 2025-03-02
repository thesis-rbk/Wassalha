require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const http = require("http");

// Import routes
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/user.route");
require('dotenv').config();

// const userRoutes = require("./routes/userRoutes");


// Import routes
const productRoutes = require("./routes/productRoutes");
const scrapeRoutes = require("./routes/scrapeRoutes");

// Import socket
const trackingSocket = require("./sockets/trackingSocket");

const all = require("./routes/alltravNpost");
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/scrape", scrapeRoutes);
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

// Initialize socket
trackingSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
