const express = require("express");
const { getPromoPosts, createPromoPost, updatePromoPost, deletePromoPost } = require("../controllers/promoPost.controller");

const router = express.Router();

// Route to fetch all promo posts
router.get("/", getPromoPosts);

// Route to create a new promo post
router.post("/", createPromoPost);

// Route to update a promo post
router.put("/:id", updatePromoPost);

// Route to delete a promo post
router.delete("/:id", deletePromoPost);

module.exports = router; 