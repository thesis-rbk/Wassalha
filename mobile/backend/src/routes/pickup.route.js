const express = require("express");
const {authenticateUser} = require("../middleware/middleware");
const {getPickupsByUserIdHandler, acceptPickup, handlePickup, updatePickupStatus } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to fetch categories
router.post("/handle-confirm",authenticateUser, handlePickup);
router.put("/accept",authenticateUser, acceptPickup);
router.get('/:userId', getPickupsByUserIdHandler);
router.put('/status', updatePickupStatus);

module.exports = router;