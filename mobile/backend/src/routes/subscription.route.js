const express = require("express");
const { getSubscriptions } = require("../controllers/subscription.controller");

const router = express.Router();

// Route to fetch all subscriptions
router.get("/", getSubscriptions);

module.exports = router; 