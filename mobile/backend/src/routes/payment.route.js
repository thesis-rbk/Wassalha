const express = require("express");
const {
    getPayments,
    createPayment,
    updatePayment,
    deletePayment,
} = require("../controllers/payment.controller");

const router = express.Router();

// Route to fetch all payments
router.get("/", getPayments);

// Route to create a new payment
router.post("/", createPayment);

// Route to update a payment
router.put("/:id", updatePayment);

// Route to delete a payment
router.delete("/:id", deletePayment);

module.exports = router; 