const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    trim: true
  },
  walletBalance: {
    type: Number,
    default: 50, // ₹50 welcome bonus
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  watchHistory: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    watchedAt: Date,
    amountPaid: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);