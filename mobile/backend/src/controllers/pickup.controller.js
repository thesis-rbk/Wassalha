const prisma = require('../../prisma/index');
const addPickup = async (req, res) => {
    try {
        // Extract data from request body
        const {
          orderId,
          pickupType,
          location,
          address,
          qrCode,
          coordinates,
          contactPhoneNumber,
          scheduledTime,
          userId, // The user making the suggestion
        } = req.body;
    
        // Basic validation
        if (!orderId || !pickupType || !userId) {
          return res.status(400).json({
            error: 'Missing required fields: orderId, pickupType, and userId are mandatory',
          });
        }
    
        // Check if the order exists and include related request data
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            request: true, // Include request to get the requester's userId
          },
        });
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
    
        // Check if a pickup already exists for this order (since orderId is unique)
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
            status: 'SCHEDULED', // Default value from schema
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            travelerconfirmed: isTraveler ? true : false, // True if traveler suggests
            userconfirmed: isRequester ? true : false,    // True if requester suggests
          },
        });
    
        // Send success response
        res.status(201).json({
          message: 'Pickup suggested successfully',
          pickup: newPickup,
        });
      } catch (error) {
        console.error('Error suggesting pickup:', error);
        res.status(500).json({ error: 'Internal server error' });
      } finally {
        await prisma.$disconnect();
      }
  }
  
  const getPickupsByUserId= async(userId)=>{
    try {
      // Fetch all pickups where the user is the traveler of the associated order
      const pickups = await prisma.pickup.findMany({
        where: {
          order: {
            travelerId: userId, // Filter by userId as the traveler
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
      await prisma.$disconnect(); // Ensure Prisma disconnects after query
    }
  }
  
  // Example usage in an Express route
  const getPickupsByUserIdHandler=async (req, res)=> {
    const { userId } = req.params; // Assuming userId is passed as a route parameter
  
    try {
      const pickups = await getPickupsByUserId(parseInt(userId, 10));
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
  }
  
  // Export the controller
  module.exports = { addPickup,getPickupsByUserIdHandler,getPickupsByUserId };