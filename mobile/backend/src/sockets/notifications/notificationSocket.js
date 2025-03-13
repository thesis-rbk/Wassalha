// Handler function for notification-related socket events
// Takes a socket connection as parameter
const prisma = require('../../../prisma/index');

const notificationHandlers = (socket) => {
    // When a user connects, they join their personal notification room
    socket.on('join', (userId) => {
        if (!userId) {
            console.log('⚠️ Warning: Attempted to join room with undefined userId');
            return;
        }
        
        const roomName = `user_${userId}`;
        socket.join(roomName);
        console.log(`👤 User ${userId} joined room: ${roomName}`);
        
        // Send confirmation back to the client
        socket.emit('joined', { room: roomName, userId });
    });

    // When someone makes an offer on a request
    socket.on('offer_made', async ({ requesterId, travelerId, requestDetails }) => {
        const roomName = `user_${requesterId}`;
        console.log(`💌 Sending offer notification to room: ${roomName}`, {
            requesterId,
            travelerId,
            requestDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(requesterId),
                    type: "REQUEST",
                    title: "New Offer",
                    message: `You have received a new offer for ${requestDetails.goodsName || 'your request'}!`,
                    status: "UNREAD",
                    // Link to order if available
                    orderId: requestDetails.orderId ? parseInt(requestDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the request creator's room
        socket.to(roomName).emit('new_offer_notification', {
            type: 'NEW_OFFER',
            message: 'You have received a new offer!',
            travelerId,
            requestDetails
        });
    });

    // When someone responds to an offer (accept/reject)
    socket.on('offer_response', async ({ travelerId, status, requestDetails }) => {
        const roomName = `user_${travelerId}`;
        console.log(`✉️ Sending response notification to room: ${roomName}`, {
            travelerId,
            status,
            requestDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(travelerId),
                    type: status === 'ACCEPTED' ? "ACCEPTED" : "REJECTED",
                    title: status === 'ACCEPTED' ? "Offer Accepted" : "Offer Rejected",
                    message: `Your offer has been ${status.toLowerCase()}!`,
                    status: "UNREAD",
                    // Link to order if available
                    orderId: requestDetails.orderId ? parseInt(requestDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the traveler's room
        socket.to(roomName).emit('offer_response_notification', {
            type: status === 'ACCEPTED' ? 'OFFER_ACCEPTED' : 'OFFER_REJECTED',
            message: `Your offer has been ${status.toLowerCase()}!`,
            requestDetails
        });
    });

    // When a requester cancels an order
    socket.on('order_cancelled', async ({ travelerId, requestDetails }) => {
        const roomName = `user_${travelerId}`;
        console.log(`📝 Sending order cancellation notification to room: ${roomName}`, {
            travelerId,
            requestDetails
        });

        // Save notification to database
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: parseInt(travelerId),
                    type: "REJECTED",
                    title: "Order Cancelled",
                    message: 'An order has been cancelled by the requester',
                    status: "UNREAD",
                    // Link to order if available
                    orderId: requestDetails.orderId ? parseInt(requestDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the traveler's room
        socket.to(roomName).emit('order_cancelled_notification', {
            type: 'ORDER_CANCELLED',
            message: 'An order has been cancelled by the requester',
            requestDetails
        });
    });

    // When a traveler cancels their offer
    socket.on('offer_cancelled', async ({ requesterId, offerDetails }) => {
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
                    type: "REJECTED",
                    title: "Offer Cancelled",
                    message: 'A traveler has cancelled their offer',
                    status: "UNREAD",
                    // Link to order if available
                    orderId: offerDetails.orderId ? parseInt(offerDetails.orderId) : null
                }
            });
            console.log('✅ Notification saved to database:', notification.id);
        } catch (error) {
            console.error('❌ Error saving notification to database:', error);
            console.error('Error details:', error.stack);
        }

        // Emit to the requester's room
        socket.to(roomName).emit('offer_cancelled_notification', {
            type: 'OFFER_CANCELLED',
            message: 'A traveler has cancelled their offer',
            offerDetails
        });
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('👋 User disconnected:', socket.id);
    });
};

// Export the handlers to be used in index.js
module.exports = notificationHandlers;