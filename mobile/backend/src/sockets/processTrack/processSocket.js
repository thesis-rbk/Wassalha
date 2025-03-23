const prisma = require("../../../prisma/index");

// Add a variable to store IO reference
let io;

// Add this function to set the IO instance
const setProcessIO = (ioInstance) => {
  io = ioInstance;
};

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

    if (!io) {
      console.error("IO not initialized in processSocket");
      return res.status(500).json({ success: false, message: "Server error." });
    }
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

    if (!io) {
      console.error("IO not initialized in processSocket");
      return res.status(500).json({ success: false, message: "Server error." });
    }
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

    if (!io) {
      console.error("IO not initialized in processSocket");
      return res.status(500).json({ success: false, message: "Server error." });
    }
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
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`request_${requestId}`).emit("order_created", {
    requestId,
    orderId,
  });
};

const requestUpdated = async ({ requestId }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`request_${requestId}`).emit("request_updated", {
    requestId,
  });
};

const verificationSubmitted = async ({ processId }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_verification_submitted`, { processId });
};

const processCanceled = async ({ processId }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_canceled`, { processId });
};

const verificationApproved = async ({ processId }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_verification_approved`, { processId });
};

const newPhotoRequested = async ({ processId, reason }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`process_${processId}`).emit(`process_${processId}_new_photo_requested`, { processId, reason });
};

// New handlers for PaymentSO frontend
const paymentInitiated = async ({ processId }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`process_${processId}`).emit("payment_initiated", { processId });
};

const paymentCompleted = async ({ processId }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`process_${processId}`).emit("payment_completed", { processId });
};

const paymentFailed = async ({ processId }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").to(`process_${processId}`).emit("payment_failed", { processId });
};

// Add this helper function to verify process access
const verifyProcessAccess = async (processId, userId) => {
  try {
    const process = await prisma.goodsProcess.findUnique({
      where: { id: parseInt(processId) },
      include: { order: { include: { request: true, traveler: true } } }
    });
    
    if (!process) {
      return { 
        hasAccess: false, 
        error: 'Process not found'
      };
    }
    
    const requesterId = process.order.request.userId;
    const travelerId = process.order.travelerId;
    
    if (userId !== requesterId && userId !== travelerId) {
      return { 
        hasAccess: false, 
        error: 'Permission denied' 
      };
    }
    
    return {
      hasAccess: true,
      isRequester: userId === requesterId,
      isTraveler: userId === travelerId,
      process
    };
  } catch (error) {
    console.error(`Error verifying process access:`, error);
    return { hasAccess: false, error: 'Server error' };
  }
};

// Add this helper function for error handling
const handleError = (socket, event, error, processId) => {
  console.error(`❌ Error in ${event} for process ${processId}:`, error);
  socket.emit('error', { 
    message: `Failed to ${event.replace(/_/g, ' ')}`,
    details: error.message
  });
};

// Handler function for process tracking socket events
const processSocketHandlers = (socket) => {
    // Verify user authentication
    if (!socket.user || !socket.user.id) {
        console.error("👀 Unauthenticated socket connection attempt:", socket.id);
        socket.emit('error', { message: 'Authentication required' });
        socket.disconnect();
        return;
    }

    const userId = socket.user.id;
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`👤 Process tracking: User ${userId} joined room: ${roomName}`);
    
    // Send confirmation back to the client
    socket.emit('joined', { room: roomName, userId });

    // FIX: Handle 'join' event with direct processId value
    socket.on('join', async (data) => {
        // Check if this is a user room join (data matches the authenticated user ID)
        if (data === socket.user.id) {
            const roomName = `user_${data}`;
            socket.join(roomName);
            console.log(`👤 User ${data} joined their user room: ${roomName}`);
            socket.emit('joined', { room: roomName, userId: data });
            return;
        }
        
        // If we reach here, it's a process room join
        console.log(`🔍 User ${socket.user.id} attempting to join process with data:`, data);
        
        if (!data) {
            socket.emit('error', { message: 'Process ID is required' });
            return;
        }
        
        try {
            // Parse to integer if it's a string
            const processIdInt = typeof data === 'string' ? parseInt(data) : data;
            
            // Verify process exists and user has access
            const process = await prisma.goodsProcess.findUnique({
                where: { id: processIdInt },
                include: { order: { include: { request: true, traveler: true } } }
            });
            
            if (!process) {
                console.log(`❌ Process ${data} not found for user ${socket.user.id}`);
                socket.emit('error', { message: 'Process not found' });
                return;
            }
            
            const requesterId = process.order.request.userId;
            const travelerId = process.order.travelerId;
            
            if (socket.user.id !== requesterId && socket.user.id !== travelerId) {
                console.log(`⚠️ User ${socket.user.id} denied access to process ${data}`);
                socket.emit('error', { message: 'Permission denied' });
                return;
            }
            
            const processRoom = `process_${data}`;
            socket.join(processRoom);
            console.log(`✅ User ${socket.user.id} joined process room: ${processRoom}`);
            
            socket.emit('joined_process', {
                room: processRoom,
                processId: data,
                role: socket.user.id === requesterId ? 'requester' : 'traveler',
                process: {
                    id: process.id,
                    status: process.status,
                    orderId: process.orderId
                }
            });
        } catch (error) {
            console.error(`❌ Error joining process room ${data}:`, error);
            socket.emit('error', { 
                message: 'Failed to join process room',
                details: error.message
            });
        }
    });

    // Keep your original join_process_room handler for backward compatibility
    socket.on('join_process_room', async ({ processId }) => {
        console.log(`🔍 User ${userId} attempting to join process room for process ${processId}`);
        
        if (!processId) {
            socket.emit('error', { message: 'Process ID is required' });
            return;
        }
        
        try {
            // Verify process exists and user has access
            const process = await prisma.goodsProcess.findUnique({
                where: { id: parseInt(processId) },
                include: { order: { include: { request: true, traveler: true } } }
            });
            
            if (!process) {
                socket.emit('error', { message: 'Process not found' });
                console.log(`❌ Process ${processId} not found for user ${userId}`);
                return;
            }
            
            const requesterId = process.order.request.userId;
            const travelerId = process.order.travelerId;
            
            if (userId !== requesterId && userId !== travelerId) {
                socket.emit('error', { message: 'Permission denied' });
                console.log(`⚠️ User ${userId} denied access to process ${processId}`);
                return;
            }
            
            const processRoom = `process_${processId}`;
            socket.join(processRoom);
            console.log(`✅ User ${userId} joined process room: ${processRoom}`);
            
            // IMPROVED: Send more detailed response with role information
            socket.emit('joined_process', {
                room: processRoom,
                processId,
                role: userId === requesterId ? 'requester' : 'traveler',
                process: {
                    id: process.id,
                    status: process.status,
                    orderId: process.orderId
                }
            });
        } catch (error) {
            console.error(`❌ Error joining process room ${processId}:`, error);
            socket.emit('error', { 
                message: 'Failed to join process room',
                details: error.message
            });
        }
    });

    // Event: update_process_status
    socket.on('update_process_status', async ({ processId, status }) => {
        if (!processId || !status) {
            socket.emit('error', { message: 'Process ID and status are required' });
            return;
        }
        
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess) {
                socket.emit('error', { message: access.error });
                return;
            }

            // Update process status
            await prisma.goodsProcess.update({
                where: { id: parseInt(processId) },
                data: { status }
            });

            // Update cached data
            if (access.process) {
                access.process.status = status;
            }

            // Notify everyone including sender for consistency
            const eventData = {
                processId,
                status,
                updatedBy: userId
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit(`process_${processId}_updated`, eventData);
            socket.emit(`process_${processId}_updated`, eventData); // Also notify sender for consistency
            
            console.log(`✅ Process ${processId} status updated to ${status} by user ${userId}`);
        } catch (error) {
            handleError(socket, 'update_process_status', error, processId);
        }
    });

    // Event: submit_verification_photo
    socket.on('submit_verification_photo', async ({ processId }) => {
        if (!processId) {
            socket.emit('error', { message: 'Process ID is required' });
            return;
        }
        
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess || !access.isTraveler) {
                socket.emit('error', { message: access.isTraveler ? access.error : 'Only travelers can submit verification' });
                return;
            }

            const eventData = {
                processId,
                travelerId: userId
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit(`process_${processId}_verification_submitted`, eventData);
            socket.emit(`process_${processId}_verification_submitted`, eventData); // Also notify sender
            
            console.log(`📸 Verification photo submitted for process ${processId} by traveler ${userId}`);
        } catch (error) {
            handleError(socket, 'submit_verification_photo', error, processId);
        }
    });

    // Event: request_new_photo
    socket.on('request_new_photo', async ({ processId, reason }) => {
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess || !access.isRequester) {
                socket.emit('error', { message: access.isRequester ? access.error : 'Only requesters can request new photo' });
                return;
            }

            const eventData = {
                processId,
                reason,
                requesterId: userId
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit(`process_${processId}_new_photo_requested`, eventData);
            socket.emit(`process_${processId}_new_photo_requested`, eventData); // Also notify sender
            
            console.log(`📷 New photo requested for process ${processId} by requester ${userId}`);
        } catch (error) {
            handleError(socket, 'request_new_photo', error, processId);
        }
    });

    // Event: cancel_process
    socket.on('cancel_process', async ({ processId }) => {
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess) {
                socket.emit('error', { message: access.error });
                return;
            }

            // Update process status
            await prisma.goodsProcess.update({
                where: { id: parseInt(processId) },
                data: { status: 'CANCELLED' }
            });

            // Notify everyone including sender for consistency
            const eventData = {
                processId,
                cancelledBy: userId
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit(`process_${processId}_canceled`, eventData);
            socket.emit(`process_${processId}_canceled`, eventData); // Also notify sender
            
            console.log(`❌ Process ${processId} cancelled by user ${userId}`);
        } catch (error) {
            handleError(socket, 'cancel_process', error, processId);
        }
    });

    // Event: payment_initiated
    socket.on('payment_initiated', async ({ processId }) => {
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess || !access.isRequester) {
                socket.emit('error', { message: access.isRequester ? access.error : 'Only requesters can initiate payment' });
                return;
            }

            const eventData = {
                processId,
                requesterId: userId
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit('payment_initiated', eventData);
            socket.emit('payment_initiated', eventData); // Also notify sender
            
            console.log(`💰 Payment initiated for process ${processId} by requester ${userId}`);
        } catch (error) {
            handleError(socket, 'payment_initiated', error, processId);
        }
    });

    // Event: payment_completed
    socket.on('payment_completed', async ({ processId }) => {
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess || !access.isRequester) {
                socket.emit('error', { message: access.isRequester ? access.error : 'Only requesters can complete payment' });
                return;
            }

            // Update process status
            await prisma.goodsProcess.update({
                where: { id: parseInt(processId) },
                data: { status: 'PAID' }
            });

            // Notify everyone including sender for consistency
            const eventData = {
                processId,
                requesterId: userId
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit('payment_completed', eventData);
            socket.emit('payment_completed', eventData); // Also notify sender
            
            console.log(`✅ Payment completed for process ${processId} by requester ${userId}`);
        } catch (error) {
            handleError(socket, 'payment_completed', error, processId);
        }
    });

    // Event: payment_failed
    socket.on('payment_failed', async ({ processId, errorMessage }) => {
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess || !access.isRequester) {
                socket.emit('error', { message: access.isRequester ? access.error : 'Only requesters can report payment failure' });
                return;
            }

            const eventData = {
                processId,
                requesterId: userId,
                errorMessage
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit('payment_failed', eventData);
            socket.emit('payment_failed', eventData); // Also notify sender
            
            console.log(`❌ Payment failed for process ${processId} by requester ${userId}: ${errorMessage || 'No error details'}`);
        } catch (error) {
            handleError(socket, 'payment_failed', error, processId);
        }
    });

    // Event: approve_verification
    socket.on('approve_verification', async ({ processId }) => {
        try {
            const access = await verifyProcessAccess(processId, userId);
            
            if (!access.hasAccess || !access.isRequester) {
                socket.emit('error', { message: access.isRequester ? access.error : 'Only requesters can approve verification' });
                return;
            }

            const eventData = {
                processId,
                requesterId: userId
            };
            
            const roomName = `process_${processId}`;
            socket.to(roomName).emit(`process_${processId}_verification_approved`, eventData);
            socket.emit(`process_${processId}_verification_approved`, eventData); // Also notify sender
            
            console.log(`✅ Verification approved for process ${processId} by requester ${userId}`);
        } catch (error) {
            handleError(socket, 'approve_verification', error, processId);
        }
    });

    // Event: disconnect
    socket.on('disconnect', () => {
        console.log('👋 User disconnected from process socket:', socket.id, 'User:', userId);
    });
};

// Add the requestCreated function
const requestCreated = async ({ requestId, requestData }) => {
  if (!io) {
    console.error("IO not initialized in processSocket");
    return;
  }
  io.of("/process").emit("request_created", {
    requestId,
    requestData
  });
  console.log(`🆕 New request created and broadcast: ${requestId}`);
};

// Export the handlers to be used in index.js
module.exports = {
  processSocketHandlers,   // The socket handler function
  setProcessIO,            // Function to set the IO instance
  orderCreated,            // Utility to emit order creation events
  requestCreated,          // Already defined earlier in the file
  requestUpdated,          // Utility to emit request update events
  verificationSubmitted,   // And so on...
  processCanceled,
  verificationApproved,
  newPhotoRequested,
  paymentInitiated,
  paymentCompleted,
  paymentFailed
};
