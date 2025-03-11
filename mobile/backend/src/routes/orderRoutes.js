const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order routes
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id', orderController.updateOrder);

module.exports = router;
