// server.js - Final version

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Error:', err.message));

// Import routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payment');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({
    status: 'OK',
    service: 'StreamPrime Backend API',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API documentation route
app.get('/api-docs', (req, res) => {
  res.json({
    name: 'StreamPrime API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/send-otp': 'Send OTP to phone',
        'POST /api/auth/verify-otp': 'Verify OTP and login',
        'GET /api/auth/profile': 'Get user profile'
      },
      videos: {
        'GET /api/videos': 'Get all videos',
        'GET /api/videos/:id': 'Get video details',
        'POST /api/videos/:id/watch': 'Pay and watch video',
        'GET /api/videos/search/:query': 'Search videos'
      },
      users: {
        'GET /api/users/history': 'Get watch history',
        'GET /api/users/recommendations': 'Get recommendations',
        'PUT /api/users/preferences': 'Update preferences'
      },
      payment: {
        'POST /api/payment/create-order': 'Create payment order',
        'POST /api/payment/verify': 'Verify payment',
        'GET /api/payment/wallet/balance': 'Get wallet balance'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🎬 Video API: http://localhost:${PORT}/api/videos`);
  console.log(`👤 User API: http://localhost:${PORT}/api/users`);
});