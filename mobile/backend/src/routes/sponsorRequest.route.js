const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/middleware');
const sponsorRequestController = require('../controllers/sponsorRequest.controller');

// Make sure the controller exists before using it
if (!sponsorRequestController || !sponsorRequestController.acceptRequest) {
    throw new Error('sponsorRequestController.acceptRequest is not properly defined');
}

// Route to accept request and send digital codes
router.post('/:requestId/accept', authenticateToken, sponsorRequestController.acceptRequest);

module.exports = router; 