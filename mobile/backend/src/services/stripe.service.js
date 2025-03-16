const Stripe = require("stripe");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Service for handling Stripe payment operations
 */
class StripeService {
  /**
   * Create a payment intent for an order with escrow functionality
   * @param {Object} orderData - Order data including amount and currency
   * @returns {Object} Payment intent details
   */
  async createEscrowPaymentIntent(orderData) {
    try {
      // Calculate amount in cents (Stripe requires amounts in smallest currency unit)
      const amount = Math.round(orderData.amount * 100);

      // Create a payment intent with metadata for escrow tracking
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd", // Default to USD, can be made dynamic
        payment_method_types: ["card"],
        capture_method: "manual", // This enables the escrow functionality
        metadata: {
          orderId: orderData.orderId,
          isEscrow: "true",
          buyerId: orderData.buyerId,
          sellerId: orderData.sellerId,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error("Error creating escrow payment intent:", error);
      throw error;
    }
  }

  /**
   * Capture a payment (release from escrow) when delivery is confirmed
   * @param {string} paymentIntentId - The ID of the payment intent to capture
   * @returns {Object} Capture result
   */
  async captureEscrowPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.capture(
        paymentIntentId
      );
      return {
        success: true,
        status: paymentIntent.status,
        id: paymentIntent.id,
      };
    } catch (error) {
      console.error("Error capturing escrow payment:", error);
      throw error;
    }
  }

  /**
   * Cancel a payment intent (refund escrow) if delivery fails
   * @param {string} paymentIntentId - The ID of the payment intent to cancel
   * @returns {Object} Cancel result
   */
  async cancelEscrowPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return {
        success: true,
        status: paymentIntent.status,
        id: paymentIntent.id,
      };
    } catch (error) {
      console.error("Error canceling escrow payment:", error);
      throw error;
    }
  }

  /**
   * Get payment intent details
   * @param {string} paymentIntentId - The ID of the payment intent
   * @returns {Object} Payment intent details
   */
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent;
    } catch (error) {
      console.error("Error retrieving payment intent:", error);
      throw error;
    }
  }
}

module.exports = new StripeService();
