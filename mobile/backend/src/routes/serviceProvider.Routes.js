const express = require('express');
const router = express.Router();
const serviceProviderController = require('../controllers/serviceProvider.controller');
const { authenticateUser, authorizeAdmin } = require('../middleware/middleware');

// Add authentication middleware to protected routes
router.use(authenticateUser);

// Check if a user is a service provider
router.get('/check/:id', serviceProviderController.checkServiceProvider);

// Route to fetch all service providers
router.get('/', serviceProviderController.getAllServiceProviders);

// Route to get service provider by user ID
router.get('/user/:userId', serviceProviderController.getServiceProviderByUserId);

// Route to delete a service provider
router.delete('/:id', serviceProviderController.deleteServiceProvider);

// Route to verify a sponsor
router.put('/verify/:userId', serviceProviderController.verifySponsor);

// Create a pending sponsor
router.post('/pending/:userId', serviceProviderController.createPendingSponsor);

module.exports = router; 