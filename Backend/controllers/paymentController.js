const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/user');
const Transaction = require('../models/transaction');

// Initialize Razorpay (only if keys are available)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Create order for wallet recharge
exports.createOrder = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ 
        error: 'Payment service not configured. Please contact admin.' 
      });
    }
    
    const { amount } = req.body; // Amount in rupees
    const userId = req.userId;
    
    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 50) {
      return res.status(400).json({ error: 'Minimum recharge amount is ₹50' });
    }
    
    if (amount > 100000) {
      return res.status(400).json({ error: 'Maximum recharge amount is ₹100,000' });
    }
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        type: 'wallet_recharge'
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    // Create pending transaction
    const transaction = new Transaction({
      userId,
      amount,
      type: 'wallet_recharge',
      status: 'pending',
      paymentMethod: 'razorpay',
      razorpayOrderId: order.id
    });
    await transaction.save();
    
    res.json({
      success: true,
      order,
      transactionId: transaction._id
    });
    
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(503).json({ 
        error: 'Payment service not configured. Please contact admin.' 
      });
    }
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required payment details' });
    }
    
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    // Find transaction
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update transaction
    transaction.status = 'completed';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    await transaction.save();
    
    // Add to user's wallet
    const user = await User.findById(transaction.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.walletBalance += transaction.amount;
    await user.save();
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      newBalance: user.walletBalance,
      transactionId: transaction._id
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

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

// Handle Razorpay webhook
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');
    
    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    
    const event = req.body.event;
    
    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
      case 'payment.completed':
        // Payment successful
        break;
      case 'payment.failed':
        // Handle payment failure
        const failedPayment = req.body.payload.payment.entity;
        await Transaction.updateOne(
          { razorpayPaymentId: failedPayment.id },
          { status: 'failed' }
        );
        break;
      case 'payment.upi.missed':
        // Handle UPI missed payment
        break;
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
