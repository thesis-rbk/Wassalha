const prisma = require('../../prisma/index');

// Submit ID card and bank card to become a traveler
const submitTravelerApplication = async (req, res) => {
  const { userId, idCard, bankCard } = req.body;

  try {
    // Validate required fields
    if (!userId || !idCard || !bankCard) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, ID card, and bank card are required' 
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user is already a traveler
    const existingTraveler = await prisma.traveler.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (existingTraveler) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already a traveler' 
      });
    }

    // Create new traveler record
    const newTraveler = await prisma.traveler.create({
      data: {
        userId: parseInt(userId),
        idCard,
        bankCard,
        isVerified: false, // Default to not verified
      },
    });

    // In a real application, you would send a notification to admins here
    // to review the new traveler application

    res.status(201).json({ 
      success: true, 
      message: 'Traveler application submitted successfully. An admin will review your application soon.',
      data: {
        id: newTraveler.id,
        userId: newTraveler.userId,
        isVerified: newTraveler.isVerified,
        createdAt: newTraveler.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting traveler application:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit traveler application', 
      error: error.message 
    });
  }
};

// Check if a user is a traveler and if they're verified
const checkTravelerStatus = async (req, res) => {
  const { userId } = req.params;

  try {
    console.log(`Checking traveler status for user ID: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        isTraveler: false,
        isVerified: false
      });
    }

    // Convert userId to integer to ensure proper comparison
    const parsedUserId = parseInt(userId, 10);
    
    // Find the traveler with the given userId
    const traveler = await prisma.traveler.findUnique({
      where: { userId: parsedUserId },
    });

    console.log('Traveler found:', traveler);

    if (!traveler) {
      return res.status(200).json({
        success: true,
        isTraveler: false,
        isVerified: false
      });
    }

    // Return the traveler status with the correct verification status
    res.status(200).json({
      success: true,
      isTraveler: true,
      isVerified: traveler.isVerified,
      travelerId: traveler.id // Include the traveler ID for reference
    });
  } catch (error) {
    console.error('Error checking traveler status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check traveler status',
      error: error.message,
      isTraveler: false,
      isVerified: false
    });
  }
};

// Verify a traveler
const verifyTraveler = async (req, res) => {
  const { id } = req.params;

  try {
    // Update the Traveler's isVerified status
    const updatedTraveler = await prisma.traveler.update({
      where: { id: parseInt(id) },
      data: { isVerified: true },
    });

    // In a real application, you would send a notification to the user here
    // to inform them that their application has been approved

    res.status(200).json({ success: true, data: updatedTraveler });
  } catch (error) {
    console.error('Error verifying traveler:', error);
    res.status(500).json({ success: false, message: 'Failed to verify traveler', error: error.message });
  }
};

// Get all travelers
const getAllTravelers = async (req, res) => {
  try {
    const travelers = await prisma.traveler.findMany({
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                image: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const formattedTravelers = travelers.map(traveler => ({
      id: traveler.id,
      userId: traveler.userId,
      isVerified: traveler.isVerified,
      createdAt: traveler.createdAt,
      updatedAt: traveler.updatedAt,
      user: {
        email: traveler.user.email,
        name: `${traveler.user.profile?.firstName || ''} ${traveler.user.profile?.lastName || ''}`.trim(),
        imageUrl: traveler.user.profile?.image?.url,
      }
    }));

    res.status(200).json({ success: true, data: formattedTravelers });
  } catch (error) {
    console.error('Error fetching travelers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch travelers', error: error.message });
  }
};

// Get traveler by ID
const getTravelerById = async (req, res) => {
  const { id } = req.params;

  try {
    const traveler = await prisma.traveler.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                image: {
                  select: {
                    url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!traveler) {
      return res.status(404).json({ success: false, message: 'Traveler not found' });
    }

    const formattedTraveler = {
      id: traveler.id,
      userId: traveler.userId,
      isVerified: traveler.isVerified,
      createdAt: traveler.createdAt,
      updatedAt: traveler.updatedAt,
      user: {
        email: traveler.user.email,
        name: `${traveler.user.profile?.firstName || ''} ${traveler.user.profile?.lastName || ''}`.trim(),
        imageUrl: traveler.user.profile?.image?.url,
      }
    };

    res.status(200).json({ success: true, data: formattedTraveler });
  } catch (error) {
    console.error('Error fetching traveler:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch traveler', error: error.message });
  }
};

// Delete a traveler
const deleteTraveler = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.traveler.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ success: true, message: 'Traveler deleted successfully' });
  } catch (error) {
    console.error('Error deleting traveler:', error);
    res.status(500).json({ success: false, message: 'Failed to delete traveler', error: error.message });
  }
};

module.exports = {
  submitTravelerApplication,
  checkTravelerStatus,
  verifyTraveler,
  getAllTravelers,
  getTravelerById,
  deleteTraveler,
};
