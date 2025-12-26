const User = require('../models/user');

// Admin middleware - checks if user is admin
module.exports = async (req, res, next) => {
  try {
    // Get user from database
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user is admin (add isAdmin field to User model)
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
