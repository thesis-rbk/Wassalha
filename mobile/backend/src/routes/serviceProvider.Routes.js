const express = require('express');
const router = express.Router();
const serviceProviderController = require('../controllers/serviceProvider.Controller');
const { authenticateUser } = require('../middleware/middleware');

// Check if a user is a service provider
router.get('/:id', authenticateUser, serviceProviderController.checkServiceProvider);

module.exports = router; 