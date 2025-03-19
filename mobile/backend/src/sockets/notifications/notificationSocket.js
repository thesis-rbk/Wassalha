// Handler function for notification-related socket events
// Takes a socket connection as parameter
const prisma = require("../../../prisma/index");

const notificationHandlers = (socket) => {
  // Automatically join the authenticated user's notification room
  const userId = socket.user.id;
  const roomName = `user_${userId}`;
  socket.join(roomName);
  console.log(`👤 Authenticated user ${userId} joined room: ${roomName}`);

  // Send confirmation back to the client
  socket.emit("joined", { room: roomName, userId });

  // When someone makes an offer on a request
  socket.on(
    "offer_made",
    async ({ requesterId, travelerId, requestDetails }) => {
      // Security check: Only allow travelers to create offer notifications
      if (socket.user.id !== parseInt(travelerId)) {
        console.log(
          `⚠️ Security warning: User ${socket.user.id} tried to create offer as traveler ${travelerId}`
        );
        return;
      }

      const roomName = `user_${requesterId}`;
      console.log(`💌 Sending offer notification to room: ${roomName}`, {
        requesterId,
        travelerId,
        requestDetails,
      });

      // Save notification to database
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: parseInt(requesterId),
            senderId: parseInt(travelerId), // Set the senderId to identify who sent it
            type: "REQUEST", // Using enum value from schema
            title: "New Offer",
            message: `You have received a new offer for ${
              requestDetails.goodsName || "your request"
            }!`,
            status: "UNREAD",
            // Set all relevant relation IDs
            requestId: requestDetails.requestId
              ? parseInt(requestDetails.requestId)
              : null,
            orderId: requestDetails.orderId
              ? parseInt(requestDetails.orderId)
              : null,
            // pickupId is likely not relevant for new offers
          },
        });
        console.log("✅ Notification saved to database:", notification.id);
      } catch (error) {
        console.error("❌ Error saving notification to database:", error);
        console.error("Error details:", error.stack);
      }

      // Emit to the request creator's room
      socket.to(roomName).emit("offer_made", {
        type: "NEW_OFFER",
        message: "You have received a new offer!",
        travelerId,
        requestDetails,
      });
    }
  );

  // When someone responds to an offer (accept/reject)
  socket.on(
    "offer_response",
    async ({ travelerId, status, requestDetails }) => {
      // Security check: Only allow requesters to respond to offers
      if (parseInt(requestDetails.requesterId) !== socket.user.id) {
        console.log(
          `⚠️ Security warning: User ${socket.user.id} tried to respond to offer as requester ${requestDetails.requesterId}`
        );
        return;
      }

      const roomName = `user_${travelerId}`;
      console.log(`✉️ Sending response notification to room: ${roomName}`, {
        travelerId,
        status,
        requestDetails,
      });

      // Save notification to database
      try {
        const notification = await prisma.notification.create({
          data: {
            userId: parseInt(travelerId),
            senderId: socket.user.id, // Requester is sending this notification
            type: status === "ACCEPTED" ? "ACCEPTED" : "REJECTED", // Using enum values
            title: status === "ACCEPTED" ? "Offer Accepted" : "Offer Rejected",
            message: `Your offer has been ${status.toLowerCase()}!`,
            status: "UNREAD",
            // Include related records
            requestId: requestDetails.requestId
              ? parseInt(requestDetails.requestId)
              : null,
            orderId: requestDetails.orderId
              ? parseInt(requestDetails.orderId)
              : null,
          },
        });
        console.log("✅ Notification saved to database:", notification.id);
      } catch (error) {
        console.error("❌ Error saving notification to database:", error);
        console.error("Error details:", error.stack);
      }

      // Emit to the traveler's room
      socket.to(roomName).emit("offer_response", {
        type: status === "ACCEPTED" ? "OFFER_ACCEPTED" : "OFFER_REJECTED",
        message: `Your offer has been ${status.toLowerCase()}!`,
        requestDetails,
      });
    }
  );

  // When a requester cancels an order
  socket.on("order_cancelled", async ({ travelerId, requestDetails }) => {
    // Security check: Only allow requesters to cancel orders
    if (parseInt(requestDetails.requesterId) !== socket.user.id) {
      console.log(
        `⚠️ Security warning: User ${socket.user.id} tried to cancel order as requester ${requestDetails.requesterId}`
      );
      return;
    }

    const roomName = `user_${travelerId}`;
    console.log(
      `📝 Sending order cancellation notification to room: ${roomName}`,
      {
        travelerId,
        requestDetails,
      }
    );

    // Save notification to database
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: parseInt(travelerId),
          senderId: socket.user.id,
          type: "REJECTED", // Using enum value
          title: "Order Cancelled",
          message: "An order has been cancelled by the requester",
          status: "UNREAD",
          requestId: requestDetails.requestId
            ? parseInt(requestDetails.requestId)
            : null,
          orderId: requestDetails.orderId
            ? parseInt(requestDetails.orderId)
            : null,
        },
      });
      console.log("✅ Notification saved to database:", notification.id);
    } catch (error) {
      console.error("❌ Error saving notification to database:", error);
      console.error("Error details:", error.stack);
    }

        // Emit to the traveler's room
        socket.to(roomName).emit('order_cancelled', {
            type: 'ORDER_CANCELLED',
            message: 'An order has been cancelled by the requester',
            requestDetails
        });
    });

    // When a traveler cancels their offer
    socket.on('offer_cancelled', async ({ requesterId, offerDetails }) => {
        // Security check: Only allow travelers to cancel their own offers
        if (parseInt(offerDetails.travelerId) !== socket.user.id) {
            console.log(`⚠️ Security warning: User ${socket.user.id} tried to cancel offer as traveler ${offerDetails.travelerId}`);
            return;
        }
        
        const roomName = `user_${requesterId}`;
        console.log(`🚫 Sending offer cancellation notification to room: ${roomName}`, {
            requesterId,
            offerDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(requesterId),
                    senderId: socket.user.id,
                    type: "REJECTED", // Using enum value
                    title: "Offer Cancelled",
                    message: 'A traveler has cancelled their offer',
                    status: "UNREAD",
                    requestId: offerDetails.requestId ? parseInt(offerDetails.requestId) : null,
                    orderId: offerDetails.orderId ? parseInt(offerDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the requester's room
        socket.to(roomName).emit('offer_cancelled', {
            type: 'OFFER_CANCELLED',
            message: 'A traveler has cancelled their offer',
            offerDetails
        });
    });

    // When verification photo is submitted
    socket.on('verification_photo_submitted', async ({ requesterId, travelerId, requestDetails }) => {
        // Security check: Only allow travelers to create verification notifications
        if (socket.user.id !== parseInt(travelerId)) {
            console.log(`⚠️ Security warning: User ${socket.user.id} tried to submit verification as traveler ${travelerId}`);
            return;
        }

        const roomName = `user_${requesterId}`;
        console.log(`📸 Sending verification photo notification to room: ${roomName}`, {
            requesterId,
            travelerId,
            requestDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(requesterId),
                    senderId: parseInt(travelerId),
                    type: "SYSTEM_ALERT", // Using enum value from schema
                    title: "Verification Photo Submitted",
                    message: `A verification photo has been submitted for your order.`,
                    status: "UNREAD",
                    requestId: requestDetails.requestId ? parseInt(requestDetails.requestId) : null,
                    orderId: requestDetails.orderId ? parseInt(requestDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the requester's room
        socket.to(roomName).emit('verification_photo_submitted', {
            type: 'VERIFICATION_PHOTO_SUBMITTED',
            message: 'A verification photo has been submitted for your order.',
            travelerId,
            requestDetails
        });
    });

    // When product is confirmed
    socket.on('product_confirmed', async ({ travelerId, requesterId, requestDetails }) => {
        // Security check: Only allow requesters to confirm products
        if (socket.user.id !== parseInt(requesterId)) {
            console.log(`⚠️ Security warning: User ${socket.user.id} tried to confirm product as requester ${requesterId}`);
            return;
        }
        
        const roomName = `user_${travelerId}`;
        console.log(`✅ Sending product confirmation notification to room: ${roomName}`, {
            travelerId,
            requesterId,
            requestDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(travelerId),
                    senderId: socket.user.id,
                    type: "ACCEPTED", // Using enum value from schema
                    title: "Product Confirmed",
                    message: `Your product verification has been confirmed.`,
                    status: "UNREAD",
                    requestId: requestDetails.requestId ? parseInt(requestDetails.requestId) : null,
                    orderId: requestDetails.orderId ? parseInt(requestDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the traveler's room
        socket.to(roomName).emit('product_confirmed', {
            type: 'PRODUCT_CONFIRMED',
            message: 'Your product verification has been confirmed.',
            requestDetails
        });
    });

    // When another photo is requested
    socket.on('request_new_photo', async ({ travelerId, requesterId, requestDetails }) => {
        // Security check: Only allow requesters to request new photos
        if (socket.user.id !== parseInt(requesterId)) {
            console.log(`⚠️ Security warning: User ${socket.user.id} tried to request photo as requester ${requesterId}`);
            return;
        }
        
        const roomName = `user_${travelerId}`;
        console.log(`📷 Sending new photo request notification to room: ${roomName}`, {
            travelerId,
            requesterId,
            requestDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(travelerId),
                    senderId: socket.user.id,
                    type: "SYSTEM_ALERT", // Using enum value from schema
                    title: "New Photo Requested",
                    message: `The requester has asked for another verification photo.`,
                    status: "UNREAD",
                    requestId: requestDetails.requestId ? parseInt(requestDetails.requestId) : null,
                    orderId: requestDetails.orderId ? parseInt(requestDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the traveler's room
        socket.to(roomName).emit('request_new_photo', {
            type: 'NEW_PHOTO_REQUESTED',
            message: 'The requester has asked for another verification photo.',
            requestDetails
        });
    });

    // When verification process is canceled
    socket.on('process_canceled', async ({ travelerId, requesterId, requestDetails }) => {
        // Security check: Only allow requesters to cancel verification
        if (socket.user.id !== parseInt(requesterId)) {
            console.log(`⚠️ Security warning: User ${socket.user.id} tried to cancel process as requester ${requesterId}`);
            return;
        }
        
        const roomName = `user_${travelerId}`;
        console.log(`❌ Sending process cancellation notification to room: ${roomName}`, {
            travelerId,
            requesterId,
            requestDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(travelerId),
                    senderId: socket.user.id,
                    type: "REJECTED", // Using enum value from schema
                    title: "Process Cancelled",
                    message: `The verification process has been cancelled by the requester.`,
                    status: "UNREAD",
                    requestId: requestDetails.requestId ? parseInt(requestDetails.requestId) : null,
                    orderId: requestDetails.orderId ? parseInt(requestDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the traveler's room
        socket.to(roomName).emit('process_canceled', {
            type: 'PROCESS_CANCELLED',
            message: 'The verification process has been cancelled by the requester.',
            requestDetails
        });
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id, 'User:', socket.user?.id);
    });
};

// Export the handlers to be used in index.js
module.exports = notificationHandlers;
