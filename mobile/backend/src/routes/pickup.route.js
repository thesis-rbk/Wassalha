const express = require("express");
const {authenticateUser} = require("../middleware/middleware");
const {getPickupsRequesterByUserIdHandler,getPickupsTravelerByUserIdHandler, acceptPickup, handlePickup, updatePickupStatus,getPickupSuggestionsByPickupId,getAllPickups,deletePickup } = require("../controllers/pickup.controller");

const router = express.Router();

router.post("/handle-confirm",authenticateUser, handlePickup);
router.put("/accept",authenticateUser, acceptPickup);
router.get('/requester',authenticateUser, getPickupsRequesterByUserIdHandler);
router.get('/traveler',authenticateUser, getPickupsTravelerByUserIdHandler);
router.put('/status', authenticateUser,updatePickupStatus);
router.get('/history/:pickupId', authenticateUser, getPickupSuggestionsByPickupId);
router.get("/", getAllPickups);
router.delete("/:id", deletePickup);


module.exports = router; 
