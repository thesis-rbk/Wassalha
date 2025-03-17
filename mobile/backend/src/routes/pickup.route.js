const express = require("express");
const { authenticateUser } = require("../middleware/middleware");
const {
  getPickupsRequesterByUserIdHandler,
  getPickupsTravelerByUserIdHandler,
  acceptPickup,
  handlePickup,
  updatePickupStatus,
  getPickupSuggestionsByPickupId,
  getAllPickups,
  deletePickup,
} = require("../controllers/pickup.controller");

const router = express.Router();

// Handle new pickup suggestion
router.post("/handle-confirm", authenticateUser, handlePickup);

// Accept pickup
router.put("/accept", authenticateUser, acceptPickup);

// Fetch pickups for requester
router.get("/requester", authenticateUser, getPickupsRequesterByUserIdHandler);

// Fetch pickups for traveler
router.get("/traveler", authenticateUser, getPickupsTravelerByUserIdHandler);

// Update pickup status
router.put("/status", authenticateUser, updatePickupStatus);

// Fetch suggestion history
router.get("/history/:pickupId", authenticateUser, getPickupSuggestionsByPickupId);

// Fetch all pickups
router.get("/", getAllPickups);

// Delete pickup
router.delete("/:id", authenticateUser, deletePickup);

module.exports = router;