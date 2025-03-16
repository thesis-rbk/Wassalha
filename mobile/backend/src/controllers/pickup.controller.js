// pickupController.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const handlePickup = async (req, res) => {
  try {
    // Extract data from request body (excluding userconfirmed and travelerconfirmed)
    const {
      pickupId, // ID of the pickup to update (optional)
      orderId,  // For creating a new pickup
      pickupType,
      location,
      address,
      qrCode,
      coordinates,
      contactPhoneNumber,
      scheduledTime,
    } = req.body;

    // Get userId from the middleware (assumes it's populated in req.user)
    const userId = req.user?.id;

    // Basic validation: Check if userId is available
    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing from the session' });
    }

    // Log the suggestion into PickupSuggestion table
    const suggestionData = {
      orderId: orderId || (pickupId ? (await prisma.pickup.findUnique({ where: { id: pickupId } })).orderId : null),
      userId,
      pickupType,
      location: location || null,
      address: address || null,
      qrCode: qrCode || null,
      coordinates: coordinates || null,
      contactPhoneNumber: contactPhoneNumber || null,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
    };

    // If updating an existing pickup, link to pickupId
    if (pickupId) {
      suggestionData.pickupId = pickupId;
    }

    // Create the suggestion record
    await prisma.pickupSuggestion.create({
      data: suggestionData,
    });

    // If pickupId is provided, it's an update, otherwise it's a creation
    if (pickupId) {
      // Update existing pickup
      const pickup = await prisma.pickup.findUnique({
        where: { id: pickupId },
        include: {
          order: {
            include: {
              request: true, // Include request to get requester's userId
            },
          },
        },
      });

      if (!pickup) {
        return res.status(404).json({ error: 'Pickup not found' });
      }

      // Ensure the user is the traveler or requester
      const isTraveler = pickup.order.travelerId === userId;
      const isRequester = pickup.order.request?.userId === userId;

      if (!isTraveler && !isRequester) {
        return res.status(403).json({
          error: 'User is neither the traveler nor the requester for this pickup',
        });
      }

      // Update the pickup with values from the request
      const updatedPickup = await prisma.pickup.update({
        where: { id: pickupId },
        data: {
          pickupType: pickupType || pickup.pickupType,
          location: location !== undefined ? location : pickup.location,
          address: address !== undefined ? address : pickup.address,
          qrCode: qrCode !== undefined ? qrCode : pickup.qrCode,
          coordinates: coordinates !== undefined ? coordinates : pickup.coordinates,
          contactPhoneNumber: contactPhoneNumber !== undefined ? contactPhoneNumber : pickup.contactPhoneNumber,
          scheduledTime: scheduledTime ? new Date(scheduledTime) : pickup.scheduledTime,
          status: 'IN_PROGRESS', // Retain existing status unless specified otherwise
          // Set confirmation flags based on user role exclusively
          userconfirmed: isRequester ? true : false,
          travelerconfirmed: isTraveler ? true : false,
        },
      });

      // Send success response for update
      return res.status(200).json({
        message: 'Pickup updated successfully',
        pickup: updatedPickup,
      });
    } else {
      // Add a new pickup (since pickupId is not provided)
      if (!orderId || !pickupType) {
        return res.status(400).json({
          error: 'Missing required fields: orderId and pickupType are mandatory for creation',
        });
      }

      // Check if the order exists and include related request data
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          request: true, // Include request to get requester's userId
        },
      });
      console.log("order", order);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if a pickup already exists for this order
      const existingPickup = await prisma.pickup.findUnique({
        where: { orderId },
      });

      if (existingPickup) {
        return res.status(400).json({
          error: 'A pickup already exists for this order',
        });
      }

      // Determine the role of the user
      const isTraveler = order.travelerId === userId;
      const isRequester = order.request.userId === userId;

      if (!isTraveler && !isRequester) {
        return res.status(403).json({
          error: 'User is neither the traveler nor the requester for this order',
        });
      }

      // Create the pickup with appropriate confirmation flag
      const newPickup = await prisma.pickup.create({
        data: {
          orderId,
          pickupType,
          location: location || null,
          address: address || null,
          qrCode: qrCode || null,
          coordinates: coordinates || null,
          contactPhoneNumber: contactPhoneNumber || null,
          status: 'IN_PROGRESS', // Default value from schema
          scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
          // Set confirmation flags based on user role exclusively
          travelerconfirmed: isTraveler ? true : false,
          userconfirmed: isRequester ? true : false,
        },
      });

      // Update the suggestion record with the new pickupId
      await prisma.pickupSuggestion.updateMany({
        where: {
          orderId,
          pickupId: null, // Only update suggestions not yet linked to a pickup
          userId,
          createdAt: { gte: new Date(Date.now() - 1000 * 60) }, // Last minute to avoid race conditions
        },
        data: { pickupId: newPickup.id },
      });

      // Send success response for creation
      return res.status(201).json({
        message: 'Pickup suggested successfully',
        pickup: newPickup,
      });
    }
  } catch (error) {
    console.error('Error handling pickup:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};

// Keep other functions unchanged
// Modified to fetch pickups where userId is the requester
// Fetch pickups where userId (from middleware) is the requester
const getPickupsRequesterByUserId = async (userId) => {
  try {
    const pickups = await prisma.pickup.findMany({
      where: {
        order: {
          request: {
            userId: userId, // Filter by userId as the requester in the Request model
          },
        },
      },
      include: {
        order: {
          include: {
            request: {
              select: {
                userId: true, // Include requester's userId to verify the relation
              },
            },
          },
        },
      },
    });
    return pickups;
  } catch (error) {
    console.error('Error fetching pickups by userId:', error);
    throw new Error('Failed to retrieve pickups');
  } finally {
    await prisma.$disconnect();
  }
};

const getPickupsRequesterByUserIdHandler = async (req, res) => {
  try {
    // Get userId from the authenticated user (set by middleware)
    const userId = req.user?.id;

    // Validate that userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in authenticated session',
      });
    }

    const pickups = await getPickupsRequesterByUserId(userId);
    res.status(200).json({
      success: true,
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Unknown error occurred',
    });
  }
};
const getPickupsTravelerByUserId = async (userId) => {
  try {
    const pickups = await prisma.pickup.findMany({
      where: {
        order: {
          travelerId: userId, // Filter by userId as the traveler in the Order model
        },
      },
      include: {
        order: {
          select: {
            travelerId: true, // Include travelerId to verify the relation
          },
        },
      },
    });
    return pickups;
  } catch (error) {
    console.error('Error fetching pickups by userId:', error);
    throw new Error('Failed to retrieve pickups');
  } finally {
    await prisma.$disconnect();
  }
};

// Updated handler to use req.user.id from middleware instead of req.params
const getPickupsTravelerByUserIdHandler = async (req, res) => {
  try {
    // Get userId from the authenticated user (set by middleware)
    const userId = req.user?.id;

    // Validate that userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in authenticated session',
      });
    }

    const pickups = await getPickupsTravelerByUserId(userId);
    res.status(200).json({
      success: true,
      data: pickups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Unknown error occurred',
    });
  }
};
const acceptPickup = async (req, res) => {
  try {
    const { pickupId,qrCode } = req.body;
    const userId = req.user?.id;

    if (!pickupId) {
      return res.status(400).json({ error: 'Missing required field: pickupId is mandatory' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing from the session' });
    }

    const pickup = await prisma.pickup.findUnique({
      where: { id: pickupId },
      include: {
        order: {
          include: {
            request: true,
          },
        },
      },
    });
    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    const isTraveler = pickup.order.travelerId === userId;
    const isRequester = pickup.order.request?.userId === userId;

    if (!isTraveler && !isRequester) {
      return res.status(403).json({ error: 'User is neither the traveler nor the requester for this pickup' });
    }

    const updatedPickup = await prisma.pickup.update({
      where: { id: pickupId },
      data: {
        userconfirmed: true,
        travelerconfirmed: true,
        status: 'SCHEDULED',
        qrCode:qrCode
      },
    });

    res.status(200).json({
      message: 'Pickup accepted successfully',
      pickup: updatedPickup,
    });
  } catch (error) {
    console.error('Error accepting pickup:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
};

const updatePickupStatus = async (req, res) => {
  const { pickupId, newStatus } = req.body;

  try {
    const pickup = await prisma.pickup.findUnique({
      where: { id: pickupId },
    });

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    const updatedPickup = await prisma.pickup.update({
      where: { id: pickupId },
      data: { status: newStatus },
    });

    return res.status(200).json(updatedPickup);
  } catch (error) {
    console.error('Error updating pickup status:', error);
    return res.status(500).json({ message: 'An error occurred while updating the pickup status' });
  }
};
const getPickupSuggestionsByPickupId = async (req, res) => {
  try {
    // Get pickupId from route parameter
    const { pickupId } = req.params;

    // Validate input
    if (!pickupId) {
      return res.status(400).json({
        success: false,
        error: 'Pickup ID is required',
      });
    }

    // Query PickupSuggestion records by pickupId only
    const suggestions = await prisma.pickupSuggestion.findMany({
      where: {
        pickupId: parseInt(pickupId, 10), // Convert to integer
      },
      include: {
        pickup: {
          select: {
            id: true,
            pickupType: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Latest suggestions first
      },
    });

    // Check if any suggestions were found
    if (suggestions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No suggestions found for this pickup',
      });
    }

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error fetching pickup suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  } finally {
    await prisma.$disconnect();
  }
};
const getAllPickups = async (req, res) => {
  try {
      const pickups = await prisma.pickup.findMany({
          include: {
              // Include any related models if necessary
          },
      });
      res.status(200).json({
          success: true,
          data: pickups,
      });
  } catch (error) {
      console.error("Error fetching pickups:", error);
      res.status(500).json({
          success: false,
          message: "Failed to fetch pickups",
          error: error.message,
      });
  }
};

// Add delete pickup function
const deletePickup = async (req, res) => {
  const { id } = req.params;

  try {
      // Check if pickup exists before attempting to delete
      const existingPickup = await prisma.pickup.findUnique({
          where: { id: parseInt(id) }
      });

      if (!existingPickup) {
          return res.status(404).json({
              success: false,
              message: "Pickup not found"
          });
      }

      await prisma.pickup.delete({
          where: { id: parseInt(id) },
      });

      res.status(200).json({
          success: true,
          message: "Pickup deleted successfully",
      });
  } catch (error) {
      console.error("Error deleting pickup:", error);
      res.status(500).json({
          success: false,
          message: "Failed to delete pickup",
          error: error.message,
      });
  }
}; 

// Export the controller with updated handlePickup
module.exports = { 
  getPickupsRequesterByUserIdHandler, 
  getPickupsRequesterByUserId, 
  handlePickup, 
  acceptPickup, 
  updatePickupStatus,
  getPickupsTravelerByUserId,
  getPickupsTravelerByUserIdHandler,
  getPickupSuggestionsByPickupId,
  getAllPickups,
  deletePickup
};

