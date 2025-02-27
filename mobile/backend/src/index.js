const express = require("express");
const cors = require("cors");
const requestRoutes = require("./routes/requestRoutes");
require('dotenv').config();

// const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const all = require("./routes/alltravNpost");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api", all);
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
