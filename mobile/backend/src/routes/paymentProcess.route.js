const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/paymentProcess.controller");

/**
 * @route POST /api/payment/create-payment-intent
 * @description Create a payment intent for regular payments
 * @access Public
 */
router.post("/create-payment-intent", stripeController.createPaymentIntent);

/**
 * @route POST /api/payment/create-escrow-payment-intent
 * @description Create an escrow payment intent for order payments
 * @access Public
 */
router.post(
  "/create-escrow-payment-intent",
  stripeController.createEscrowPaymentIntent
);

/**
 * @route POST /api/payment/capture-escrow-payment
 * @description Capture an escrow payment when delivery is confirmed
 * @access Public
 */
router.post("/capture-escrow-payment", stripeController.captureEscrowPayment);

/**
 * @route POST /api/payment/cancel-escrow-payment
 * @description Cancel an escrow payment if delivery fails
 * @access Public
 */
router.post("/cancel-escrow-payment", stripeController.cancelEscrowPayment);

module.exports = router;
