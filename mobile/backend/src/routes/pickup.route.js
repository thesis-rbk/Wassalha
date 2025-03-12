const express = require("express");
const {authenticateUser} = require("../middleware/middleware");
const {getPickupsRequesterByUserIdHandler,getPickupsTravelerByUserIdHandler, acceptPickup, handlePickup, updatePickupStatus } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to fetch categories
router.post("/handle-confirm",authenticateUser, handlePickup);
router.put("/accept",authenticateUser, acceptPickup);
router.get('/requester',authenticateUser, getPickupsRequesterByUserIdHandler);
router.get('/traveler',authenticateUser, getPickupsTravelerByUserIdHandler);

router.put('/status', authenticateUser,updatePickupStatus);

module.exports = router;