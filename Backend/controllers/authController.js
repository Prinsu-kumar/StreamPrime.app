const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Generate OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ phone });
    
    if (!user) {
      // Create new user
      user = new User({ phone });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save OTP to user (in production, send via SMS)
    user.otp = {
      code: otp,
      expiresAt
    };
    
    await user.save();
    
    // In development, return OTP. In production, send via SMS
    const response = {
      success: true,
      message: 'OTP sent successfully',
      userId: user._id
    };
    
    // Only show OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp;
    }
    
    res.json(response);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if OTP exists and is valid
    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    // Check if OTP expired
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }
    
    // Clear OTP
    user.otp = undefined;
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        walletBalance: user.walletBalance,
        name: user.name
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-otp');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT approach, logout is handled on the client side
    // Client simply removes the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate input
    if (name && name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};