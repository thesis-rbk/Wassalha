const express = require('express');
const router = express.Router();
const fetch = require("../controllers/fetch")

router.get("/besttarveler", fetch.All)
router.get("/filter", fetch.searchRequestsTraveler)

module.exports = router