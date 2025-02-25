const express = require("express");
const { checkIllegalItems } = require("../controllers/productController");
const router = express.Router();

// ... existing routes

// New route for checking illegal items
router.post("/check-illegal", checkIllegalItems);

module.exports = router; 