const getStripeConfig = async (req, res) => {
  try {
    res.status(200).json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Error getting Stripe config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Stripe configuration',
      error: error.message
    });
  }
};

module.exports = {
  getStripeConfig
}; 