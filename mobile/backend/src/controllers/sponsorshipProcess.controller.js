const prisma = require('../../prisma/index');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for verification images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/verification');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'verification-' + uniqueSuffix + path.extname(file.originalname));
  }
});

exports.upload = multer({ storage });

// Initiate a new sponsorship process
exports.initiateSponsorshipProcess = async (req, res) => {
  try {
    const { sponsorshipId, recipientId } = req.body;

    // Validate input
    if (!sponsorshipId || !recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Sponsorship ID and recipient ID are required'
      });
    }

    // Get sponsorship details
    const sponsorship = await prisma.sponsorship.findUnique({
      where: { id: parseInt(sponsorshipId) },
      include: { sponsor: true }
    });

    if (!sponsorship) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship not found'
      });
    }

    // Create a new order to track the sponsorship process
    const order = await prisma.orderSponsor.create({
      data: {
        recipientId: parseInt(recipientId),
        serviceProviderId: sponsorship.sponsorId,
        sponsorshipId: parseInt(sponsorshipId),
        amount: sponsorship.price,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Sponsorship process initiated successfully',
      order
    });
  } catch (error) {
    console.error('Error initiating sponsorship process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate sponsorship process',
      error: error.message
    });
  }
};

// Get sponsorship process details
exports.getSponsorshipProcess = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.orderSponsor.findUnique({
      where: { id: parseInt(id) },
      include: {
        recipient: {
          include: {
            profile: true
          }
        },
        serviceProvider: true,
        sponsorship: {
          include: {
            sponsor: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship process not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching sponsorship process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsorship process',
      error: error.message
    });
  }
};

// Update sponsorship process status
exports.updateSponsorshipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.orderSponsor.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};

// Verify sponsorship delivery with image
exports.verifySponsorshipDelivery = async (req, res) => {
  try {
    const { processId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Verification image is required'
      });
    }

    // Create media record for the verification image
    const media = await prisma.media.create({
      data: {
        url: file.filename,
        type: 'IMAGE',
        mimeType: file.mimetype,
        filename: file.filename,
        extension: path.extname(file.originalname).substring(1),
        size: file.size
      }
    });

    // Get the process
    const process = await prisma.goodsProcess.findUnique({
      where: { id: parseInt(processId) },
      include: { order: true }
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    // Update the order with verification image
    await prisma.order.update({
      where: { id: process.orderId },
      data: { verificationImageId: media.id }
    });

    // Update the process status
    const updatedProcess = await prisma.goodsProcess.update({
      where: { id: parseInt(processId) },
      data: { status: 'IN_TRANSIT' }
    });

    // Create a process event
    await prisma.processEvent.create({
      data: {
        goodsProcessId: parseInt(processId),
        fromStatus: process.status,
        toStatus: 'IN_TRANSIT',
        changedByUserId: req.user.id,
        note: 'Verification image uploaded'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Verification image uploaded successfully',
      data: updatedProcess
    });
  } catch (error) {
    console.error('Error verifying sponsorship delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify sponsorship delivery',
      error: error.message
    });
  }
};

// Confirm sponsorship delivery
exports.confirmSponsorshipDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the current process
    const process = await prisma.goodsProcess.findUnique({
      where: { id: parseInt(id) }
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    // Update the process status
    const updatedProcess = await prisma.goodsProcess.update({
      where: { id: parseInt(id) },
      data: { status: 'FINALIZED' }
    });

    // Create a process event
    await prisma.processEvent.create({
      data: {
        goodsProcessId: parseInt(id),
        fromStatus: process.status,
        toStatus: 'FINALIZED',
        changedByUserId: req.user.id,
        note: 'Delivery confirmed'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed successfully',
      data: updatedProcess
    });
  } catch (error) {
    console.error('Error confirming sponsorship delivery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm sponsorship delivery',
      error: error.message
    });
  }
};

// Request new verification photo
exports.requestNewVerificationPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the process and order
    const process = await prisma.goodsProcess.findUnique({
      where: { id: parseInt(id) },
      include: { order: true }
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    // Clear the verification image
    await prisma.order.update({
      where: { id: process.orderId },
      data: { verificationImageId: null }
    });

    // Update the process status back to PAID
    const updatedProcess = await prisma.goodsProcess.update({
      where: { id: parseInt(id) },
      data: { status: 'PAID' }
    });

    // Create a process event
    await prisma.processEvent.create({
      data: {
        goodsProcessId: parseInt(id),
        fromStatus: process.status,
        toStatus: 'PAID',
        changedByUserId: req.user.id,
        note: 'New verification photo requested'
      }
    });

    res.status(200).json({
      success: true,
      message: 'New verification photo requested successfully',
      data: updatedProcess
    });
  } catch (error) {
    console.error('Error requesting new verification photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request new verification photo',
      error: error.message
    });
  }
};

// Cancel sponsorship process
exports.cancelSponsorshipProcess = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the current process
    const process = await prisma.goodsProcess.findUnique({
      where: { id: parseInt(id) }
    });

    if (!process) {
      return res.status(404).json({
        success: false,
        message: 'Process not found'
      });
    }

    // Update the process status
    const updatedProcess = await prisma.goodsProcess.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELLED' }
    });

    // Create a process event
    await prisma.processEvent.create({
      data: {
        goodsProcessId: parseInt(id),
        fromStatus: process.status,
        toStatus: 'CANCELLED',
        changedByUserId: req.user.id,
        note: 'Process cancelled'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Sponsorship process cancelled successfully',
      data: updatedProcess
    });
  } catch (error) {
    console.error('Error cancelling sponsorship process:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel sponsorship process',
      error: error.message
    });
  }
};

// Create payment intent for Stripe
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, cardNumber, cardExpiryMm, cardExpiryYyyy, cardCvc, cardholderName } = req.body;

    console.log('Creating payment for order:', orderId);

    // Validate input
    if (!orderId || !amount || !cardNumber || !cardExpiryMm || !cardExpiryYyyy || !cardCvc || !cardholderName) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Get the order
    const order = await prisma.orderSponsor.findUnique({
      where: { id: parseInt(orderId) },
      include: { sponsorship: true }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    try {
      // Process the payment (mock success for now)
      // In production, integrate with your payment provider here
      
      // Update order status
      const updatedOrder = await prisma.orderSponsor.update({
        where: { id: parseInt(orderId) },
        data: { status: 'CONFIRMED' }
      });

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: updatedOrder
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in payment endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 