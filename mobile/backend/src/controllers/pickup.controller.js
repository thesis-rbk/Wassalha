const prisma = require('../../prisma/index');
// const handlePickup = async (req, res) => {
//   try {
//     // Extract data from request body
//     const {
//       pickupId, // ID of the pickup to update (optional)
//       orderId,  // For creating a new pickup
//       pickupType,
//       location,
//       address,
//       qrCode,
//       coordinates,
//       contactPhoneNumber,
//       scheduledTime,
//       userId, // The user making the suggestion
//       userconfirmed, // New field from request
//       travelerconfirmed, // New field from request
//     } = req.body;

//     // Basic validation
//     if (!pickupId && !orderId) {
//       return res.status(400).json({
//         error: 'Missing required fields: either pickupId (for update) or orderId (for creation) is mandatory',
//       });
//     }

//     // If pickupId is provided, it's an update, otherwise it's a creation
//     if (pickupId) {
//       // Update existing pickup
//       const pickup = await prisma.pickup.findUnique({
//         where: { id: pickupId },
//         include: {
//           order: {
//             include: {
//               request: true, // Include request to get requester's userId
//             },
//           },
//         },
//       });

//       if (!pickup) {
//         return res.status(404).json({ error: 'Pickup not found' });
//       }

//       // Ensure the user is the traveler or requester
//       const isTraveler = pickup.order.travelerId === userId;
//       const isRequester = pickup.order.request?.userId === userId;

//       if (!isTraveler && !isRequester) {
//         return res.status(403).json({
//           error: 'User is neither the traveler nor the requester for this pickup',
//         });
//       }

//       // Update the pickup with values from the request
//       const updatedPickup = await prisma.pickup.update({
//         where: { id: pickupId },
//         data: {
//           pickupType: pickupType || pickup.pickupType,
//           location: location !== undefined ? location : pickup.location,
//           address: address !== undefined ? address : pickup.address,
//           qrCode: qrCode !== undefined ? qrCode : pickup.qrCode,
//           coordinates: coordinates !== undefined ? coordinates : pickup.coordinates,
//           contactPhoneNumber: contactPhoneNumber !== undefined ? contactPhoneNumber : pickup.contactPhoneNumber,
//           scheduledTime: scheduledTime ? new Date(scheduledTime) : pickup.scheduledTime,
//           status: pickup.status, // Retain existing status unless specified otherwise
//           userconfirmed: userconfirmed !== undefined ? userconfirmed : pickup.userconfirmed, // From request or existing
//           travelerconfirmed: travelerconfirmed !== undefined ? travelerconfirmed : pickup.travelerconfirmed, // From request or existing
//         },
//       });

//       // Send success response for update
//       return res.status(200).json({
//         message: 'Pickup updated successfully',
//         pickup: updatedPickup,
//       });
//     } else {
//       // Add a new pickup (since pickupId is not provided)
//       if (!pickupType || !userId) {
//         return res.status(400).json({
//           error: 'Missing required fields: pickupType and userId are mandatory for creation',
//         });
//       }

//       // Check if the order exists and include related request data
//       const order = await prisma.order.findUnique({
//         where: { id: orderId },
//         include: {
//           request: true, // Include request to get requester's userId
//         },
//       });

//       if (!order) {
//         return res.status(404).json({ error: 'Order not found' });
//       }

//       // Check if a pickup already exists for this order
//       const existingPickup = await prisma.pickup.findUnique({
//         where: { orderId },
//       });

//       if (existingPickup) {
//         return res.status(400).json({
//           error: 'A pickup already exists for this order',
//         });
//       }

//       // Determine the role of the user
//       const isTraveler = order.travelerId === userId;
//       const isRequester = order.request.userId === userId;

//       if (!isTraveler && !isRequester) {
//         return res.status(403).json({
//           error: 'User is neither the traveler nor the requester for this order',
//         });
//       }

//       // Create the pickup with appropriate confirmation flag
//       const newPickup = await prisma.pickup.create({
//         data: {
//           orderId,
//           pickupType,
//           location: location || null,
//           address: address || null,
//           qrCode: qrCode || null,
//           coordinates: coordinates || null,
//           contactPhoneNumber: contactPhoneNumber || null,
//           status: 'SCHEDULED', // Default value from schema
//           scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
//           travelerconfirmed: isTraveler ? true : false, // True if traveler suggests
//           userconfirmed: isRequester ? true : false,    // True if requester suggests
//         },
//       });

//       // Send success response for creation
//       return res.status(201).json({
//         message: 'Pickup suggested successfully',
//         pickup: newPickup,
//       });
//     }
//   } catch (error) {
//     console.error('Error handling pickup:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   } finally {
//     await prisma.$disconnect();
//   }
// };



// const addPickup = async (req, res) => {
//     try {
//         // Extract data from request body
//         const {
//           orderId,
//           pickupType,
//           location,
//           address,
//           qrCode,
//           coordinates,
//           contactPhoneNumber,
//           scheduledTime,
//           userId, // The user making the suggestion
//         } = req.body;
    
//         // Basic validation
//         if (!orderId || !pickupType || !userId) {
//           return res.status(400).json({
//             error: 'Missing required fields: orderId, pickupType, and userId are mandatory',
//           });
//         }
    
//         // Check if the order exists and include related request data
//         const order = await prisma.order.findUnique({
//           where: { id: orderId },
//           include: {
//             request: true, // Include request to get the requester's userId
//           },
//         });
//         if (!order) {
//           return res.status(404).json({ error: 'Order not found' });
//         }
    
//         // Check if a pickup already exists for this order (since orderId is unique)
//         const existingPickup = await prisma.pickup.findUnique({
//           where: { orderId },
//         });
//         if (existingPickup) {
//           return res.status(400).json({
//             error: 'A pickup already exists for this order',
//           });
//         }
    
//         // Determine the role of the user
//         const isTraveler = order.travelerId === userId;
//         const isRequester = order.request.userId === userId;
    
//         if (!isTraveler && !isRequester) {
//           return res.status(403).json({
//             error: 'User is neither the traveler nor the requester for this order',
//           });
//         }
    
//         // Create the pickup with appropriate confirmation flag
//         const newPickup = await prisma.pickup.create({
//           data: {
//             orderId,
//             pickupType,
//             location: location || null,
//             address: address || null,
//             qrCode: qrCode || null,
//             coordinates: coordinates || null,
//             contactPhoneNumber: contactPhoneNumber || null,
//             status: 'SCHEDULED', // Default value from schema
//             scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
//             travelerconfirmed: isTraveler ? true : false, // True if traveler suggests
//             userconfirmed: isRequester ? true : false,    // True if requester suggests
//           },
//         });
    
//         // Send success response
//         res.status(201).json({
//           message: 'Pickup suggested successfully',
//           pickup: newPickup,
//         });
//       } catch (error) {
//         console.error('Error suggesting pickup:', error);
//         res.status(500).json({ error: 'Internal server error' });
//       } finally {
//         await prisma.$disconnect();
//       }
//   }
  
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

  // const updatePickup = async (req, res) => {
  //   try {
  //     // Extract data from request body
  //     const {
  //       pickupId, // ID of the pickup to update
  //       pickupType,
  //       location,
  //       address,
  //       qrCode,
  //       coordinates,
  //       contactPhoneNumber,
  //       scheduledTime,
  //       userconfirmed, // New field from request
  //       travelerconfirmed, // New field from request
  //     } = req.body;
  
  //     // Get userId from the middleware (assumes it's populated in req.user)
  //     const userId = req.user?.id;
  
  //     // Basic validation
  //     if (!pickupId || !userId) {
  //       return res.status(400).json({
  //         error: 'Missing required fields: pickupId and userId are mandatory',
  //       });
  //     }
  
  //     // Check if the pickup exists and include related order and request data
  //     const pickup = await prisma.pickup.findUnique({
  //       where: { id: pickupId },
  //       include: {
  //         order: {
  //           include: {
  //             request: true, // Include request to get requester's userId
  //           },
  //         },
  //       },
  //     });
  //     if (!pickup) {
  //       return res.status(404).json({ error: 'Pickup not found' });
  //     }
  
  //     // Determine the role of the user
  //     const isTraveler = pickup.order.travelerId === userId;
  //     const isRequester = pickup.order.request?.userId === userId; // Optional chaining for safety
  
  //     if (!isTraveler && !isRequester) {
  //       return res.status(403).json({
  //         error: 'User is neither the traveler nor the requester for this pickup',
  //       });
  //     }
  
  //     // Update the pickup with values from request, falling back to existing values
  //     const updatedPickup = await prisma.pickup.update({
  //       where: { id: pickupId },
  //       data: {
  //         pickupType: pickupType || pickup.pickupType,
  //         location: location !== undefined ? location : pickup.location,
  //         address: address !== undefined ? address : pickup.address,
  //         qrCode: qrCode !== undefined ? qrCode : pickup.qrCode,
  //         coordinates: coordinates !== undefined ? coordinates : pickup.coordinates,
  //         contactPhoneNumber: contactPhoneNumber !== undefined ? contactPhoneNumber : pickup.contactPhoneNumber,
  //         scheduledTime: scheduledTime ? new Date(scheduledTime) : pickup.scheduledTime,
  //         status: pickup.status, // Retain existing status unless specified otherwise
  //         userconfirmed: userconfirmed !== undefined ? userconfirmed : pickup.userconfirmed, // From request or existing
  //         travelerconfirmed: travelerconfirmed !== undefined ? travelerconfirmed : pickup.travelerconfirmed, // From request or existing
  //       },
  //     });
  
  //     // Send success response
  //     res.status(200).json({
  //       message: 'Pickup updated successfully',
  //       pickup: updatedPickup,
  //     });
  //   } catch (error) {
  //     console.error('Error updating pickup:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   } finally {
  //     await prisma.$disconnect();
  //   }
  // };
  // const updatePickup = async (req, res) => {
  //   try {
  //     // Extract data from request body
  //     const {
  //       pickupId, // ID of the pickup to update
  //       pickupType,
  //       location,
  //       address,
  //       qrCode,
  //       coordinates,
  //       contactPhoneNumber,
  //       scheduledTime,
  //       userId, // The user performing the update
  //       userconfirmed, // New field from request
  //       travelerconfirmed, // New field from request
  //     } = req.body;
  
  //     // Basic validation
  //     if (!pickupId || !userId) {
  //       return res.status(400).json({
  //         error: 'Missing required fields: pickupId and userId are mandatory',
  //       });
  //     }
  
  //     // Check if the pickup exists and include related order and request data
  //     const pickup = await prisma.pickup.findUnique({
  //       where: { id: pickupId },
  //       include: {
  //         order: {
  //           include: {
  //             request: true, // Include request to get requester's userId
  //           },
  //         },
  //       },
  //     });
  //     if (!pickup) {
  //       return res.status(404).json({ error: 'Pickup not found' });
  //     }
  
  //     // Determine the role of the user
  //     const isTraveler = pickup.order.travelerId === userId;
  //     const isRequester = pickup.order.request?.userId === userId; // Optional chaining for safety
  
  //     if (!isTraveler && !isRequester) {
  //       return res.status(403).json({
  //         error: 'User is neither the traveler nor the requester for this pickup',
  //       });
  //     }
  
  //     // Update the pickup with values from request, falling back to existing values
  //     const updatedPickup = await prisma.pickup.update({
  //       where: { id: pickupId },
  //       data: {
  //         pickupType: pickupType || pickup.pickupType,
  //         location: location !== undefined ? location : pickup.location,
  //         address: address !== undefined ? address : pickup.address,
  //         qrCode: qrCode !== undefined ? qrCode : pickup.qrCode,
  //         coordinates: coordinates !== undefined ? coordinates : pickup.coordinates,
  //         contactPhoneNumber: contactPhoneNumber !== undefined ? contactPhoneNumber : pickup.contactPhoneNumber,
  //         scheduledTime: scheduledTime ? new Date(scheduledTime) : pickup.scheduledTime,
  //         status: pickup.status, // Retain existing status unless specified otherwise
  //         userconfirmed: userconfirmed !== undefined ? userconfirmed : pickup.userconfirmed, // From request or existing
  //         travelerconfirmed: travelerconfirmed !== undefined ? travelerconfirmed : pickup.travelerconfirmed, // From request or existing
  //       },
  //     });
  
  //     // Send success response
  //     res.status(200).json({
  //       message: 'Pickup updated successfully',
  //       pickup: updatedPickup,
  //     });
  //   } catch (error) {
  //     console.error('Error updating pickup:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   } finally {
  //     await prisma.$disconnect();
  //   }
  // };  
  const acceptPickup = async (req, res) => {
    try {
      // Extract pickupId from request body
      const { pickupId } = req.body;
  
      // Get userId from the middleware (assumes it's populated in req.user)
      const userId = req.user?.id;
  
      // Basic validation
      if (!pickupId) {
        return res.status(400).json({
          error: 'Missing required field: pickupId is mandatory',
        });
      }
      if (!userId) {
        return res.status(400).json({
          error: 'User ID is missing from the session',
        });
      }
  
      // Check if the pickup exists and include related order and request data
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
  
      // Determine the role of the user
      const isTraveler = pickup.order.travelerId === userId;
      const isRequester = pickup.order.request?.userId === userId; // Optional chaining for safety
  
      if (!isTraveler && !isRequester) {
        return res.status(403).json({
          error: 'User is neither the traveler nor the requester for this pickup',
        });
      }
  
      // Update the pickup to set both confirmation flags to true
      const updatedPickup = await prisma.pickup.update({
        where: { id: pickupId },
        data: {
          userconfirmed: true,
          travelerconfirmed: true,
          status: 'SCHEDULED', // Retain existing status, or change if needed
        },
      });
  
      // Send success response
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
  const updatePickupStatus = async (req, res) => {
    const { pickupId, newStatus } = req.body;
  
    try {
      // Check if the pickup exists
      const pickup = await prisma.pickup.findUnique({
        where: { id: pickupId },
      });
  
      if (!pickup) {
        return res.status(404).json({ message: 'Pickup not found' });
      }
     
      // Update the status of the pickup
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
  // Export the controller
  module.exports = { getPickupsByUserIdHandler,getPickupsByUserId ,handlePickup,acceptPickup,updatePickupStatus};