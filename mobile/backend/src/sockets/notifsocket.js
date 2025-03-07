const socketIo = require("socket.io");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });


io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Example: Traveler confirms pickup
  socket.on('pickupScheduled', (data) => {
    // Simulate traveler confirmation after some logic
    setTimeout(() => {
      io.emit('pickupConfirmation', {
        orderId: data.orderId,
        pickupType: data.pickupType,
      });
    }, 5000); // Simulated delay
  });

  // Example: Traveler suggests a different pickup type
  socket.on('pickupScheduled', (data) => {
    if (data.pickupType === 'IN_PERSON') { // Example condition
      setTimeout(() => {
        io.emit('pickupSuggestion', {
          orderId: data.orderId,
          suggestedType: 'DELIVERY',
        });
      }, 7000); // Simulated delay
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
}