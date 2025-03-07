const express = require('express');
const multer = require('../middleware/multerMiddleware');
const router = express.Router();
const { createGoods } = require('../controllers/goods.controller');

// Create new goods
router.post('/',  createGoods);

// Add logging middleware
router.use((req, res, next) => {
  console.log('📡 Goods route accessed:', {
    method: req.method,
    path: req.path,
    contentType: req.headers['content-type']
  });
  next();
});

module.exports = router;