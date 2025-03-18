require("dotenv").config();

module.exports = (pickupIO) => { 
  pickupIO.on("connection", (socket) => {
    console.log("✅ Client connected to /pickup namespace via Socket.IO:", socket.id);

    // Join a room based on pickupId for targeted updates
    socket.on("joinPickupRoom", (pickupId) => {
      socket.join(`pickup:${pickupId}`);
      console.log(`✅ Client ${socket.id} joined room: pickup:${pickupId}`);
    });

    // Handle suggestion updates (from Pickup.tsx)
    socket.on("suggestionUpdate", (suggestionData) => {
      console.log("📩 Received suggestionUpdate:", suggestionData);
      try {
        const pickupId = suggestionData.pickupId || suggestionData.id; // Fallback to id
        if (!pickupId) throw new Error("No pickupId or id in suggestionData");
        pickupIO.to(`pickup:${pickupId}`).emit("suggestionUpdate", suggestionData);
        console.log(`✅ Broadcasted suggestionUpdate to room: pickup:${pickupId}`);
      } catch (error) {
        console.error("❌ Error broadcasting suggestionUpdate:", error.message);
      }
    });

    // Handle pickup acceptance (from PickupTraveler.tsx or PickupOwner.tsx)
    socket.on("pickupAccepted", (pickupData) => {
      console.log("✅ Received pickupAccepted:", pickupData);
      try {
        const { id } = pickupData; // Use id as pickupId
        pickupIO.to(`pickup:${id}`).emit("pickupAccepted", pickupData);
        console.log(`✅ Broadcasted pickupAccepted to room: pickup:${id}`);
      } catch (error) {
        console.error("❌ Error broadcasting pickupAccepted:", error.message);
      }
    });

    // Handle status updates (from PickupTraveler.tsx or PickupOwner.tsx)
    socket.on("statusUpdate", (pickupData) => {
      console.log("🔄 Received statusUpdate:", pickupData);
      try {
        const { id } = pickupData; // Use id as pickupId
        pickupIO.to(`pickup:${id}`).emit("statusUpdate", pickupData);
        console.log(`✅ Broadcasted statusUpdate to room: pickup:${id}`);
      } catch (error) {
        console.error("❌ Error broadcasting statusUpdate:", error.message);
      }
    });
  });
};