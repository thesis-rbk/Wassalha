require("dotenv").config();
const Stripe = require("stripe");
const stripeService = require("../services/stripe.service");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Create a payment intent for regular payments
 */
const createPaymentIntent = async (req, res) => {
  console.log("Received request to create payment intent");

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1099, // $10.99 USD
      currency: "usd",
      payment_method_types: ["card"],
    });

    const clientSecret = paymentIntent.client_secret;

    console.log("Payment intent created successfully:", clientSecret);

    res.json({
      clientSecret: clientSecret,
    });
  } catch (e) {
    console.error("Error creating payment intent:", e.message);
    res.status(500).json({ error: e.message });
  }
};

/**
 * Create an escrow payment intent for order payments
 */
const createEscrowPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, buyerId, sellerId } = req.body;

    if (!orderId || !amount || !buyerId || !sellerId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: orderId, amount, buyerId, sellerId",
      });
    }

    // Create escrow payment intent using the service
    const paymentIntent = await stripeService.createEscrowPaymentIntent({
      orderId,
      amount,
      buyerId,
      sellerId,
    });

    // Update the payment record in the database
    await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        amount: parseFloat(amount),
        currency: "DOLLAR",
        status: "PENDING",
        paymentMethod: "STRIPE",
        transactionId: paymentIntent.paymentIntentId,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
    });
  } catch (error) {
    console.error("Error creating escrow payment intent:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Capture an escrow payment when delivery is confirmed
 */
const captureEscrowPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID is required",
      });
    }

    // Capture the payment using the service
    const result = await stripeService.captureEscrowPayment(paymentIntentId);

    // Update payment status in the database
    const payment = await prisma.payment.findFirst({
      where: { transactionId: paymentIntentId },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "COMPLETED" },
      });

      // Update order payment status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "PAYED" },
      });
    }

    res.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    console.error("Error capturing escrow payment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Cancel an escrow payment if delivery fails
 */
const cancelEscrowPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: "Payment intent ID is required",
      });
    }

    // Cancel the payment using the service
    const result = await stripeService.cancelEscrowPayment(paymentIntentId);

    // Update payment status in the database
    const payment = await prisma.payment.findFirst({
      where: { transactionId: paymentIntentId },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUND" },
      });

      // Update order payment status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "REFUNDED" },
      });
    }

    res.json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    console.error("Error canceling escrow payment:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentIntent,
  createEscrowPaymentIntent,
  captureEscrowPayment,
  cancelEscrowPayment,
};
