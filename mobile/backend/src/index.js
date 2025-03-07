require("dotenv").config();

// Import dependencies
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path"); // Import path module

// Import routes
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/user.route");
const goodsRoutes = require("./routes/goods.route"); // Import goods routes
const fetchRoute = require("./routes/fetchAll")
require("dotenv").config();

// const userRoutes = require("./routes/userRoutes");

// Import routes
const productRoutes = require("./routes/productRoutes");
const scrapeRoutes = require("./routes/scrapeRoutes");
const categoryRoutes = require("./routes/category.route");
const profileRoutes = require("./routes/profileRoutes");
const goodsPostRoutes = require("./routes/goodsPost.route"); // Import goods post routes
const orderRoutes = require("./routes/order.route"); // Import order routes
const promoPostRoutes = require("./routes/promoPost.route"); // Import promo post routes
const paymentRoutes = require("./routes/payment.route"); // Import payment routes
const pickupRoutes = require("./routes/pickup.route"); // Import pickup routes
const serviceProviderRoutes = require("./routes/serviceProvider.route"); // Import service provider routes

// Import socket
const trackingSocket = require("./sockets/trackingSocket");
const all = require("./routes/alltravNpost");
const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the "uploads" directory
app.use('/api/uploads', express.static(path.join(__dirname, '/uploads'))); // Serve static files
// console.log("pathsssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss", path.join(__dirname, 'src/uploads'));
app.use("/api/fecth", fetchRoute)
// Routes

// Routes (REST API will still work)
app.use("/api/products", productRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api", all);
// Routes
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goods", goodsRoutes); // Set up goods routes
app.use("/api/goods-posts", goodsPostRoutes); // Set up goods post routes
app.use("/api/categories", categoryRoutes);
app.use("/api/users/profile", profileRoutes); // Set up profile routes
app.use("/api/orders", orderRoutes); // Set up order routes
app.use("/api/promo-posts", promoPostRoutes); // Set up promo post routes
app.use("/api/payments", paymentRoutes); // Set up payment routes
app.use("/api/pickups", pickupRoutes); // Set up pickups route
app.use("/api/service-providers", serviceProviderRoutes); // Set up service provider routes

// Import sponsorship routes
const sponsorshipRoutes = require("./routes/sponsorship.route");

app.use("/api/sponsorships", sponsorshipRoutes); // Set up sponsorship routes

// Import subscription routes
const subscriptionRoutes = require("./routes/subscription.route"); // Import subscription routes

app.use("/api/subscriptions", subscriptionRoutes); // Set up subscription routes

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
