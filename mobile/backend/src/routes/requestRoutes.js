const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.Controller');
const { authenticateUser } = require('../middleware/middleware');

// Public routes
router.get('/', requestController.getAllRequests); // Anyone can view requests
router.get('/:id', requestController.getRequestById);

// Protected routes - require authentication
router.post('/', authenticateUser, requestController.createRequest);
router.get('/user', authenticateUser, requestController.getUserRequests);
router.put('/:id', authenticateUser, requestController.updateRequest);
router.delete('/:id', authenticateUser, requestController.deleteRequest);
router.patch('/:id/status', authenticateUser, requestController.updateRequestStatus);

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
