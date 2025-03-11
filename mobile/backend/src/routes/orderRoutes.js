const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateUser } = require('../middleware/middleware');

// Order routes
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id', orderController.updateOrder);
// Add new route for status updates
router.patch('/:id/status', authenticateUser, orderController.updateOrderStatus);
// Add this route for confirming an order
router.patch('/:id/confirm', authenticateUser, orderController.confirmOrder);

module.exports = router;
