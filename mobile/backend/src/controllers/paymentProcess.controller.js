require("dotenv").config();
const prisma = require("../../prisma");
const Stripe = require("stripe");
const stripeService = require("../services/stripe.service");

// Configure Stripe environment
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Create a payment intent for regular payments
 */
const createPaymentIntent = async (req, res) => {
  console.log("Received request to create payment intent", req.body);
  const { amount, currency, orderId } = req.body;

  try {
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ["card"],
    });

    const clientSecret = paymentIntent.client_secret;

    console.log("Payment intent created successfully:", clientSecret);

    // Create a Payment record in the database
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        amount: parseFloat(amount / 100), // Convert cents to dollars
        currency: currency.toUpperCase(),
        status: "PENDING",
        paymentMethod: "STRIPE",
        transactionId: paymentIntent.id,
      },
    });

    const updatedOrder = await prisma.goodsProcess.update({
      where: { orderId: parseInt(orderId) },
      data: {
        status: "PAID",
      },
    });

    res.json({
      clientSecret: clientSecret,
      paymentId: payment.id,
      updatedOrder: updatedOrder,
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
    const { orderId, amount, requesterId, travelerId } = req.body;

    if (!orderId || !amount || !requesterId || !travelerId) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: orderId, amount, requesterId, travelerId",
      });
    }

    // Create escrow payment intent using the service
    const paymentIntent = await stripeService.createEscrowPaymentIntent({
      orderId,
      amount,
      requesterId,
      travelerId,
    });

    // Create a Payment record in the database
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        amount: parseFloat(amount),
        currency: "USD",
        status: "PENDING",
        paymentMethod: "STRIPE",
        transactionId: paymentIntent.paymentIntentId,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      paymentId: payment.id, // Return the payment ID for reference
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
