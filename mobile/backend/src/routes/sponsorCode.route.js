const express = require("express");
const router = express.Router();
const sponsorCodeController = require("../controllers/sponsorCode.controller");
const { authenticateUser } = require("../middleware/middleware");

// All routes require authentication
router.use(authenticateUser);

// Submit code/account for a request
router.post("/submit/:requestId", sponsorCodeController.submitCode);

// Get submission history
router.get("/history", sponsorCodeController.getSubmissionHistory);

module.exports = router; 