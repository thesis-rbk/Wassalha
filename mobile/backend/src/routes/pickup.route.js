const express = require("express");
const { getAllPickups } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to get all pickups
router.get("/", getAllPickups);

module.exports = router; 