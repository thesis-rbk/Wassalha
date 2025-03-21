const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { authenticateUser } = require('../middleware/middleware');
const upload = require('../middleware/multerMiddleware');

const router = express.Router();

// Get user profile
router.get('/:id' , authenticateUser, getProfile);

// Update user profile
router.put('/:id', authenticateUser, upload.single('image'),  updateProfile);

module.exports = router; 