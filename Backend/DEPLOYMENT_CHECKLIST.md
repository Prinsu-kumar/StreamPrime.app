# StreamPrime Backend - Pre-Deployment Checklist

## ✅ Code Issues - FIXED

- [x] Fixed paymentcontoller.js → paymentController.js (naming)
- [x] Added missing logout() method in authController
- [x] Added missing updateProfile() method in authController
- [x] Created walletController.js with all required methods
- [x] Added all missing videoController methods:
  - [x] searchVideos()
  - [x] getTrending()
  - [x] getByCategory()
  - [x] createVideo()
  - [x] updateVideo()
  - [x] deleteVideo()
- [x] Fixed OTP exposure - only returns in development mode
- [x] Added input validation to all controllers
- [x] Added admin middleware for protected routes
- [x] Updated User model with isAdmin field
- [x] Made Transaction.videoId optional (for wallet recharge)
- [x] Added database indexes for performance

## 🔐 Security Checklist

- [ ] Set strong JWT_SECRET in .env (minimum 32 characters)
- [ ] Configure RAZORPAY_KEY_SECRET correctly
- [ ] Set NODE_ENV=production before deploying
- [ ] Enable CORS only for your frontend domain
- [ ] Set up rate limiting on OTP endpoints
- [ ] Configure webhook signature verification
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Set up environment variables (never commit .env)
- [ ] Configure firewall/security groups
- [ ] Review and update CORS configuration in app.js

## 📋 Configuration Checklist

- [ ] Create .env file from .env.example
- [ ] Add MONGODB_URI (MongoDB Atlas or local)
- [ ] Add Razorpay credentials:
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
  - RAZORPAY_WEBHOOK_SECRET
- [ ] Configure SMS service (Twilio/Fast2SMS/MSG91):
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_PHONE_NUMBER
- [ ] Set JWT_SECRET
- [ ] Set PORT (default: 3000)
- [ ] Configure AWS/Cloudinary if needed

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Test /api/auth/send-otp with valid phone
- [ ] Test /api/auth/send-otp with invalid phone
- [ ] Test /api/auth/verify-otp with correct OTP
- [ ] Test /api/auth/verify-otp with wrong OTP
- [ ] Test JWT token is returned
- [ ] Test /api/auth/profile with valid token
- [ ] Test /api/auth/profile with invalid token

### Video Flow
- [ ] Test GET /api/videos (public access)
- [ ] Test GET /api/videos/:id (preview)
- [ ] Test GET /api/videos/search/:query
- [ ] Test GET /api/videos/trending/trending
- [ ] Test POST /api/videos/:id/watch with insufficient balance
- [ ] Test POST /api/videos/:id/watch with sufficient balance
- [ ] Verify watch history is updated
- [ ] Test admin video creation (POST /api/videos)
- [ ] Test admin video update (PUT /api/videos/:id)
- [ ] Test admin video delete (DELETE /api/videos/:id)

### Payment Flow
- [ ] Test POST /api/payment/create-order
- [ ] Test POST /api/payment/verify (valid signature)
- [ ] Test POST /api/payment/verify (invalid signature)
- [ ] Test GET /api/payment/wallet/balance
- [ ] Test wallet balance updates correctly
- [ ] Test transaction history
- [ ] Test wallet statistics

### User Flow
- [ ] Test PUT /api/auth/profile (update name/email)
- [ ] Test GET /api/users/history
- [ ] Test POST /api/users/history/:videoId
- [ ] Test GET /api/users/recommendations
- [ ] Test GET /api/users/stats
- [ ] Test DELETE /api/users/history

## 📦 Deployment Checklist

### Before Deployment
- [ ] All tests passing
- [ ] No console.log statements left (or use proper logging)
- [ ] Error handling complete
- [ ] Input validation on all endpoints
- [ ] Database indexes created
- [ ] Environment variables configured
- [ ] SSL certificate ready (for HTTPS)
- [ ] Backup plan in place

### Infrastructure Setup
- [ ] MongoDB Atlas created and configured
- [ ] Razorpay account created and verified
- [ ] SMS gateway account and API keys
- [ ] AWS S3 or Cloudinary configured (if using)
- [ ] Domain name configured
- [ ] SSL certificate installed
- [ ] Email service setup (for notifications)

### Application Deployment
- [ ] Clone repository to production server
- [ ] Install dependencies: `npm install`
- [ ] Set NODE_ENV=production
- [ ] Configure all environment variables
- [ ] Test API endpoints
- [ ] Setup monitoring/logging
- [ ] Setup automated backups
- [ ] Create deployment script

### Post-Deployment
- [ ] Verify all endpoints working
- [ ] Check database connectivity
- [ ] Monitor error logs
- [ ] Setup alerts for critical errors
- [ ] Test payment gateway in live mode
- [ ] Monitor wallet transactions
- [ ] Keep backups updated

## 🚀 Performance Optimization

- [x] Added database indexes on frequently queried fields
- [ ] Setup caching for videos (Redis recommended)
- [ ] Implement pagination on all list endpoints
- [ ] Compress responses using gzip (configured)
- [ ] Setup CDN for video streaming
- [ ] Monitor API response times
- [ ] Optimize database queries

## 📊 Monitoring Setup

- [ ] Setup error tracking (Sentry, DataDog, etc.)
- [ ] Configure logging (Winston, Pino, etc.)
- [ ] Setup performance monitoring
- [ ] Configure alerting for:
  - Payment failures
  - Database connection errors
  - High error rates
  - Unusual transaction patterns
- [ ] Create dashboard for metrics

## 📝 Documentation

- [x] Created comprehensive README
- [x] Documented all API endpoints
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Document database schema
- [ ] Create troubleshooting guide
- [ ] Document deployment process
- [ ] Create development guidelines

## 🔍 Code Quality

- [ ] ESLint configured
- [ ] Prettier for code formatting
- [ ] Remove unused dependencies
- [ ] Add proper comments for complex logic
- [ ] Review for security vulnerabilities
- [ ] Performance review

## 📞 Support & Maintenance

- [ ] Setup customer support system
- [ ] Create bug report template
- [ ] Document common issues
- [ ] Create maintenance schedule
- [ ] Plan for scaling
- [ ] Regular security audits

## 🎯 Final Sign-Off

- [ ] Code review completed
- [ ] All tests passing
- [ ] Security review passed
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Team approval obtained

---

## Quick Start Commands

```bash
# Setup
cd Backend
npm install

# Development
npm run dev

# Testing (manual)
curl http://localhost:3000/health

# Production deployment
npm start
```

## Common Issues & Fixes

### Issue: "Cannot find module 'paymentController'"
**Fix**: The file was renamed from `paymentcontoller.js` → `paymentController.js`

### Issue: "Admin access required" error
**Fix**: The user needs `isAdmin: true` in the database

### Issue: "Invalid JWT token"
**Fix**: Ensure Bearer token is sent in Authorization header: `Bearer <token>`

### Issue: "Payment verification failed"
**Fix**: Verify RAZORPAY_KEY_SECRET matches your Razorpay account

---

**Last Updated**: December 25, 2025
**Status**: Ready for Testing ✅
