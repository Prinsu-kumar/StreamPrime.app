const Video = require('../models/video');
const User = require('../models/user');
const Transaction = require('../models/transaction');

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, language } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (language) query.language = language;
    
    const videos = await Video.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Video.countDocuments(query);
    
    res.json({
      success: true,
      videos,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalVideos: total
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get video by ID
exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video || !video.isActive) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Return preview URL for free access
    res.json({
      success: true,
      video: {
        id: video._id,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        previewUrl: video.previewUrl, // 30-second preview
        duration: video.duration,
        price: video.price,
        viewCount: video.viewCount,
        metadata: video.metadata
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Watch video (pay ₹2)
exports.watchVideo = async (req, res) => {
  try {
    const userId = req.userId;
    const videoId = req.params.id;
    
    const user = await User.findById(userId);
    const video = await Video.findById(videoId);
    
    if (!video || !video.isActive) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Check if user already purchased in last 48 hours
    const recentPurchase = await Transaction.findOne({
      userId,
      videoId,
      type: 'video_purchase',
      status: 'completed',
      createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    });
    
    if (recentPurchase) {
      return res.json({
        success: true,
        message: 'Already purchased',
        videoUrl: video.videoUrl,
        accessExpires: new Date(recentPurchase.createdAt.getTime() + 48 * 60 * 60 * 1000)
      });
    }
    
    // Check wallet balance
    if (user.walletBalance < video.price) {
      return res.status(402).json({
        error: 'Insufficient balance',
        required: video.price,
        currentBalance: user.walletBalance,
        redirect: '/add-money'
      });
    }
    
    // Deduct from wallet
    user.walletBalance -= video.price;
    await user.save();
    
    // Create transaction
    const transaction = new Transaction({
      userId,
      videoId,
      amount: video.price,
      type: 'video_purchase',
      status: 'completed',
      paymentMethod: 'wallet'
    });
    await transaction.save();
    
    // Update video view count
    video.viewCount += 1;
    video.totalEarnings += video.price;
    await video.save();
    
    // Add to user's watch history
    user.watchHistory.push({
      videoId,
      watchedAt: new Date(),
      amountPaid: video.price
    });
    await user.save();
    
    res.json({
      success: true,
      message: 'Payment successful',
      videoUrl: video.videoUrl,
      newBalance: user.walletBalance,
      transactionId: transaction._id,
      accessExpires: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours access
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search videos
exports.searchVideos = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    const videos = await Video.find({
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ viewCount: -1, createdAt: -1 });
    
    const total = await Video.countDocuments({
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    
    res.json({
      success: true,
      videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

// Get trending videos
exports.getTrending = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    const videos = await Video.find({ isActive: true })
      .sort({ viewCount: -1, totalEarnings: -1 })
      .limit(limitNum)
      .select('title thumbnailUrl price duration viewCount');
    
    res.json({
      success: true,
      videos,
      count: videos.length
    });
    
  } catch (error) {
    console.error('Trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending videos' });
  }
};

// Get videos by category
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (!category || category.trim().length === 0) {
      return res.status(400).json({ error: 'Category is required' });
    }
    
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    const videos = await Video.find({
      isActive: true,
      category: { $in: [category] }
    })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });
    
    const total = await Video.countDocuments({
      isActive: true,
      category: { $in: [category] }
    });
    
    res.json({
      success: true,
      videos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Category filter error:', error);
    res.status(500).json({ error: 'Failed to fetch videos by category' });
  }
};

// Create video (Admin only)
exports.createVideo = async (req, res) => {
  try {
    const { title, description, category, language, duration, price, videoUrl, previewUrl, thumbnailUrl, metadata } = req.body;
    
    // Validate required fields
    if (!title || !videoUrl || !previewUrl || !thumbnailUrl || !language || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (typeof duration !== 'number' || duration <= 0) {
      return res.status(400).json({ error: 'Duration must be a positive number' });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    
    const video = new Video({
      title,
      description,
      category: category || [],
      language,
      duration,
      price: price || 2,
      videoUrl,
      previewUrl,
      thumbnailUrl,
      metadata: metadata || {}
    });
    
    await video.save();
    
    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      video
    });
    
  } catch (error) {
    console.error('Video creation error:', error);
    res.status(500).json({ error: 'Failed to create video' });
  }
};

// Update video (Admin only)
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, language, price, isActive, metadata } = req.body;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Update allowed fields
    if (title) video.title = title;
    if (description !== undefined) video.description = description;
    if (category) video.category = category;
    if (language) video.language = language;
    if (price !== undefined) video.price = price;
    if (isActive !== undefined) video.isActive = isActive;
    if (metadata) video.metadata = metadata;
    
    await video.save();
    
    res.json({
      success: true,
      message: 'Video updated successfully',
      video
    });
    
  } catch (error) {
    console.error('Video update error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
};

// Delete video (Admin only)
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findByIdAndDelete(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
    
  } catch (error) {
    console.error('Video deletion error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};
