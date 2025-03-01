const express = require("express");
const router = express.Router();
const allpos = require("../controllers/alltravNpost");
router.get("/", allpos.allorders);

module.exports = router;