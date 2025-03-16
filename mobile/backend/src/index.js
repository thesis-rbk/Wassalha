require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io"); // Import Server explicitly
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
const pickupRoutes = require("./routes/pickup.route"); // No need for factory function
const goodsPostRoutes = require("./routes/goodsPost.route");
const promoPostRoutes = require("./routes/promoPost.route");
const paymentRoutes = require("./routes/payment.route");
const serviceProviderRoutes = require("./routes/serviceProvider.Routes");
const sponsorshipRoutes = require("./routes/sponsorship.route");
const subscriptionRoutes = require("./routes/subscription.route");
const stripeRoutes = require("./routes/stripe.route");
const adminRoutes = require("./routes/admin.route");
const paymentProcessRoutes = require("./routes/paymentProcess.route");

// Import socket setup
const setupSocket = require("./sockets/trackingSocket");

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin:"http://172.20.10.3:4000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Pass io to socket setup
setupSocket(io);

app.use(morgan("dev"));

// Middleware
app.use(
  cors({
    origin:"http://172.20.10.3:4000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"],
  })
);
app.use(express.json());

// Serve static files from the "uploads" directory
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", fetchRoute);

// Routes
app.use("/api/pickup", pickupRoutes); // No io needed here
app.use("/api/products", productRoutes);
app.use("/api/scrape", scrapeRoutes);
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
app.use("/api/service-providers", serviceProviderRoutes);
app.use("/api/sponsorships", sponsorshipRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/mobile/requests", mobileRequestRoutes);
app.use("/api/mobile/goods", mobileGoodsRoutes);
app.use("/api/process", processRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/payment-process", paymentProcessRoutes);

// Error logging middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});