require("dotenv").config(); // ✅ Load environment variables
const axios = require("axios");

// Handler function for flight tracking socket events
const trackingHandlers = (socket) => {
    // When client requests to track a flight
    socket.on("trackFlight", async (flightNumber) => {
        console.log("🛬 Received trackFlight request for:", flightNumber);
        try {
            // Get flight location data
            const flightData = await getFlightLocation(flightNumber);
            if (flightData) {
                // Send flight data back to the requesting client
                socket.emit("flightUpdate", flightData);
            }
        } catch (error) {
            console.error("❌ Error tracking flight:", error);
        }
    });
};

// ✅ Fetch flight data from AviationStack API (Instead of OpenSky)
async function getFlightLocation(flightNumber) {
    console.log(`🌍 Fetching flight data for: ${flightNumber} from AviationStack...`);
  
    try {
        const API_KEY = process.env.AVIATIONSTACK_API_KEY;
        
        // Try IATA code first
        let response = await axios.get(
            `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flightNumber}`
        );
        
        // If no data, try ICAO code
        if (!response.data.data || response.data.data.length === 0) {
            console.log("⚠️ No data found with IATA. Trying ICAO...");
            response = await axios.get(
                `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_icao=${flightNumber}`
            );
        }
        
        // If still no data, try callsign
        if (!response.data.data || response.data.data.length === 0) {
            console.log("⚠️ No data found with ICAO. Trying Callsign...");
            response = await axios.get(
                `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}&callsign=${flightNumber}`
            );
        }

        // Process and return flight data
        const data = response.data.data;
        if (!data || data.length === 0) {
            console.log("❌ No flight data found.");
            return null;
        }

        // Find flight with live data
        const liveFlight = data.find(f => f.live !== null);
        if (!liveFlight) {
            console.log("❌ No real-time tracking available for this flight.");
            return null;
        }

        // Return formatted flight data
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
  
module.exports = {
    trackingHandlers,
    getFlightLocation
};
  