const express = require('express');
const router = express.Router();
const serviceProviderController = require('../controllers/serviceProvider.Controller');
const { authenticateUser } = require('../middleware/middleware');

// Check if a user is a service provider
router.get('/check/:id', authenticateUser, serviceProviderController.checkServiceProvider);

// Route to fetch all service providers
router.get('/', authenticateUser, serviceProviderController.getAllServiceProviders);

// Route to get service provider by user ID
router.get('/user/:userId', authenticateUser, serviceProviderController.getServiceProviderByUserId);

module.exports = router; 