const express = require("express");
const { getAllSponsorships } = require("../controllers/sponsorship.controller");

const router = express.Router();

// Route to fetch all sponsorships
router.get("/", getAllSponsorships);

module.exports = router; 