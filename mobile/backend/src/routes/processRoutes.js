const express = require('express');
const router = express.Router();
const processController = require('../controllers/processController');

// Process routes
router.get('/:orderId', processController.getProcessDetails);
router.patch('/:orderId/status', processController.updateProcessStatus);
router.get('/:orderId/events', processController.getProcessEvents);

module.exports = router;
