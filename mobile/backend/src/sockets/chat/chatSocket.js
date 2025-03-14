// mobile/backend/src/sockets/chat/chatSocket.js
const prisma = require('../../../prisma/index');

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

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('👋 User disconnected from chat:', socket.id);
    });
};

module.exports = chatHandlers;