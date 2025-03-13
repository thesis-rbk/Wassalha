const express = require("express");
const {authenticateUser} = require("../middleware/middleware");
const {getPickupsRequesterByUserIdHandler,getPickupsTravelerByUserIdHandler, acceptPickup, handlePickup, updatePickupStatus,getPickupSuggestionsByPickupId } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to fetch categories
router.post("/handle-confirm",authenticateUser, handlePickup);
router.put("/accept",authenticateUser, acceptPickup);
router.get('/requester',authenticateUser, getPickupsRequesterByUserIdHandler);
router.get('/traveler',authenticateUser, getPickupsTravelerByUserIdHandler);
router.put('/status', authenticateUser,updatePickupStatus);
router.get('/history/:pickupId', authenticateUser, getPickupSuggestionsByPickupId);

module.exports = router;
const { getAllPickups, deletePickup } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to get all pickups
router.get("/", getAllPickups);

// Route to delete a pickup
router.delete("/:id", deletePickup);

module.exports = router; 
