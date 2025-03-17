const express = require('express');
const router = express.Router();
const sponsorshipProcessController = require('../controllers/sponsorshipProcess.controller');
const authMiddleware = require('../middleware/middleware');

// Apply authentication middleware to all routes
// router.use(authMiddleware);

// Sponsorship process routes
router.post('/initiate', sponsorshipProcessController.initiateSponsorshipProcess);
router.get('/:id', sponsorshipProcessController.getSponsorshipProcess);
router.patch('/:id/status', sponsorshipProcessController.updateSponsorshipStatus);
router.post('/verify', sponsorshipProcessController.upload.single('file'), sponsorshipProcessController.verifySponsorshipDelivery);
router.post('/:id/confirm', sponsorshipProcessController.confirmSponsorshipDelivery);
router.post('/:id/request-new-photo', sponsorshipProcessController.requestNewVerificationPhoto);
router.post('/:id/cancel', sponsorshipProcessController.cancelSponsorshipProcess);
router.post('/payment', sponsorshipProcessController.createPaymentIntent);

module.exports = router; 