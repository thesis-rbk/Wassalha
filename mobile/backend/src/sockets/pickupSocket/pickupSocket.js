require("dotenv").config();
const socketIo = require("socket.io");
const axios = require("axios");

module.exports = (io) => { // Changed from (server) to (io) since io is passed from server.js
  io.on("connection", (socket) => {
    console.log("✅ Client connected to backend via Socket.IO:", socket.id);

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
        io.to(`pickup:${pickupId}`).emit("suggestionUpdate", suggestionData);
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
        io.to(`pickup:${id}`).emit("pickupAccepted", pickupData);
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
        io.to(`pickup:${id}`).emit("statusUpdate", pickupData);
        console.log(`✅ Broadcasted statusUpdate to room: pickup:${id}`);
      } catch (error) {
        console.error("❌ Error broadcasting statusUpdate:", error.message);
      }
    });

    // Existing flight tracking logic (unchanged)
    socket.on("trackFlight", async (flightNumber) => {
      console.log("🛬 Received trackFlight request for:", flightNumber);
      try {
        const flightData = await getFlightLocation(flightNumber);
        if (flightData) {
          console.log("✅ Sending flight update:", flightData);
          socket.emit("flightUpdate", flightData);
        } else {
          console.log("❌ No flight data found for:", flightNumber);
        }
      } catch (error) {
        console.error("❌ Error handling trackFlight:", error.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

// Existing flight data function (unchanged)
async function getFlightLocation(flightNumber) {
  console.log(`🌍 Fetching flight data for: ${flightNumber} from AviationStack...`);
  try {
    const API_KEY = process.env.AVIATIONSTACK_API_KEY;
    let response = await axios.get(
      `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flightNumber}`
    );
    if (!response.data.data || response.data.data.length === 0) {
      console.log("⚠️ No data found with IATA. Trying ICAO...");
      response = await axios.get(
        `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_icao=${flightNumber}`
      );
    }
    if (!response.data.data || response.data.data.length === 0) {
      console.log("⚠️ No data found with ICAO. Trying Callsign...");
      response = await axios.get(
        `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&callsign=${flightNumber}`
      );
    }
    console.log("🔍 Full API Response:", JSON.stringify(response.data, null, 2));
    const data = response.data.data;
    if (!data || data.length === 0) {
      console.log("❌ No flight data found.");
      return null;
    }
    const liveFlight = data.find((f) => f.live !== null);
    if (!liveFlight) {
      console.log("❌ No real-time tracking available for this flight.");
      return null;
    }
    console.log(`✅ Flight ${flightNumber} found:`, {
      airline: liveFlight.airline.name,
      departure: liveFlight.departure.airport,
      arrival: liveFlight.arrival.airport,
      estimatedArrival: liveFlight.arrival.estimated,
      lat: liveFlight.live.latitude,
      lon: liveFlight.live.longitude,
      altitude: liveFlight.live.altitude,
      speed: liveFlight.live.speed_horizontal || "⚠️ Speed not provided",
    });
    return {
      airline: liveFlight.airline.name,
      departure: liveFlight.departure.airport,
      arrival: liveFlight.arrival.airport,
      estimatedArrival: liveFlight.arrival.estimated,
      lat: liveFlight.live.latitude,
      lon: liveFlight.live.longitude,
      altitude: liveFlight.live.altitude,
      speed: liveFlight.live.speed_horizontal ?? 0,
    };
  } catch (error) {
    console.error("❌ Error fetching flight data:", error.message);
  }
  return null;
}