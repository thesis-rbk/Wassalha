require("dotenv").config();
const morgan = require("morgan");
// Import dependencies
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

// Import routes
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/user.route");
const goodsRoutes = require("./routes/goods.route");
const fetchRoute = require("./routes/fetchAll");
const productRoutes = require("./routes/productRoutes");
const scrapeRoutes = require("./routes/scrapeRoutes");
const categoryRoutes = require("./routes/category.route");
const profileRoutes = require("./routes/profileRoutes");
const mediaRoutes = require("./routes/media.route");
const all = require("./routes/alltravNpost");
const mobileRequestRoutes = require("./routes/mobileRequestRoutes");
const mobileGoodsRoutes = require("./routes/mobileGoodsRoutes");
const orderRoutes = require("./routes/orderRoutes");
const processRoutes = require("./routes/processRoutes");
const pickupRoutes = require("./routes/pickup.route");
const goodsPostRoutes = require("./routes/goodsPost.route");
const promoPostRoutes = require("./routes/promoPost.route");
const paymentRoutes = require("./routes/payment.route");
const serviceProviderRoutes = require("./routes/serviceProvider.Routes");
const sponsorshipRoutes = require("./routes/sponsorship.route");
const subscriptionRoutes = require("./routes/subscription.route");
const stripeRoutes = require("./routes/stripe.route");
const adminRoutes = require("./routes/admin.route");
const paymentsRoutes = require("./routes/payments.route");

// Import socket
const trackingSocket = require("./sockets/trackingSocket");
const app = express();
const server = http.createServer(app);
app.use(morgan("dev"));

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);
app.use(express.json());

// Serve static files from the "uploads" directory
app.use("/api/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files
app.use("/api/fecth", fetchRoute);

// Routes

// Routes (REST API will still work)
app.use("/api/pickup", pickupRoutes);
app.use("/api/products", productRoutes);
app.use("/api/scrape", scrapeRoutes);

// Routes
// API Routes
app.use("/api", all);
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goods", goodsRoutes);
app.use("/api/goods-posts", goodsPostRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promo-posts", promoPostRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pickups", pickupRoutes);
app.use("/api/service-providers", serviceProviderRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/mobile/requests", mobileRequestRoutes);
app.use("/api/mobile/goods", mobileGoodsRoutes);
app.use("/api/process", processRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/payment", paymentsRoutes);

// Add error logging middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    message: err.message,
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
