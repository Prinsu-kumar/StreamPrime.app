# 🚀 Quick Commands Reference

## Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` ✅

---

## Test Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### List Videos
```bash
curl http://localhost:3000/api/videos
```

### Search Videos
```bash
curl "http://localhost:3000/api/videos/search/action"
```

### Send OTP
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### Verify OTP (Replace 1234 with OTP from response)
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "1234"}'
```

### Get User Profile (Replace TOKEN with your JWT)
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/auth/profile
```

### Get Trending Videos
```bash
curl http://localhost:3000/api/videos/trending/trending
```

---

## View Documentation

- **Setup Guide**: `SETUP_GUIDE.md`
- **Full API Docs**: `README.md`
- **Environment Fix**: `ENV_FIX.md`
- **Documentation Index**: `INDEX.md`
- **Deployment Checklist**: `DEPLOYMENT_CHECKLIST.md`

---

## Database

### Check MongoDB Connection
```bash
# Your .env has MongoDB connection string
# Verify it works by starting the server
npm run dev
```

---

## Environment Variables

### Current Values
```env
MONGODB_URI=mongodb+srv://somilsingh597:Prinsu%408009@codingadda.zlitdym.mongodb.net/StreamPrime
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

### Optional (For Payment Testing)
```env
RAZORPAY_KEY_ID=          ← Add your key here
RAZORPAY_KEY_SECRET=      ← Add your secret here
RAZORPAY_WEBHOOK_SECRET=  ← Add webhook secret here
```

---

## Troubleshooting

### Server won't start
```bash
# Check Node.js version
node --version  # Should be v14+

# Check if port 3000 is in use
# Change PORT in .env if needed
```

### Can't connect to MongoDB
```bash
# Verify connection string in .env
# Make sure whitelist includes your IP on MongoDB Atlas
```

### CORS errors
```bash
# Normal in development
# Will be fixed when you configure frontend origin in production
```

---

## Development Tips

### Auto-reload on file changes
```bash
npm run dev
# Uses nodemon - restarts on every file save
```

### Production mode
```bash
npm start
# No auto-reload, optimized for deployment
```

### Check code syntax
```bash
node -c app.js
node -c controllers/authController.js
```

---

## File Structure

```
Backend/
├── app.js                     ← Main server
├── package.json               ← Dependencies
├── .env                       ← Configuration (CREATED)
├── controllers/               ← Business logic
├── routes/                    ← API endpoints
├── models/                    ← Database schemas
├── middleware/                ← Auth, validation
├── utils/                     ← Helpers
└── *.md                       ← Documentation
```

---

## All Endpoints

### Auth (5)
```
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
GET    /api/auth/profile
PUT    /api/auth/profile
POST   /api/auth/logout
```

### Videos (9)
```
GET    /api/videos
GET    /api/videos/:id
POST   /api/videos/:id/watch
GET    /api/videos/search/:query
GET    /api/videos/trending/trending
GET    /api/videos/category/:category
POST   /api/videos                (admin)
PUT    /api/videos/:id            (admin)
DELETE /api/videos/:id            (admin)
```

### Users (6)
```
GET    /api/users/history
POST   /api/users/history/:videoId
GET    /api/users/recommendations
PUT    /api/users/preferences
GET    /api/users/stats
DELETE /api/users/history
```

### Payment (7)
```
POST   /api/payment/create-order
POST   /api/payment/verify
GET    /api/payment/wallet/balance
POST   /api/payment/wallet/add
GET    /api/payment/wallet/transactions
GET    /api/payment/wallet/stats
POST   /api/payment/webhook
```

---

## Quick Links

| Need | File |
|------|------|
| Get started | SETUP_GUIDE.md |
| API docs | README.md |
| All docs | INDEX.md |
| Deploy | DEPLOYMENT_CHECKLIST.md |
| Fix info | ENV_FIX.md |

---

## What Works Now ✅

- ✅ Authentication
- ✅ Videos (list, search, watch, admin)
- ✅ User features
- ✅ Payments (shows friendly error if no keys)
- ✅ All 27 endpoints
- ✅ Database integration
- ✅ Error handling

---

**Ready to code?** Run: `npm run dev` 🚀
