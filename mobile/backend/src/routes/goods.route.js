const express = require("express");
const { getGoods, createGood, updateGood, deleteGood } = require("../controllers/goods.controller");
const upload = require('../middleware/multerMiddleware'); // Assuming you have multer middleware for file uploads

const router = express.Router();

// Route to fetch all goods
router.get("/", getGoods);

// Route to create a new good
router.post("/", upload.single('image'), createGood); // Assuming the image is uploaded as 'image'

// Route to update a good
router.put("/:id", upload.single('image'), updateGood); // Assuming the image is uploaded as 'image'

// Route to delete a good
router.delete("/:id", deleteGood);

module.exports = router; 