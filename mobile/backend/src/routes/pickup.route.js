const express = require("express");
const { getAllPickups, deletePickup } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to get all pickups
router.get("/", getAllPickups);

// Route to delete a pickup
router.delete("/:id", deletePickup);

module.exports = router; 