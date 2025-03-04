const express = require("express");
const { addPickup } = require("../controllers/pickup.controller");

const router = express.Router();

// Route to fetch categories
router.post("/add", addPickup);

module.exports = router;