require("dotenv").config();
// In mobile/backend/src/sockets/processTrack/processTrackSocket.js
module.exports = (processTrackIO) => {
    console.log("🔌 ProcessTrack namespace initialized");

    processTrackIO.on("connection", (socket) => {
        console.log("✅ Client connected to /processTrack namespace via Socket.IO:", socket.id);

        // Join process tracking room
        socket.on("joinProcessRoom", (processId) => {
            socket.join(`process:${processId}`);
            console.log(`✅ Client ${socket.id} joined process room: ${processId}`);
        });

        // When a new request is created (PENDING)
        socket.on("requestCreated", (data) => {
            const { requestId } = data;
            console.log(`📝 New request created: ${requestId} (PENDING)`);
            
            socket.broadcast.emit("newRequest", {
                requestId,
                status: "PENDING",
                timestamp: new Date()
            });
        });

        // When traveler makes an offer (PREINITIALIZED)
        socket.on("offerMade", (data) => {
            const { processId, requestId } = data;
            console.log(`🤝 Offer made for request ${requestId}, process ${processId} (PREINITIALIZED)`);
            
            processTrackIO.to(`process:${processId}`).emit("processStatusChanged", {
                processId,
                requestId,
                status: "PREINITIALIZED",
                timestamp: new Date()
            });
        });

        // When process status changes (handles subsequent states)
        socket.on("processStatusUpdate", (data) => {
            const { processId, status } = data;
            console.log(`🔄 Process ${processId} status updated to ${status}`);
            
            processTrackIO.to(`process:${processId}`).emit("processStatusChanged", {
                processId,
                status,
                timestamp: new Date()
            });
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected from processTrack namespace:", socket.id);
        });
    });
};