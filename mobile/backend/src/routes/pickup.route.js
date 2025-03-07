const express = require("express");
const { addPickup,getPickupsByUserIdHandler } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to fetch categories
router.post("/add", addPickup);
router.post("/add", addPickup);
router.get('/:userId', getPickupsByUserIdHandler);

module.exports = router;