// utils/razorpay.js

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance (only if credentials are available)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// Validate Razorpay credentials
const validateCredentials = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️  Razorpay credentials not configured. Payment features disabled.');
    return false;
  }
  
  if (!razorpay) {
    console.error('Failed to initialize Razorpay');
    return false;
  }
  
  return true;
};

// Create a new order for wallet recharge
const createRechargeOrder = async (userId, amount, notes = {}) => {
  try {
    if (!validateCredentials()) {
      throw new Error('Razorpay credentials not configured');
    }
    
    // Validate amount (minimum ₹50)
    if (amount < 50) {
      throw new Error('Minimum recharge amount is ₹50');
    }
    
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${userId}`,
      notes: {
        userId: userId.toString(),
        type: 'wallet_recharge',
        ...notes
      },
      payment_capture: 1 // Auto-capture payment
    };
    
    const order = await razorpay.orders.create(options);
    
    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        created_at: order.created_at
      },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      userId,
      amount
    };
    
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return {
      success: false,
      error: error.message || 'Failed to create payment order'
    };
  }
};

// Verify payment signature
const verifyPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error('Missing payment verification parameters');
    }
    
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    const isValid = expectedSignature === razorpaySignature;
    
    return {
      success: isValid,
      isValid: isValid,
      expectedSignature,
      receivedSignature: razorpaySignature
    };
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    if (!validateCredentials()) {
      throw new Error('Razorpay credentials not configured');
    }
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    return {
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        bank: payment.bank,
        card_id: payment.card_id,
        vpa: payment.vpa,
        email: payment.email,
        contact: payment.contact,
        order_id: payment.order_id,
        created_at: new Date(payment.created_at * 1000)
      }
    };
    
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Refund payment
const createRefund = async (paymentId, amount, notes = {}) => {
  try {
    if (!validateCredentials()) {
      throw new Error('Razorpay credentials not configured');
    }
    
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100, // Convert to paise
      notes: notes
    });
    
    return {
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        created_at: new Date(refund.created_at * 1000)
      }
    };
    
  } catch (error) {
    console.error('Error creating refund:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get all payments for a user (by email or contact)
const getUserPayments = async (email, contact, limit = 10, skip = 0) => {
  try {
    if (!validateCredentials()) {
      throw new Error('Razorpay credentials not configured');
    }
    
    const filters = {};
    if (email) filters.email = email;
    if (contact) filters.contact = contact;
    
    const payments = await razorpay.payments.all({
      count: limit,
      skip: skip,
      ...filters
    });
    
    return {
      success: true,
      payments: payments.items.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        order_id: payment.order_id,
        created_at: new Date(payment.created_at * 1000)
      })),
      count: payments.items.length,
      total: payments.count
    };
    
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Webhook verification
const verifyWebhookSignature = (webhookBody, webhookSignature, webhookSecret) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(webhookBody))
      .digest('hex');
    
    const isValid = expectedSignature === webhookSignature;
    
    return {
      success: true,
      isValid: isValid,
      expectedSignature: expectedSignature,
      receivedSignature: webhookSignature
    };
    
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Common payment methods for Indian users
const supportedPaymentMethods = {
  UPI: ['upi', 'google_pay', 'phonepe', 'paytm'],
  CARDS: ['card', 'credit_card', 'debit_card'],
  NETBANKING: ['netbanking'],
  WALLETS: ['wallet', 'paytm', 'amazonpay', 'phonepe'],
  EMI: ['emi']
};

// Get payment method display name
const getPaymentMethodDisplay = (method) => {
  const methodMap = {
    upi: 'UPI',
    google_pay: 'Google Pay',
    phonepe: 'PhonePe',
    paytm: 'PayTM',
    card: 'Credit/Debit Card',
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
    amazonpay: 'Amazon Pay',
    emi: 'EMI'
  };
  
  return methodMap[method] || method;
};

// Calculate Razorpay fees (approx)
const calculateProcessingFees = (amount) => {
  // Razorpay charges: 2% + GST for UPI/Cards
  const processingFee = amount * 0.02; // 2%
  const gst = processingFee * 0.18; // 18% GST on fees
  const totalFees = processingFee + gst;
  
  return {
    processingFee: parseFloat(processingFee.toFixed(2)),
    gst: parseFloat(gst.toFixed(2)),
    totalFees: parseFloat(totalFees.toFixed(2)),
    netAmount: parseFloat((amount - totalFees).toFixed(2))
  };
};

module.exports = {
  razorpay,
  validateCredentials,
  createRechargeOrder,
  verifyPayment,
  getPaymentDetails,
  createRefund,
  getUserPayments,
  verifyWebhookSignature,
  supportedPaymentMethods,
  getPaymentMethodDisplay,
  calculateProcessingFees
};
