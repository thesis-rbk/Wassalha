const express = require('express');
const multer = require('../middleware/multerMiddleware');
const router = express.Router();
const { createGoods } = require('../controllers/mobileGoodsController');

// Create new goods
router.post('/', multer.single('file'), createGoods);

// Add logging middleware
router.use((req, res, next) => {
  console.log('📱 Mobile goods route accessed:', {
    method: req.method,
    path: req.path,
    contentType: req.headers['content-type']
  });
  next();
});

module.exports = router;


//// Change any other axios calls:
//const goodsResponse = await axiosInstance.post('/api/goods', formData);

// To:
//const goodsResponse = await axiosInstance.post('/api/mobile/goods', formData);