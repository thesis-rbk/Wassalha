const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins (adjust for production)
        methods: ['GET', 'POST'],
    },
});

// Store connected users
const connectedUsers = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Register user with their ID
    socket.on('register', (userId) => {
        connectedUsers[userId] = socket.id;
        console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (let userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
    });

    // Allow manual notification sending from client
    socket.on('sendNotification', ({ userId, message }) => {
        const targetSocketId = connectedUsers[userId];
        if (targetSocketId) {
            io.to(targetSocketId).emit('notification', { message });
        } else {
            console.log(`User ${userId} not connected`);
        }
    });
});


app.get('/', (req, res) => {
    res.send('Socket.IO server running');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
