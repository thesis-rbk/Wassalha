const express = require("express");
const { getCategories, updateCategory, disableCategory, createCategory } = require("../controllers/category.controller");

const router = express.Router();

// Route to fetch categories
router.get("/", getCategories);

// Route to update a category
router.put("/update", updateCategory);

// Route to disable a category
router.put("/disable", disableCategory);

// Route to create a category
router.post("/create", createCategory);

module.exports = router;
