const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/traveler.controller');
const { authenticateUser, authenticateAdmin } = require('../middleware/middleware');

// Route to submit traveler application
router.post('/apply', travelerController.submitTravelerApplication);

// Route to check if a user is a traveler and if they're verified
router.get('/check/:userId', travelerController.checkTravelerStatus);

// Route to verify a traveler
router.put('/:id/verify',  travelerController.verifyTraveler);

// Route to get all travelers
router.get('/', authenticateUser, travelerController.getAllTravelers);

// Route to get a traveler by ID
router.get('/:id', authenticateUser, travelerController.getTravelerById);

// Route to delete a traveler
router.delete('/:id', authenticateUser, travelerController.deleteTraveler);

module.exports = router;
