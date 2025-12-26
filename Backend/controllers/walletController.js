const User = require('../models/user');
const Transaction = require('../models/transaction');

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      balance: user.walletBalance
    });
    
  } catch (error) {
    console.error('Wallet balance error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
};

// Add money to wallet (via Razorpay)
exports.addToWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;
    
    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return res.status(400).json({ error: 'Minimum amount is ₹50' });
    }
    
    if (amount > 100000) {
      return res.status(400).json({ error: 'Maximum amount is ₹100,000' });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create transaction record (will be updated after payment verification)
    const transaction = new Transaction({
      userId,
      amount,
      type: 'wallet_recharge',
      status: 'pending',
      paymentMethod: 'razorpay'
    });
    
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Wallet recharge initiated',
      transactionId: transaction._id,
      amount
    });
    
  } catch (error) {
    console.error('Add to wallet error:', error);
    res.status(500).json({ error: 'Failed to add to wallet' });
  }
};

// Get transaction history
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20 } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .select('amount type status paymentMethod createdAt');
    
    const total = await Transaction.countDocuments({ userId });
    
    res.json({
      success: true,
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Get wallet statistics
exports.getWalletStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get transaction stats
    const totalSpent = await Transaction.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          type: 'video_purchase',
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalRecharged = await Transaction.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId(userId),
          type: 'wallet_recharge',
          status: 'completed'
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const rechargeCount = await Transaction.countDocuments({
      userId,
      type: 'wallet_recharge',
      status: 'completed'
    });
    
    const purchaseCount = await Transaction.countDocuments({
      userId,
      type: 'video_purchase',
      status: 'completed'
    });
    
    res.json({
      success: true,
      stats: {
        currentBalance: user.walletBalance,
        totalSpent: totalSpent[0]?.total || 0,
        totalRecharged: totalRecharged[0]?.total || 0,
        rechargeCount,
        purchaseCount,
        joinedDate: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Wallet stats error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet statistics' });
  }
};
