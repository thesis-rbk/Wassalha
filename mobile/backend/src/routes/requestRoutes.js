const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateUser } = require('../middleware/middleware');

// Public routes
router.get('/', requestController.getAllRequests); // Anyone can view requests
router.get('/:id', requestController.getRequestById);

// Protected routes - require authentication
router.post('/', authenticateUser, requestController.createRequest);
router.get('/user/:userId', authenticateUser, requestController.getUserRequests);
router.put('/:id', authenticateUser, requestController.updateRequest);
router.delete('/:id', authenticateUser, requestController.deleteRequest);
router.patch('/:id/status', authenticateUser, requestController.updateRequestStatus);

module.exports = router;
