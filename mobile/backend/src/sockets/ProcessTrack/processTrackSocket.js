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
        socket.on("offerMadeOrder", (data) => {
            const { processId, requestId } = data;
            console.log(`🤝 Offer made order for request ${requestId}, process ${processId} (PREINITIALIZED)`);
            const offer={
                processId,
                requestId,
                status: "PREINITIALIZED",
                timestamp: new Date()
            }
            console.log(offer,"offeeeeeeer backend")
            processTrackIO.to(`process:${processId}`).emit("offerMadeOrder", offer);
        });
        socket.on("photo", (data) => {
            const  {processId}  = data;
            console.log(`🔄 verification photo${processId}  updated to `);
            
            processTrackIO.to(`process:${processId}`).emit("photo", {
                processId
            });
        });
        socket.on("confirmProduct", (data) => {
            const {processId}   = data;
            console.log(`🔄 verification product${processId}  updated to `);
            
            processTrackIO.to(`process:${processId}`).emit("confirmProduct", {
                processId
            });
        });
        socket.on("confirmPayment", (data) => {
            const {processId}   = data;
            console.log(`🔄 verification payment${processId}  updated to `);
            processTrackIO.to(`process:${processId}`).emit("confirmPayment", {
                processId
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