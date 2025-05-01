require("dotenv").config();
const prisma = require("../../prisma");
const axios = require("axios");

const FLOUCI_APP_TOKEN = process.env.FLOUCI_PUBLIC_KEY;
const FLOUCI_APP_SECRET = process.env.FLOUCI_SECRET_KEY;

const payWithFlouci = async (req, res) => {
  const { amount, orderId, travelerId, travelerFee, processId } = req.body;

  // Validate required fields
  if (
    !amount ||
    !orderId ||
    !travelerId ||
    travelerFee === undefined ||
    !processId
  ) {
    return res.status(400).json({
      success: false,
      error:
        "Missing required fields: amount, orderId, travelerId, travelerFee, or processId",
    });
  }

  try {
    // Generate Flouci payment link
    const flouciResponse = await axios.post(
      "https://developers.flouci.com/api/generate_payment",
      {
        app_token: FLOUCI_APP_TOKEN,
        app_secret: FLOUCI_APP_SECRET,
        amount: Math.round(amount * 1000).toString(), // Convert to millimes
        accept_card: "true",
        success_link: "https://www.google.com",
        fail_link: "https://www.youtube.com",
        developer_tracking_id: `order_${orderId}_${Date.now()}`,
        session_timeout_secs: "1200",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const paymentLink = flouciResponse.data?.result?.link;
    const flouciPaymentId = flouciResponse.data?.result?.payment_id;

    if (!paymentLink || !flouciPaymentId) {
      throw new Error(
        "Invalid response from Flouci API - Missing payment link or ID"
      );
    }

    // Create payment record in "PROCESSING" state, store all metadata
    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        amount: parseFloat(amount),
        currency: "TND",
        status: "PROCESSING",
        paymentMethod: "FLOUCI",
        transactionId: flouciPaymentId,
        travelerId: parseInt(travelerId),
        travelerFee: parseFloat(travelerFee),
        processId: parseInt(processId)
      },
    });

    // Return both IDs to frontend
    res.json({
      success: true,
      paymentLink,
      paymentId: payment.id,
      flouciPaymentId, // send this for verification
    });
  } catch (error) {
    console.error("Payment initiation error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to initiate payment process",
    });
  }
};

const verifyFlouciPayment = async (req, res) => {
  const { paymentId } = req.params;

  try {
    // Verify payment with Flouci
    const verification = await axios.get(
      `https://developers.flouci.com/api/verify_payment/${paymentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          apppublic: FLOUCI_APP_TOKEN,
          appsecret: FLOUCI_APP_SECRET,
        },
      }
    );

    const paymentStatus = verification.data?.result?.status;

    if (paymentStatus !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        error: `Payment not completed or failed. Status: ${paymentStatus}`,
      });
    }

    // Get payment record from database using transactionId (Flouci paymentId)
    const payment = await prisma.payment.findUnique({
      where: { transactionId: paymentId },
      include: {
        order: true
      }
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "ON_HOLD" },
    });

    // Update traveler balance
    await prisma.profile.update({
      where: { userId: parseInt(payment.travelerId) },
      data: {
        balance: {
          increment: payment.travelerFee,
        },
      },
    });

    // Update process status
    await prisma.goodsProcess.update({
      where: { id: parseInt(payment.processId) },
      data: { status: "PAID" },
    });

    // Emit socket event for real-time updates
    const { getIO } = require("../sockets");
    const io = getIO();
    io.of("/processTrack").to(`process:${payment.processId}`).emit("confirmPayment", {
      processId: payment.processId
    });

    res.json({
      success: true,
      message: "Payment verified and processed successfully",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify payment",
    });
  }
};

const handlePaymentSuccessWebhook = async (req, res) => {
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ success: false, error: "Missing payment_id in webhook payload" });
    }

    // Get payment record from database using transactionId (Flouci paymentId)
    const payment = await prisma.payment.findUnique({
      where: { transactionId: payment_id },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found" });
    }

    // Only process if payment is still in PROCESSING state
    if (payment.status !== "PROCESSING") {
      return res.json({ 
        success: true, 
        message: "Payment already processed" 
      });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "ON_HOLD" },
    });

    // Update traveler balance
    await prisma.profile.update({
      where: { userId: parseInt(payment.travelerId) },
      data: {
        balance: {
          increment: payment.travelerFee,
        },
      },
    });

    // Update process status
    await prisma.goodsProcess.update({
      where: { id: parseInt(payment.processId) },
      data: { status: "PAID" },
    });

    // Emit socket event for real-time updates
    const { getIO } = require("../sockets");
    const io = getIO();
    io.of("/processTrack").to(`process:${payment.processId}`).emit("confirmPayment", {
      processId: payment.processId
    });

    res.json({ success: true, message: "Payment success webhook processed" });
  } catch (error) {
    console.error("Payment success webhook error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process payment success webhook" });
  }
};

const handlePaymentFailureWebhook = async (req, res) => {
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      return res.status(400).json({ success: false, error: "Missing payment_id in webhook payload" });
    }

    // Optionally, update payment status to FAILED or similar
    const payment = await prisma.payment.findUnique({
      where: { transactionId: payment_id },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found" });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });

    // Emit socket event for real-time updates
    const { getIO } = require("../sockets");
    const io = getIO();
    io.of("/processTrack").to(`process:${payment.processId}`).emit("paymentFailed", {
      processId: payment.processId
    });

    res.json({ success: true, message: "Payment failure webhook processed" });
  } catch (error) {
    console.error("Payment failure webhook error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to process payment failure webhook" });
  }
};

module.exports = {
  payWithFlouci,
  verifyFlouciPayment,
  handlePaymentSuccessWebhook,
  handlePaymentFailureWebhook,
};
