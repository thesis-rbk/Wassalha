require("dotenv").config();

module.exports = (trackingProcessIO) => {
  trackingProcessIO.on("connection", (socket) => {
    console.log(
      "✅ Client connected to /processTracking namespace via Socket.IO:",
      socket.id
    );

    socket.on("offerAccepted", (data) => {
      const { orderId, travelerId } = data;
      // Broadcast to the traveler
      trackingProcessIO
        .to(`traveler:${travelerId}`)
        .emit("offerAccepted", { orderId });
    });

    // Handle pickup acceptance (from PickupTraveler.tsx or PickupOwner.tsx)
    // socket.on("offerAccepted", (goodsProcessData) => {
    //   console.log("✅ Received offerAccepted:", goodsProcessData);
    //   try {
    //     const { id } = goodsProcessData; // Use id as pickupId
    //     trackingProcessIO
    //       .to(`order:${id}`)
    //       .emit("offerAccepted", goodsProcessData);
    //     console.log(`✅ Broadcasted offerAccepted to room: order:${id}`);
    //   } catch (error) {
    //     console.error("❌ Error broadcasting offerAccepted:", error.message);
    //   }
    // });

    // Join a room based on pickupId for targeted updates
    socket.on("joinPickupRoom", (trackingProcessId) => {
      socket.join(`/processTracking:${trackingProcessId}`);
      console.log(
        `✅ Client ${socket.id} joined room: pickup:${trackingProcessId}`
      );
    });

    // Handle suggestion updates (from Pickup.tsx)
    socket.on("suggestionUpdate", (trackingProcessData) => {
      console.log("📩 Received suggestionUpdate:", trackingProcessData);
      try {
        const trackingProcessId = trackingProcessData.trackingProcess.id; // Fallback to id
        if (!trackingProcessId)
          throw new Error("No /processTrackingId or id in suggestionData");
        trackingProcessIO
          .to(`/processTracking:${trackingProcessId}`)
          .emit("suggestionUpdate", trackingProcessData);
        console.log(
          `✅ Broadcasted suggestionUpdate to room: pickup:${trackingProcessId}`
        );
      } catch (error) {
        console.error("❌ Error broadcasting suggestionUpdate:", error.message);
      }
    });

    // Handle status updates (from PickupTraveler.tsx or PickupOwner.tsx)
    socket.on("statusUpdate", (trackingProcessData) => {
      console.log("🔄 Received statusUpdate:", trackingProcessData);
      try {
        const { id } = trackingProcessData; // Use id as pickupId
        trackingProcessIO
          .to(`/processTracking:${id}`)
          .emit("statusUpdate", trackingProcessData);
        console.log(
          `✅ Broadcasted statusUpdate to room: /processTracking:${id}`
        );
      } catch (error) {
        console.error("❌ Error broadcasting statusUpdate:", error.message);
      }
    });
  });
};
