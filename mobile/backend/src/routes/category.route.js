const express = require("express");
const { getCategories, updateCategory, disableCategory } = require("../controllers/category.controller");

const router = express.Router();

// Route to fetch categories
router.get("/", getCategories);

// Route to update a category
router.put("/update", updateCategory);

// Route to disable a category
router.put("/disable", disableCategory);

module.exports = router;
