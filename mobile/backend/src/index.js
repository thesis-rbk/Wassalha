const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.route");

// const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
// Routes
app.use("/api/users", userRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
