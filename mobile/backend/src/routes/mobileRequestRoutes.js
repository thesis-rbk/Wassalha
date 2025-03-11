const express = require('express');
const router = express.Router();
const mobileRequestController = require('../controllers/mobileRequestController');
const { authenticateUser } = require('../middleware/middleware');

// Public routes
router.get('/', mobileRequestController.getAllRequests); // Anyone can view requests
router.get('/:id', mobileRequestController.getRequestById);

// Protected routes - require authentication
router.post('/', authenticateUser, mobileRequestController.createRequest);
router.get('/user', authenticateUser, mobileRequestController.getUserRequests);
router.put('/:id', authenticateUser, mobileRequestController.updateRequest);
router.delete('/:id', authenticateUser, mobileRequestController.deleteRequest);
router.patch('/:id/status', authenticateUser, mobileRequestController.updateRequestStatus);

// Add logging middleware
router.use((req, res, next) => {
  console.log('📱 Mobile request route accessed:', {
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });
  next();
});

module.exports = router;


// Change this line:
//const response = await axiosInstance.get(`/api/requests/${params.id}`);

// To this:
//const response = await axiosInstance.get(`/api/mobile/requests/${params.id}`);