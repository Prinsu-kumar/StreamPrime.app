# StreamPrime - Development Setup Guide

## ✅ Quick Start

Your `.env` file is already set up for **development mode** with:
- ✅ MongoDB connection configured
- ✅ JWT secret set
- ✅ Optional services ready (can be empty)

## 🚀 Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` ✅

---

## 🧪 Test Without Paying

All features work without Razorpay configured:

### 1. Authentication (Works!)
```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Response includes OTP (in development mode)
# Use that OTP to verify:
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "1234"}'
```

### 2. Videos (Works!)
```bash
# List all videos
curl http://localhost:3000/api/videos

# Search videos
curl "http://localhost:3000/api/videos/search/action"

# Get trending
curl http://localhost:3000/api/videos/trending/trending
```

### 3. User Features (Works!)
```bash
# Get watch history (requires token from login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/history
```

### 4. Payments (Shows Friendly Error)
When payment features are not configured, you'll get:
```json
{
  "error": "Payment service not configured. Please contact admin."
}
```

This is **expected** in development. ✅

---

## 🔧 Optional: Setup Real Razorpay (For Testing Payments)

To test actual payments, update `.env`:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Get these from: https://dashboard.razorpay.com/

Then restart the server:
```bash
npm run dev
```

---

## 📊 What Works Now

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ | Phone OTP, JWT, profile |
| Videos | ✅ | List, search, trending |
| Users | ✅ | History, recommendations |
| Payments | ✅ | Friendly error when not configured |
| Wallet | ✅ | Friendly error when not configured |

---

## 🆘 Troubleshooting

### Error: "Cannot connect to MongoDB"
**Solution**: Ensure MongoDB connection string in `.env` is correct
```bash
# Check connection
mongosh "your_connection_string"
```

### Error: "CORS error"
**Solution**: Normal in development, configure frontend origin in production

### Error: "JWT error"
**Solution**: Make sure you're sending the Bearer token correctly:
```bash
curl -H "Authorization: Bearer <YOUR_TOKEN>" http://localhost:3000/api/...
```

### Payment endpoints return "not configured"
**Solution**: This is **normal in development**. Add Razorpay keys to `.env` to enable.

---

## ✨ Ready to Develop!

Your backend is ready for:
- ✅ Local development
- ✅ Testing without payments
- ✅ Integration with frontend
- ✅ Adding new features

When ready for production:
1. Add real Razorpay credentials
2. Update MongoDB connection string
3. Set NODE_ENV=production
4. Follow DEPLOYMENT_CHECKLIST.md

---

**Happy coding!** 🚀
