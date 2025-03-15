const express = require('express');
const multer = require('../middleware/multerMiddleware');
const router = express.Router();
const { getGoods, createGoods, updateGood, deleteGood, verifyGood } = require("../controllers/goods.controller");
const upload = require('../middleware/multerMiddleware'); // Assuming you have multer middleware for file uploads


// Create new goods
router.post('/', multer.single('file'), createGoods);

// Add logging middleware
router.use((req, res, next) => {
  console.log('📡 Goods route accessed:', {
    method: req.method,
    path: req.path,
    contentType: req.headers['content-type']
  });
  next();
});
// Route to fetch all goods
router.get("/", getGoods);

// Route to update a good
router.put("/:id", upload.single('image'), updateGood); // Assuming the image is uploaded as 'image'

// Route to delete a good
router.delete("/:id", deleteGood);

// Route to verify a good
router.put("/:id/verify", verifyGood);

module.exports = router; 
