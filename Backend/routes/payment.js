// routes/payment.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/auth');

// Create Razorpay order for wallet recharge
router.post('/create-order', authMiddleware, paymentController.createOrder);

// Verify payment
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// Get wallet balance
router.get('/wallet/balance', authMiddleware, walletController.getWalletBalance);

// Add money to wallet
router.post('/wallet/add', authMiddleware, walletController.addToWallet);

// Get transaction history
router.get('/wallet/transactions', authMiddleware, walletController.getTransactions);

// Get wallet stats
router.get('/wallet/stats', authMiddleware, walletController.getWalletStats);

// Webhook for Razorpay
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;