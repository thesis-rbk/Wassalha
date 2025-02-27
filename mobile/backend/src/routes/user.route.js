const express = require('express');
const { signup,loginUser,googleLogin,requestPasswordReset,resetPassword } = require('../controllers/user.controller');

const router = express.Router();

// Public routes
router.post('/register', signup);
router.post('/login', loginUser);
router.post('/google-login', googleLogin); // New Google login endpoint
router.post('/reset-password/request', requestPasswordReset);
router.post('/reset-password', resetPassword);
module.exports = router;