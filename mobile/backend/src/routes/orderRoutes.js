const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order routes
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id', orderController.updateOrder);
// Add new route for status updates
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
