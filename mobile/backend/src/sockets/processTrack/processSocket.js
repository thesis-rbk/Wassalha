const prisma = require("../../../prisma/index");
const { getIO } = require("../../sockets");

const initializeProcess = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { request: true, traveler: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const existingProcess = await prisma.goodsProcess.findFirst({
      where: { orderId: parseInt(orderId) }
    });

    if (existingProcess) {
      return res.status(200).json({ success: true, data: existingProcess });
    }

    const process = await prisma.goodsProcess.create({
      data: {
        orderId: parseInt(orderId),
        status: "INITIALIZED",
        createdAt: new Date(),
      },
    });

    const io = getIO();
    io.of("/process").to(`user_${order.request.userId}`).emit("process_initialized", {
      processId: process.id,
      orderId: process.orderId,
    });
    io.of("/process").to(`user_${order.travelerId}`).emit("process_initialized", {
      processId: process.id,
      orderId: process.orderId,
    });

    return res.status(201).json({ success: true, data: process });
  } catch (err) {
    console.error("Error initializing process:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const cancelProcess = async (req, res) => {
  try {
    const { processId } = req.params;
    const userId = req.user.id;

    const process = await prisma.goodsProcess.findUnique({
      where: { id: parseInt(processId) },
      include: {
        order: {
          include: { request: true, traveler: true },
        },
      },
    });

    if (!process) {
      return res.status(404).json({ success: false, message: "Process not found." });
    }

    await prisma.goodsProcess.update({
      where: { id: parseInt(processId) },
      data: { status: "CANCELLED" },
    });

    const io = getIO();
    io.of("/process").to(`process_${processId}`).emit("process_canceled", { processId });

    return res.status(200).json({ success: true, message: "Process cancelled." });
  } catch (err) {
    console.error("Error cancelling process:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const updateProcessStatus = async (req, res) => {
  try {
    const { processId } = req.params;
    const { status } = req.body;

    const updatedProcess = await prisma.goodsProcess.update({
      where: { id: parseInt(processId) },
      data: { status },
    });

    const io = getIO();
    io.of("/process").to(`process_${processId}`).emit(`process_${processId}_updated`, {
      processId: updatedProcess.id,
      status: updatedProcess.status,
    });

    return res.status(200).json({ success: true, data: updatedProcess });
  } catch (err) {
    console.error("Error updating process status:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const orderCreated = async ({ requestId, orderId }) => {
  const io = getIO();
  io.of("/process").to(`request_${requestId}`).emit("order_created", {
    requestId,
    orderId,
  });
};

const requestUpdated = async ({ requestId }) => {
  const io = getIO();
  io.of("/process").to(`request_${requestId}`).emit("request_updated", {
    requestId,
  });
};

const verificationSubmitted = async ({ processId }) => {
  const io = getIO();
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_verification_submitted`, { processId });
};

const processCanceled = async ({ processId }) => {
  const io = getIO();
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_canceled`, { processId });
};

const verificationApproved = async ({ processId }) => {
  const io = getIO();
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_verification_approved`, { processId });
};

const newPhotoRequested = async ({ processId, reason }) => {
  const io = getIO();
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_new_photo_requested`, { processId, reason });
};

// New handlers for PaymentSO frontend
const paymentInitiated = async ({ processId }) => {
  const io = getIO();
  io.of("/process").to(`process_${processId}`).emit("payment_initiated", { processId });
};

const paymentCompleted = async ({ processId }) => {
  const io = getIO();
  io.of("/process").to(`process_${processId}`).emit("payment_completed", { processId });
};

const paymentFailed = async ({ processId }) => {
  const io = getIO();
  io.of("/process").to(`process_${processId}`).emit("payment_failed", { processId });
};

// Handler function for process tracking socket events
const processSocketHandlers = (socket) => {
    // Automatically join the authenticated user's notification room
    const userId = socket.user.id;
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`👤 Process tracking: User ${userId} joined room: ${roomName}`);
    
    // Send confirmation back to the client
    socket.emit('joined', { room: roomName, userId });

    // Event: join_process_room
    // Purpose: Allows a user to join a specific process room to receive updates about that process
    // Triggered: When a user navigates to a process detail screen and needs real-time updates
    // Params: processId - The ID of the process to join
    socket.on('join_process_room', ({ processId }) => {
        const processRoom = `process_${processId}`;
        socket.join(processRoom);
        console.log(`User ${userId} joined process room: ${processRoom}`);
        socket.emit('joined_process', { room: processRoom, processId });
    });

    // Event: update_process_status
    // Purpose: Updates the status of a process and notifies all participants
    // Triggered: When a user completes a step in the process (e.g., confirms product, completes payment)
    // Params: processId - The ID of the process to update
    //         status - The new status to set (e.g., "INITIALIZED", "CONFIRMED", "PAID")
    socket.on('update_process_status', async ({ processId, status }) => {
        try {
            // Get process details to check permissions
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });

            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                return;
            }

            // Check if user has permission (either requester or traveler)
            const requesterId = process.order.request.userId;
            const travelerId = process.order.travelerId;
            
            if (socket.user.id !== requesterId && socket.user.id !== travelerId) {
                console.log(`⚠️ Security warning: User ${socket.user.id} tried to update process ${processId} without permission`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }

            // Update process status
            await prisma.goodsProcess.update({
                where: { id: parseInt(processId) },
                data: { status }
            });

            // Broadcast to process room
            socket.to(`process_${processId}`).emit(`process_${processId}_updated`, {
                processId,
                status,
                updatedBy: socket.user.id
            });

            console.log(`✅ Process ${processId} status updated to ${status} by user ${socket.user.id}`);
        } catch (error) {
            console.error('❌ Error updating process status:', error);
            socket.emit('error', { message: 'Failed to update process status' });
        }
    });

    // Event: submit_verification_photo
    // Purpose: Notifies the requester that a verification photo has been submitted
    // Triggered: When a traveler uploads a photo of the product for verification
    // Params: processId - The ID of the process being verified
    socket.on('submit_verification_photo', async ({ processId }) => {
        try {
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });

            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                return;
            }

            // Only traveler can submit verification
            if (socket.user.id !== process.order.travelerId) {
                console.log(`⚠️ Security warning: User ${socket.user.id} tried to submit verification as traveler ${process.order.travelerId}`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }

            // Broadcast to process room
            socket.to(`process_${processId}`).emit(`process_${processId}_verification_submitted`, {
                processId,
                travelerId: socket.user.id
            });

            console.log(`📸 Verification photo submitted for process ${processId} by traveler ${socket.user.id}`);
        } catch (error) {
            console.error('❌ Error submitting verification photo:', error);
            socket.emit('error', { message: 'Failed to submit verification photo' });
        }
    });

    // Event: request_new_photo
    // Purpose: Asks the traveler to submit a new verification photo
    // Triggered: When the requester is not satisfied with the current verification photo
    // Params: processId - The ID of the process
    //         reason - Optional message explaining why a new photo is needed
    socket.on('request_new_photo', async ({ processId, reason }) => {
        try {
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });

            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                return;
            }

            // Only requester can request new photo
            if (socket.user.id !== process.order.request.userId) {
                console.log(`⚠️ Security warning: User ${socket.user.id} tried to request photo as requester ${process.order.request.userId}`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }

            // Broadcast to process room
            socket.to(`process_${processId}`).emit(`process_${processId}_new_photo_requested`, {
                processId,
                reason,
                requesterId: socket.user.id
            });

            console.log(`📷 New photo requested for process ${processId} by requester ${socket.user.id}`);
        } catch (error) {
            console.error('❌ Error requesting new photo:', error);
            socket.emit('error', { message: 'Failed to request new photo' });
        }
    });

    // Event: cancel_process
    // Purpose: Cancels a process and notifies all participants
    // Triggered: When either party decides to cancel the transaction
    // Params: processId - The ID of the process to cancel
    socket.on('cancel_process', async ({ processId }) => {
        try {
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });

            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                return;
            }

            // Check if user has permission (either requester or traveler)
            const requesterId = process.order.request.userId;
            const travelerId = process.order.travelerId;
            
            if (socket.user.id !== requesterId && socket.user.id !== travelerId) {
                console.log(`⚠️ Security warning: User ${socket.user.id} tried to cancel process ${processId} without permission`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }

            // Update process status
            await prisma.goodsProcess.update({
                where: { id: parseInt(processId) },
                data: { status: 'CANCELLED' }
            });

            // Broadcast to process room
            socket.to(`process_${processId}`).emit(`process_${processId}_canceled`, {
                processId,
                cancelledBy: socket.user.id
            });

            console.log(`❌ Process ${processId} cancelled by user ${socket.user.id}`);
        } catch (error) {
            console.error('❌ Error cancelling process:', error);
            socket.emit('error', { message: 'Failed to cancel process' });
        }
    });

    // Event: payment_initiated
    // Purpose: Notifies the traveler that payment has been initiated by the requester
    // Triggered: When the requester starts the payment process
    // Params: processId - The ID of the process being paid for
    socket.on('payment_initiated', async ({ processId }) => {
        try {
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });

            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                return;
            }

            // Only requester can initiate payment
            if (socket.user.id !== process.order.request.userId) {
                console.log(`⚠️ Security warning: User ${socket.user.id} tried to initiate payment as requester ${process.order.request.userId}`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }

            // Broadcast to process room
            socket.to(`process_${processId}`).emit('payment_initiated', {
                processId,
                requesterId: socket.user.id
            });

            console.log(`💰 Payment initiated for process ${processId} by requester ${socket.user.id}`);
        } catch (error) {
            console.error('❌ Error initiating payment:', error);
            socket.emit('error', { message: 'Failed to initiate payment' });
        }
    });

    // Event: payment_completed
    // Purpose: Notifies both parties that payment has been successfully completed
    // Triggered: When the payment is successfully processed
    // Params: processId - The ID of the process
    socket.on('payment_completed', async ({ processId }) => {
        try {
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });

            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                return;
            }

            // Only requester can complete payment
            if (socket.user.id !== process.order.request.userId) {
                console.log(`⚠️ Security warning: User ${socket.user.id} tried to complete payment as requester ${process.order.request.userId}`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }

            // Update process status
            await prisma.goodsProcess.update({
                where: { id: parseInt(processId) },
                data: { status: 'PAID' }
            });

            // Broadcast to process room
            socket.to(`process_${processId}`).emit('payment_completed', {
                processId,
                requesterId: socket.user.id
            });

            console.log(`✅ Payment completed for process ${processId} by requester ${socket.user.id}`);
        } catch (error) {
            console.error('❌ Error completing payment:', error);
            socket.emit('error', { message: 'Failed to complete payment' });
        }
    });

    // Event: payment_failed
    // Purpose: Notifies both parties that a payment attempt has failed
    // Triggered: When a payment transaction fails
    // Params: processId - The ID of the process
    //         errorMessage - Optional message explaining the payment failure
    socket.on('payment_failed', async ({ processId, errorMessage }) => {
        try {
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });

            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                return;
            }

            // Only requester can report payment failure
            if (socket.user.id !== process.order.request.userId) {
                console.log(`⚠️ Security warning: User ${socket.user.id} tried to report payment failure as requester ${process.order.request.userId}`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }

            // Broadcast to process room
            socket.to(`process_${processId}`).emit('payment_failed', {
                processId,
                requesterId: socket.user.id,
                errorMessage
            });

            console.log(`❌ Payment failed for process ${processId} by requester ${socket.user.id}: ${errorMessage || 'No error details'}`);
        } catch (error) {
            console.error('❌ Error reporting payment failure:', error);
            socket.emit('error', { message: 'Failed to report payment failure' });
        }
    });

    // Event: disconnect
    // Purpose: Cleans up when a user disconnects from the socket
    // Triggered: Automatically when the client disconnects
    socket.on('disconnect', () => {
        console.log('👋 User disconnected from process socket:', socket.id, 'User:', socket.user?.id);
    });
};

// Export the handlers to be used in index.js
module.exports = processSocketHandlers;
