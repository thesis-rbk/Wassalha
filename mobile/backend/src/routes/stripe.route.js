const express = require("express");
const { getStripeConfig } = require("../controllers/stripe.controller");

const router = express.Router();

router.get("/config", getStripeConfig);

module.exports = router; 