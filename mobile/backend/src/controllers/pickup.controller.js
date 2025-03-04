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
      } = req.body;
  
      // Basic validation
      if (!orderId || !pickupType) {
        return res.status(400).json({
          error: "Missing required fields: orderId and pickupType are mandatory",
        });
      }
  
      // Check if the order exists
      const orderExists = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!orderExists) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      // Check if a pickup already exists for this order (since orderId is unique)
      const existingPickup = await prisma.pickup.findUnique({
        where: { orderId },
      });
      if (existingPickup) {
        return res.status(400).json({
          error: "A pickup already exists for this order",
        });
      }
  
      // Create the pickup
      const newPickup = await prisma.pickup.create({
        data: {
          orderId,
          pickupType, // Must match your PickupType enum (e.g., "AIRPORT", "STORE")
          location: location || null, // Optional fields default to null if not provided
          address: address || null,
          qrCode: qrCode || null,
          coordinates: coordinates || null,
          contactPhoneNumber: contactPhoneNumber || null,
          status: "SCHEDULED", // Default value from schema
          scheduledTime: scheduledTime ? new Date(scheduledTime) : null, // Convert to Date if provided
        },
      });
  
      // Send success response
      res.status(201).json({
        message: "Pickup created successfully",
        pickup: newPickup,
      });
    } catch (error) {
      console.error("Error creating pickup:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
  // Export the controller
  module.exports = { addPickup };