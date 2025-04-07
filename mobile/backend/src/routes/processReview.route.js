const express = require("express");
const {
  createUserReview,
  createExperienceReview,
} = require("../controllers/processReview.controller");

const router = express.Router();

router.post("/user", createUserReview);
router.post("/experience", createExperienceReview);

module.exports = router;
