const express = require("express");
const router = express.Router();
const { notification } = require("../controllers/notification");
router.post("/send-notification", notification);

module.exports = router;
