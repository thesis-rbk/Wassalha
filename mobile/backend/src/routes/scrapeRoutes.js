const express = require('express');
const router = express.Router();
const scrapeController = require('../controllers/scrapeController');  // Import the whole controller

// Route to handle product URL scraping
router.post('/product', scrapeController.scrapeProduct);

// Route to validate URL before scraping (optional)
router.post('/validate', scrapeController.validateUrl);

module.exports = router;
