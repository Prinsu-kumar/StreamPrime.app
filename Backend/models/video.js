const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: [String],
    default: []
  },
  language: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  price: {
    type: Number,
    default: 2.00
  },
  videoUrl: {
    type: String,
    required: true
  },
  previewUrl: {
    type: String,
    required: true // 30-second preview
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    director: String,
    cast: [String],
    releaseYear: Number,
    rating: Number
  }
});

module.exports = mongoose.model('Video', videoSchema);