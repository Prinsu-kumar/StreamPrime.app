# 🚀 Quick Start Guide - StreamPrime Backend

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and add your credentials:
# - MONGODB_URI
# - JWT_SECRET (use strong password)
# - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
# - SMS gateway credentials
```

### 3. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### 4. Verify It's Working
```bash
curl http://localhost:3000/health
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Complete documentation & API reference |
| `DEPLOYMENT_CHECKLIST.md` | Pre-deployment security & setup |
| `FIXES_APPLIED.md` | What was fixed and why |
| `VERIFICATION_REPORT.md` | Detailed verification results |

---

## 🧪 Quick Test

### Test Authentication
```bash
# 1. Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# 2. Verify OTP (use the OTP from response)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "1234"}'
```

### Test Videos
```bash
# Get all videos
curl http://localhost:3000/api/videos

# Search videos
curl "http://localhost:3000/api/videos/search/action"

# Trending videos
curl http://localhost:3000/api/videos/trending/trending
```

---

## 🔧 Troubleshooting

### Error: Cannot find module 'paymentController'
**Solution**: The old file `paymentcontoller.js` has been replaced with `paymentController.js`. This is fixed.

### Error: "Admin access required"
**Solution**: User needs `isAdmin: true` in database. Update user document in MongoDB.

### Error: MongoDB Connection Failed
**Solution**: 
- Check MongoDB is running
- Verify MONGODB_URI in .env
- Ensure network access (if using Atlas)

### Error: Invalid JWT Token
**Solution**: 
- Make sure token is in Authorization header: `Bearer <token>`
- Check JWT_SECRET is correct

---

## 📋 What's New (All Fixes Applied)

✅ Fixed paymentController import (was paymentcontoller.js)  
✅ Added missing logout() method  
✅ Added missing updateProfile() method  
✅ Created walletController.js with 4 methods  
✅ Added 6 missing videoController methods  
✅ Added admin middleware  
✅ Fixed OTP exposure (hidden in production)  
✅ Added input validation everywhere  
✅ Updated database models  
✅ Created comprehensive documentation  

---

## 🔐 Before Production

```bash
# 1. Set strong JWT secret
export JWT_SECRET="your-super-secret-32-character-key"

# 2. Set production mode
export NODE_ENV=production

# 3. Configure all required .env variables
# See README.md for complete list

# 4. Run tests
npm test

# 5. Check security
# See DEPLOYMENT_CHECKLIST.md
```

---

## 📖 API Endpoints (Quick Reference)

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Login with OTP
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Videos
- `GET /api/videos` - List videos
- `GET /api/videos/:id` - Get details
- `POST /api/videos/:id/watch` - Watch video
- `GET /api/videos/search/:query` - Search
- `GET /api/videos/trending/trending` - Trending

### Users
- `GET /api/users/history` - Watch history
- `GET /api/users/recommendations` - Recommendations
- `GET /api/users/stats` - User stats

### Payments
- `POST /api/payment/create-order` - Create order
- `POST /api/payment/verify` - Verify payment
- `GET /api/payment/wallet/balance` - Balance
- `GET /api/payment/wallet/transactions` - History
- `GET /api/payment/wallet/stats` - Statistics

See `README.md` for complete documentation.

---

## 🎯 Next Steps

1. **Setup** → Follow "5-Minute Setup" above
2. **Test** → Run "Quick Test" commands
3. **Review** → Read `README.md` for full API docs
4. **Before Production** → Follow `DEPLOYMENT_CHECKLIST.md`
5. **Deploy** → Use your deployment method

---

## 💡 Tips

- Use `npm run dev` for development (auto-reloads)
- Check `http://localhost:3000/api-docs` for API overview
- Monitor console for any errors
- Keep `.env` file secure (never commit it)
- Use MongoDB Atlas for production

---

## ❓ Need Help?

1. Check `README.md` - Most issues documented
2. Check `DEPLOYMENT_CHECKLIST.md` - Deployment guide
3. Check console errors - Usually very helpful
4. Verify `.env` variables - Most issues are config-related

---

**Ready to code?** Start with `npm run dev` 🚀
