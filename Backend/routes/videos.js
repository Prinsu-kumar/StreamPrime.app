const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videocontroller');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Get all videos (public)
router.get('/', videoController.getAllVideos);

// Get video by ID (with preview)
router.get('/:id', videoController.getVideoById);

// Watch video (requires payment)
router.post('/:id/watch', authMiddleware, videoController.watchVideo);

// Search videos
router.get('/search/:query', videoController.searchVideos);

// Get trending videos
router.get('/trending/trending', videoController.getTrending);

// Get by category
router.get('/category/:category', videoController.getByCategory);

// Admin routes (protected)
router.post('/', authMiddleware, adminMiddleware, videoController.createVideo);
router.put('/:id', authMiddleware, adminMiddleware, videoController.updateVideo);
router.delete('/:id', authMiddleware, adminMiddleware, videoController.deleteVideo);

module.exports = router;