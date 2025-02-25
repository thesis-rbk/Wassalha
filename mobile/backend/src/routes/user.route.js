const express = require('express');
const { signup,loginUser,googleLogin } = require('../controllers/user.controller');

const router = express.Router();

// Public routes
router.post('/register', signup);
router.post('/login', loginUser);
router.post('/google-login', googleLogin); // New Google login endpoint

module.exports = router;