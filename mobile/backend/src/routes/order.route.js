const express = require("express");
const { getOrderDetails } = require("../controllers/order.controller");

const router = express.Router();

// Route to fetch categories
router.get("/:orderId", getOrderDetails);

module.exports = router;
