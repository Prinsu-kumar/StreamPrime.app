const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: false // Optional for wallet recharge transactions
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['video_purchase', 'wallet_recharge', 'refund'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'razorpay', 'upi', 'card']
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  metadata: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);