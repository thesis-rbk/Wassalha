const express = require('express');
const router = express.Router();
const { createGoods } = require('../controllers/goods.controller');

// Create new goods
router.post('/', createGoods);

module.exports = router;