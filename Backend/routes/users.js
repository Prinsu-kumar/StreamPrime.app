// routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Get user's watch history
router.get('/history', authMiddleware, userController.getWatchHistory);

// Add to watch history
router.post('/history/:videoId', authMiddleware, userController.addToHistory);

// Get recommendations
router.get('/recommendations', authMiddleware, userController.getRecommendations);

// Update preferences
router.put('/preferences', authMiddleware, userController.updatePreferences);

// Get user statistics
router.get('/stats', authMiddleware, userController.getUserStats);

// Clear watch history
router.delete('/history', authMiddleware, userController.clearHistory);

module.exports = router;