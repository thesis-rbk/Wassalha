const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/paymentProcess.controller");

router.post("/create-payment", stripeController.payWithFlouci);
router.get("/verify/:paymentId", stripeController.verifyFlouciPayment);

// Webhook endpoints for Flouci
router.post("/webhook/success", stripeController.handlePaymentSuccessWebhook);
router.post("/webhook/fail", stripeController.handlePaymentFailureWebhook);
module.exports = router;
