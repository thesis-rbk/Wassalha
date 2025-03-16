const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Handle pickup suggestion or update
const handlePickup = async (req, res) => {
  try {
    const {
      pickupId,
      orderId,
      pickupType,
      location,
      address,
      qrCode,
      coordinates,
      contactPhoneNumber,
      scheduledTime,
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is missing from the session' });
    }

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

    if (pickupId) {
      suggestionData.pickupId = pickupId;
    }

    const newSuggestion = await prisma.pickupSuggestion.create({
      data: suggestionData,
    });

    let pickup;

    if (pickupId) {
      const existingPickup = await prisma.pickup.findUnique({
        where: { id: pickupId },
        include: {
          order: {
            include: {
              request: true,
            },
          },
        },
      });

      if (!existingPickup) {
        return res.status(404).json({ error: 'Pickup not found' });
      }

      const isTraveler = existingPickup.order.travelerId === userId;
      const isRequester = existingPickup.order.request?.userId === userId;

      if (!isTraveler && !isRequester) {
        return res.status(403).json({
          error: 'User is neither the traveler nor the requester for this pickup',
        });
      }

      pickup = await prisma.pickup.update({
        where: { id: pickupId },
        data: {
          pickupType: pickupType || existingPickup.pickupType,
          location: location !== undefined ? location : existingPickup.location,
          address: address !== undefined ? address : existingPickup.address,
          qrCode: qrCode !== undefined ? qrCode : existingPickup.qrCode,
          coordinates: coordinates !== undefined ? coordinates : existingPickup.coordinates,
          contactPhoneNumber: contactPhoneNumber !== undefined ? contactPhoneNumber : existingPickup.contactPhoneNumber,
          scheduledTime: scheduledTime ? new Date(scheduledTime) : existingPickup.scheduledTime,
          status: 'IN_PROGRESS',
          userconfirmed: isRequester ? true : existingPickup.userconfirmed,
          travelerconfirmed: isTraveler ? true : existingPickup.travelerconfirmed,
        },
      });

      return res.status(200).json({
        message: 'Pickup updated successfully',
        pickup,
      });
    } else {
      if (!orderId || !pickupType) {
        return res.status(400).json({
          error: 'Missing required fields: orderId and pickupType are mandatory for creation',
        });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          request: true,
        },
      });

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const existingPickup = await prisma.pickup.findUnique({
        where: { orderId },
      });

      if (existingPickup) {
        return res.status(400).json({
          error: 'A pickup already exists for this order',
        });
      }

      const isTraveler = order.travelerId === userId;
      const isRequester = order.request.userId === userId;

      if (!isTraveler && !isRequester) {
        return res.status(403).json({
          error: 'User is neither the traveler nor the requester for this order',
        });
      }

      pickup = await prisma.pickup.create({
        data: {
          orderId,
          pickupType,
          location: location || null,
          address: address || null,
          qrCode: qrCode || null,
          coordinates: coordinates || null,
          contactPhoneNumber: contactPhoneNumber || null,
          status: 'IN_PROGRESS',
          scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
          travelerconfirmed: isTraveler ? true : false,
          userconfirmed: isRequester ? true : false,
        },
      });

      await prisma.pickupSuggestion.updateMany({
        where: {
          orderId,
          pickupId: null,
          userId,
          createdAt: { gte: new Date(Date.now() - 1000 * 60) },
        },
        data: { pickupId: pickup.id },
      });

      return res.status(201).json({
        message: 'Pickup suggested successfully',
        pickup,
      });
    }
  } catch (error) {
    console.error('Error handling pickup:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Fetch pickups where userId is the requester
const getPickupsRequesterByUserId = async (userId) => {
  try {
    const pickups = await prisma.pickup.findMany({
      where: {
        order: {
          request: {
            userId: userId,
          },
        },
      },
      include: {
        order: {
          include: {
            request: {
              select: {
                userId: true,
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
  }
};

const getPickupsRequesterByUserIdHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

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
    console.error('Error in getPickupsRequesterByUserIdHandler:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Unknown error occurred',
      });
    }
  }
};

// Fetch pickups where userId is the traveler
const getPickupsTravelerByUserId = async (userId) => {
  try {
    const pickups = await prisma.pickup.findMany({
      where: {
        order: {
          travelerId: userId,
        },
      },
      include: {
        order: {
          select: {
            travelerId: true,
          },
        },
      },
    });
    return pickups;
  } catch (error) {
    console.error('Error fetching pickups by userId:', error);
    throw new Error('Failed to retrieve pickups');
  }
};

const getPickupsTravelerByUserIdHandler = async (req, res) => {
  try {
    const userId = req.user?.id;

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
    console.error('Error in getPickupsTravelerByUserIdHandler:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Unknown error occurred',
      });
    }
  }
};

// Accept a pickup
const acceptPickup = async (req, res) => {
  try {
    const { pickupId, qrCode } = req.body;
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
        userconfirmed: isRequester ? true : pickup.userconfirmed,
        travelerconfirmed: isTraveler ? true : pickup.travelerconfirmed,
        status: (pickup.userconfirmed || isRequester) && (pickup.travelerconfirmed || isTraveler) ? 'SCHEDULED' : pickup.status,
        qrCode: qrCode || pickup.qrCode,
      },
    });

    res.status(200).json({
      message: 'Pickup accepted successfully',
      pickup: updatedPickup,
    });
  } catch (error) {
    console.error('Error accepting pickup:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Update pickup status
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
    if (!res.headersSent) {
      return res.status(500).json({ message: 'An error occurred while updating the pickup status' });
    }
  }
};

// Fetch pickup suggestions by pickupId
const getPickupSuggestionsByPickupId = async (req, res) => {
  try {
    const { pickupId } = req.params;

    if (!pickupId) {
      return res.status(400).json({
        success: false,
        error: 'Pickup ID is required',
      });
    }

    const suggestions = await prisma.pickupSuggestion.findMany({
      where: {
        pickupId: parseInt(pickupId, 10),
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
        createdAt: 'desc',
      },
    });

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
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

// Fetch all pickups
const getAllPickups = async (req, res) => {
  try {
    const pickups = await prisma.pickup.findMany({
      include: {
        order: true,
      },
    });
    res.status(200).json({
      success: true,
      data: pickups,
    });
  } catch (error) {
    console.error('Error fetching pickups:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pickups',
        error: error.message,
      });
    }
  }
};

// Delete a pickup
const deletePickup = async (req, res) => {
  const { id } = req.params;

  try {
    const existingPickup = await prisma.pickup.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found',
      });
    }

    await prisma.pickup.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Pickup deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pickup:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete pickup',
        error: error.message,
      });
    }
  }
};

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
  deletePickup,
};