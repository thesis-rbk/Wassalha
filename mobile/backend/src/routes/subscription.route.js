const express = require("express");
const { getSubscriptions, deleteSubscription } = require("../controllers/subscription.controller");

const router = express.Router();

// Route to fetch all subscriptions
router.get("/", getSubscriptions);

// Route to delete a subscription
router.delete("/:id", deleteSubscription);

module.exports = router; 