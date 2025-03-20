const express = require("express");
const { getGoodsPosts, createGoodsPost, updateGoodsPost, deleteGoodsPost } = require("../controllers/goodsPost.controller");
const upload = require('../middleware/multerMiddleware'); // Assuming you have multer middleware for file uploads

const router = express.Router();

// Route to fetch all goods posts
router.get("/", getGoodsPosts);

// Route to create a new goods post
router.post("/",  createGoodsPost); // Assuming the image is uploaded as 'image'

// Route to update a goods post
router.put("/:id", updateGoodsPost); // Assuming the image is uploaded as 'image'

// Route to delete a goods post
router.delete("/:id", deleteGoodsPost);

module.exports = router; 