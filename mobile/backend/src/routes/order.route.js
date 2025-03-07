const express = require("express");
const { getOrders, createOrder, updateOrder, deleteOrder } = require("../controllers/order.controller");

const router = express.Router();

// Route to fetch all orders
router.get("/", getOrders);

// Route to create a new order
router.post("/", createOrder);

// Route to update an order
router.put("/:id", updateOrder);

// Route to delete an order
router.delete("/:id", deleteOrder);

module.exports = router; 