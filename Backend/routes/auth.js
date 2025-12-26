const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Send OTP
router.post('/send-otp', authController.sendOTP);

// Verify OTP & Login/Register
router.post('/verify-otp', authController.verifyOTP);

// Logout
router.post('/logout', authController.logout);

// Get user profile
router.get('/profile', authController.getProfile);

// Update profile
router.put('/profile', authController.updateProfile);

module.exports = router;