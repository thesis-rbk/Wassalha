const express = require("express");
const { getAllServiceProviders } = require("../controllers/serviceProvider.controller");

const router = express.Router();

// Route to fetch all service providers
router.get("/", getAllServiceProviders);

module.exports = router; 