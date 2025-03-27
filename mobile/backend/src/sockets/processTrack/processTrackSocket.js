require("dotenv").config();
// In mobile/backend/src/sockets/processTrack/processTrackSocket.js
module.exports = (processTrackIO) => {
    console.log("🔌 ProcessTrack namespace initialized");

    processTrackIO.on("connection", (socket) => {
        console.log("✅ Client connected to /processTrack namespace via Socket.IO:", socket.id);

        // Join process tracking room
        socket.on("joinProcessRoom", (data, callback) => {
            // If the data already starts with "process:", extract the raw processId
            let processId;
            if (typeof data === "string" && data.startsWith("process:")) {
                processId = data.substring("process:".length);
            } else {
                processId = data;
            }
            const roomName = `process:${processId}`;
            socket.join(roomName);
            console.log(`✅ Client ${socket.id} joined process room: ${roomName}`);
            if (typeof callback === "function") {
                callback({ success: true, room: roomName });
            }
            // Optionally, emit a separate "roomJoined" event if needed:
            socket.emit("roomJoined", {
                processId,
                room: roomName,
                success: true
            });
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
            console.log(`🤝 Offer made: process=${processId}, request=${requestId}`);
            
            // First broadcast status change to everyone
            processTrackIO.emit("processStatusChanged", {
                processId,
                requestId,
                status: "PREINITIALIZED",
                timestamp: new Date()
            });
            console.log(`📢 Broadcasting status change: PREINITIALIZED for process ${processId}`);
        });

        // When process status changes (handles subsequent states)
        socket.on("processStatusUpdate", (data) => {
            const { processId, status } = data;
            console.log(`🔄 Process ${processId} status updated to ${status}`);
            
            // Broadcast to everyone in the process room
            processTrackIO.to(`process:${processId}`).emit("processStatusChanged", {
                processId,
                status,
                timestamp: new Date()
            });
            
            // If status is INITIALIZED, we might want to broadcast to refresh orders
            if (status === "INITIALIZED") {
                console.log(`📢 Broadcasting refresh for INITIALIZED process ${processId}`);
                processTrackIO.emit("refreshOrders");
            }
        });

        socket.on("disconnect", () => {
            console.log("❌ Client disconnected from processTrack namespace:", socket.id);
        });
    });
};