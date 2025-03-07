const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateUser } = require('../middleware/middleware');

// Create a new request
router.post('/', requestController.createRequest);

// Get all requests
router.get('/', requestController.getAllRequests);

// Get user's requests (must be before /:id to avoid conflict)
router.get('/user/:userId', requestController.getUserRequests);

// Get request by ID
router.get('/:id', requestController.getRequestById);

// Update request
router.put('/:id', requestController.updateRequest);

// Delete request
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
