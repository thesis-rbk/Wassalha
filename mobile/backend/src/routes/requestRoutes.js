const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.Controller');
const { authenticateUser, authenticateUserOrAdmin } = require('../middleware/middleware');

// Public routes
router.get('/', requestController.getAllRequests); // Anyone can view requests
router.get('/:id', requestController.getRequestById);

// Protected routes - require authentication
router.post('/', authenticateUser, requestController.createRequest);
router.get('/user', authenticateUser, requestController.getUserRequests);
router.put('/:id', authenticateUserOrAdmin, requestController.updateRequest);
router.delete('/:id', requestController.deleteRequest);
router.patch('/:id/status', authenticateUserOrAdmin, requestController.updateRequestStatus);

// Add this route to get offers for a specific request
router.get('/:id/offers', requestController.getRequestOffers);

// Add logging middleware
router.use((req, res, next) => {
  console.log('📡 Request route accessed:', {
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });
  next();
});

module.exports = router;
