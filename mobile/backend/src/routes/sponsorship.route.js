const express = require("express");
const { getAllSponsorships, deleteSponsorship } = require("../controllers/sponsorship.controller");

const router = express.Router();

// Route to fetch all sponsorships
router.get("/", getAllSponsorships);

// Route to delete a sponsorship
router.delete("/:id", deleteSponsorship);

module.exports = router; 