const express = require('express');
const router = express.Router();
const sponsorCheckoutController = require('../controllers/sponsorcheckout.controller');


// Get all sponsor checkouts
router.get('/', sponsorCheckoutController.getAllSponsorCheckouts);

// Get sponsor checkout by ID
router.get('/:id',  sponsorCheckoutController.getSponsorCheckoutById);

// Update sponsor checkout status
router.patch('/:id/status',  sponsorCheckoutController.updateSponsorCheckoutStatus);

// Delete sponsor checkout
router.delete('/:id',  sponsorCheckoutController.deleteSponsorCheckout);

module.exports = router;
