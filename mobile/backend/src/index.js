require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");

// Import routes
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/user.route");
const goodsRoutes = require("./routes/goods.route");
const fetchRoute = require("./routes/sponsorSubscription.route");
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
const notificationRoutes = require("./routes/notification.Route");
const chatRoutes = require("./routes/chat.route");
const paymentProcessRoutes = require("./routes/paymentProcess.route");
const sponsorshipProcessRoutes=require("./routes/sponsorshipProcess.routes")
// Import socket initialization function
const { initializeSocket } = require("./sockets/index");

const app = express();
const server = http.createServer(app);

// Logging middleware
app.use(morgan("dev"));

// Global middlewares
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

// Static uploads folder
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api", fetchRoute); // sponsorSubscription.route
app.use("/api/requests", requestRoutes);
app.use("/api/users", userRoutes);
app.use("/api/goods", goodsRoutes);
app.use("/api/goods-posts", goodsPostRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users/profile", profileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/promo-posts", promoPostRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pickup", pickupRoutes); // only once now
app.use("/api/service-providers", serviceProviderRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/products", productRoutes);
app.use("/api/scrape", scrapeRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/mobile/requests", mobileRequestRoutes);
app.use("/api/mobile/goods", mobileGoodsRoutes);
app.use("/api/process", processRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api", all); // I kept this last since it may include mixed routes
app.use("/api/payment-process", paymentProcessRoutes);
app.use('/api/sponsorship-process',sponsorshipProcessRoutes);
// Health check
app.get("/api/health", (req, res) => {
  console.log("Health check request received");
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    message: err.message,
  });
});

// Initialize socket
initializeSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
