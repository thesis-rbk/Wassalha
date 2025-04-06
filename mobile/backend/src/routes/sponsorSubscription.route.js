const express = require('express');
const router = express.Router();
const fetch = require("../controllers/fetch")
const sponsor = require("../controllers/SponsorSubscription.js")
const { authenticateUser } = require("../middleware/middleware")
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
router.post("/payment", authenticateUser, sponsor.paymentSponsor)
router.get("/checkSponsor", midd.uerSPONSOR, sponsor.checkSponsor)
router.get("/one/:id", sponsor.findOneSponsor)
router.get("/allRev/:id", sponsor.sponsorShipReview)
router.post("/payment_Konnect", sponsor.initiatePayment)
router.post("/createOrderSponsor", authenticateUser, sponsor.createOrderSponsor)
router.get("/requestsSponsor", authenticateUser, sponsor.getAllRequestsSponsor)
router.get("/ordersSponsor", authenticateUser, sponsor.getallOrders)
router.put("/confirmedUpdate", sponsor.confirmedUpdate)
router.delete("/ordersSponsor/:id", sponsor.deleteOrder)
router.get("/getOneSponsorSip/:id", sponsor.findOneSponsorShip)
router.post("/flousy", sponsor.flousiPayment)
router.get("/allPendingReq", sponsor.AllPendingRequest)
module.exports = router;