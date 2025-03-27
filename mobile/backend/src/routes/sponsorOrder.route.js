const express = require('express');
const router = express.Router();
const sponsorRequestController = require('../controllers/sponsorRequest.controller');
const { authenticateToken } = require('../middleware/middleware');

// Route to accept order and send digital codes
router.post('/:requestId/accept', authenticateToken, sponsorRequestController.acceptRequest);

module.exports = router; 