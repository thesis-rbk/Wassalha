// mobile/backend/src/sockets/chat/chatSocket.js
const prisma = require('../../../prisma/index');
const chatService = require('../../services/chatService');
const authenticateSocket = async (socket, next) => {
  // TEMPORARY: Attach a mock user object to the socket
  // This allows socket.user.id to work in our handlers
  socket.user = { 
    id: socket.handshake.query.userId ? parseInt(socket.handshake.query.userId) : 1
  };
  
  // Log this bypass to make it obvious in server logs
  console.warn('⚠️ WARNING: Using temporary socket authentication bypass');
  
  next();
};

// Store the IO instance
let io;

// Add this function
const setIO = (ioInstance) => {
  io = ioInstance;
};

// Define the chat handlers function with IO parameter
const chatHandlers = (socket) => {
    console.log('🗨️ New chat connection:', socket.id);

    // When a user joins a chat room
    socket.on('join_chat', (chatId) => {
        if (!chatId) {
            console.log('⚠️ Warning: Attempted to join chat with undefined chatId');
            return;
        }
        
        const roomName = `chat_${chatId}`;
        socket.join(roomName);
        console.log(`👤 User joined chat room: ${roomName}`);
        
        // Send confirmation back to the client
        socket.emit('joined_chat', { room: roomName, chatId });
    });

    // When a user sends a message - FIXED VERSION
    socket.on('send_message', async (data) => {
        try {
            const { chatId, content, type = 'text', mediaId } = data;
            const userId = socket.user?.id;
            
            if (!userId) {
                socket.emit('error', { message: 'Authentication required' });
                return;
            }
            
            // DIRECT IMPLEMENTATION instead of using chatService
            // Find the chat to get the other user's ID
            const chat = await prisma.chat.findUnique({
                where: { id: parseInt(chatId) }
            });
            
            if (!chat) {
                throw new Error('Chat not found');
            }
            
            // Ensure sender is part of this chat
            if (chat.requesterId !== userId && chat.providerId !== userId) {
                throw new Error('Unauthorized access to chat');
            }
            
            // Determine receiver ID (the other user)
            const receiverId = chat.requesterId === userId ? chat.providerId : chat.requesterId;
            
            // Create the message
            const message = await prisma.message.create({
                data: {
                    chatId: parseInt(chatId),
                    senderId: userId,
                    receiverId,
                    type,
                    content,
                    mediaId: mediaId ? parseInt(mediaId) : undefined,
                    isRead: false,
                    time: new Date()
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            profile: {
                                select: {
                                    imageId: true
                                }
                            }
                        }
                    },
                    media: true
                }
            });
            
            // Use the stored io instead of getIO()
            if (io) {
                io.of('/chat').to(`chat_${chatId}`).emit('receive_message', message);
            } else {
                console.error('IO instance not available');
            }
            
            // Confirm to sender
            socket.emit('message_sent', { 
                success: true, 
                messageId: message.id,
                timestamp: message.time
            });
            
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: error.message || 'Failed to send message' });
        }
    });

    // When a user marks a message as read
    socket.on('mark_read', async (data) => {
        try {
            const { messageId } = data;
            const userId = socket.user?.id;
            
            if (!userId) {
                socket.emit('error', { message: 'Authentication required' });
                return;
            }
            
            // DIRECT IMPLEMENTATION instead of using chatService
            // Find the message
            const message = await prisma.message.findUnique({
                where: { id: parseInt(messageId) },
                include: { chat: true }
            });
            
            if (!message) {
                throw new Error('Message not found');
            }
            
            // Ensure user is the recipient
            if (message.receiverId !== userId) {
                throw new Error('Unauthorized access to message');
            }
            
            // Update the message
            const updatedMessage = await prisma.message.update({
                where: { id: parseInt(messageId) },
                data: { isRead: true }
            });
            
            // Notify the sender
            if (io) {
                io.of('/chat').to(`chat_${message.chatId}`).emit('message_read', { 
                    messageId, 
                    chatId: message.chatId 
                });
            } else {
                console.error('IO instance not available for read receipt');
                // Still mark as read in database even if broadcasting fails
            }
            
            // Success response
            socket.emit('read_confirmed', { messageId });
            
        } catch (error) {
            console.error('Error marking message as read:', error);
            socket.emit('error', { message: error.message || 'Failed to mark message as read' });
        }
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('👋 User disconnected from chat:', socket.id);
    });
};

// Export both functions plus setIO
module.exports = {
    chatHandlers,
    authenticateSocket,
    setIO
};