// controllers/userController.js

const User = require('../models/user');
const Video = require('../models/video');
const Transaction = require('../models/transaction');

// Get user's watch history
exports.getWatchHistory = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId).populate({
      path: 'watchHistory.videoId',
      select: 'title thumbnailUrl duration price'
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.watchHistory,
      count: user.watchHistory.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add to watch history
exports.addToHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { videoId } = req.params;
    
    const user = await User.findById(userId);
    const video = await Video.findById(videoId);
    
    if (!user || !video) {
      return res.status(404).json({
        success: false,
        error: 'User or video not found'
      });
    }
    
    // Check if already in history (update timestamp)
    const existingIndex = user.watchHistory.findIndex(
      item => item.videoId.toString() === videoId
    );
    
    if (existingIndex !== -1) {
      user.watchHistory[existingIndex].watchedAt = new Date();
    } else {
      // Add to history (limit to 100 items)
      user.watchHistory.unshift({
        videoId,
        watchedAt: new Date(),
        amountPaid: video.price || 2
      });
      
      // Keep only last 100 items
      if (user.watchHistory.length > 100) {
        user.watchHistory = user.watchHistory.slice(0, 100);
      }
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Added to watch history'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get recommendations based on watch history
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get user's watched categories
    const watchedVideoIds = user.watchHistory.map(item => item.videoId);
    
    // Find videos in same categories but not watched
    const recommendations = await Video.find({
      _id: { $nin: watchedVideoIds },
      isActive: true
    })
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(10);
    
    // If not enough recommendations, get trending
    if (recommendations.length < 5) {
      const trending = await Video.find({
        _id: { $nin: watchedVideoIds },
        isActive: true
      })
      .sort({ viewCount: -1 })
      .limit(10 - recommendations.length);
      
      recommendations.push(...trending);
    }
    
    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { 
      language, 
      categories, 
      notificationEnabled,
      autoPlay,
      videoQuality 
    } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update preferences
    user.preferences = {
      language: language || user.preferences?.language,
      categories: categories || user.preferences?.categories,
      notificationEnabled: notificationEnabled !== undefined 
        ? notificationEnabled 
        : user.preferences?.notificationEnabled,
      autoPlay: autoPlay !== undefined 
        ? autoPlay 
        : user.preferences?.autoPlay,
      videoQuality: videoQuality || user.preferences?.videoQuality,
      updatedAt: new Date()
    };
    
    await user.save();
    
    res.json({
      success: true,
      data: user.preferences,
      message: 'Preferences updated'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get transaction stats
    const transactions = await Transaction.find({ 
      userId, 
      type: 'video_purchase',
      status: 'completed'
    });
    
    const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const videosWatched = user.watchHistory.length;
    
    // Calculate average views per day
    const firstWatch = user.watchHistory.length > 0 
      ? user.watchHistory[user.watchHistory.length - 1].watchedAt
      : user.createdAt;
    
    const daysActive = Math.max(
      1,
      Math.ceil((new Date() - firstWatch) / (1000 * 60 * 60 * 24))
    );
    
    const avgDailyViews = (videosWatched / daysActive).toFixed(1);
    
    res.json({
      success: true,
      data: {
        walletBalance: user.walletBalance,
        totalSpent,
        videosWatched,
        daysActive,
        avgDailyViews,
        lastLogin: user.lastLogin,
        accountCreated: user.createdAt
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Clear watch history
exports.clearHistory = async (req, res) => {
  try {
    const userId = req.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    user.watchHistory = [];
    await user.save();
    
    res.json({
      success: true,
      message: 'Watch history cleared'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};