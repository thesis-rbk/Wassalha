const express = require('express');
const router = express.Router();
const fetch = require("../controllers/fetch")
const sponsor = require("../controllers/SponsorSubscription")
const midd = require("../middleware/middlewareSponsor")
router.get("/besttarveler", fetch.All)
router.get("/filter", fetch.searchRequestsTraveler)
router.post("/createSponsor", midd.uerSPONSOR, sponsor.createSponsorShip)
router.post("/createSub", sponsor.createSubscription)
router.get("/allreview/:id", sponsor.rewiewSubscription)
router.post("/createReview", sponsor.reviewCreate)
router.get("/allSub", sponsor.allSub)
router.get("/search", sponsor.search)
router.get("/allCat", sponsor.getAllCategories)
router.get("/allNot/:id", sponsor.getAllNotificationById)
router.post("/payment", sponsor.paymentSponsor)
router.get("/checkSponsor", midd.uerSPONSOR, sponsor.checkSponsor)
router.get("/one/:id", sponsor.findOneSponsor)
module.exports = router