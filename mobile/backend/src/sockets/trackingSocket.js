require("dotenv").config(); // ✅ Load environment variables
const socketIo = require("socket.io");
const axios = require("axios");

module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected to backend via Socket.IO");

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
      console.log("❌ Client disconnected");
    });
  });
};

// ✅ Fetch flight data from AviationStack API (Instead of OpenSky)
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
  
      const liveFlight = data.find(f => f.live !== null);
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
  