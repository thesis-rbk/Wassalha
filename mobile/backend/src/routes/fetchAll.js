const express = require('express');
const router = express.Router();
const fetch = require("../controllers/fetch")

router.get("/besttarveler", fetch.bestTraveler)


module.exports = router