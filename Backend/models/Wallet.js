// models/Wallet.js

const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'recharge',     // User added money
      'purchase',     // Spent on video
      'refund',       // Money returned
      'bonus',        // Welcome bonus/referral
      'cashout'       // Withdrawal to bank
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'upi', 'card', 'netbanking', 'wallet_transfer'],
    required: function() {
      return this.type === 'recharge';
    }
  },
  paymentGatewayData: {
    orderId: String,
    paymentId: String,
    signature: String,
    gateway: String
  },
  metadata: {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    description: String,
    referenceId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ status: 1, createdAt: -1 });

// Methods
walletTransactionSchema.methods.getFormattedTransaction = function() {
  const types = {
    recharge: 'Money Added',
    purchase: 'Video Purchase',
    refund: 'Refund',
    bonus: 'Bonus Credit',
    cashout: 'Withdrawal'
  };
  
  return {
    id: this._id,
    type: this.type,
    typeDisplay: types[this.type] || this.type,
    amount: this.amount,
    balanceBefore: this.balanceBefore,
    balanceAfter: this.balanceAfter,
    status: this.status,
    paymentMethod: this.paymentMethod,
    createdAt: this.createdAt,
    metadata: this.metadata
  };
};

// Static methods
walletTransactionSchema.statics.getUserBalance = async function(userId) {
  try {
    const latestTx = await this.findOne(
      { userId, status: 'completed' },
      'balanceAfter',
      { sort: { createdAt: -1 } }
    );
    
    return latestTx ? latestTx.balanceAfter : 0;
  } catch (error) {
    console.error('Error getting user balance:', error);
    return 0;
  }
};

walletTransactionSchema.statics.addTransaction = async function(
  userId, 
  type, 
  amount, 
  paymentMethod = null, 
  metadata = {}
) {
  try {
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + amount;
    
    const transaction = new this({
      userId,
      type,
      amount,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      paymentMethod,
      status: 'completed',
      metadata
    });
    
    await transaction.save();
    return transaction;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

walletTransactionSchema.statics.getUserTransactions = async function(
  userId, 
  limit = 20, 
  page = 1
) {
  try {
    const skip = (page - 1) * limit;
    
    const transactions = await this.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('metadata.videoId', 'title thumbnailUrl');
    
    const total = await this.countDocuments({ userId });
    
    return {
      transactions,
      page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total
    };
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

walletTransactionSchema.statics.getMonthlyStats = async function(userId) {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const transactions = await this.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          createdAt: { $gte: oneMonthAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            type: '$type'
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      totalRecharged: 0,
      totalSpent: 0,
      totalBonuses: 0,
      transactionCount: 0
    };
    
    transactions.forEach(tx => {
      if (tx._id.type === 'recharge') stats.totalRecharged += tx.totalAmount;
      if (tx._id.type === 'purchase') stats.totalSpent += Math.abs(tx.totalAmount);
      if (tx._id.type === 'bonus') stats.totalBonuses += tx.totalAmount;
      stats.transactionCount += tx.count;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    throw error;
  }
};

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);