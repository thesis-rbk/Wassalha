const express = require("express");
const { getCategories } = require("../controllers/category.controller");

const router = express.Router();

// Route to fetch categories
router.get("/", getCategories);

module.exports = router;
