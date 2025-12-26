# StreamPrime Backend API

A video streaming platform with payment integration, wallet system, and video management.

## Features

- ✅ OTP-based authentication (phone login)
- ✅ JWT token management
- ✅ Video streaming with 48-hour access window
- ✅ Wallet system with Razorpay integration
- ✅ Video recommendations based on watch history
- ✅ Admin panel for video management
- ✅ Transaction history and statistics
- ✅ Rate limiting and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Payment Gateway**: Razorpay
- **File Upload**: Multer
- **Video Streaming**: Cloudinary/AWS S3
- **SMS Gateway**: Twilio, Fast2SMS, MSG91

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Setup Steps

1. **Clone and install dependencies**
```bash
cd Backend
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Start the server**
```bash
npm start
# For development with hot reload:
npm install -g nodemon
nodemon app.js
```

4. **Verify API is running**
```bash
curl http://localhost:3000/health
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /send-otp` - Send OTP to phone number
- `POST /verify-otp` - Verify OTP and get JWT token
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update user profile (requires auth)
- `POST /logout` - Logout (client-side)

### Videos (`/api/videos`)
- `GET /` - Get all videos (paginated, filterable)
- `GET /:id` - Get video details with preview
- `GET /search/:query` - Search videos
- `GET /trending/trending` - Get trending videos
- `GET /category/:category` - Get videos by category
- `POST /:id/watch` - Watch video (pay and access)
- `POST /` - Create video (admin only)
- `PUT /:id` - Update video (admin only)
- `DELETE /:id` - Delete video (admin only)

### Users (`/api/users`)
- `GET /history` - Get watch history
- `POST /history/:videoId` - Add to watch history
- `GET /recommendations` - Get recommendations
- `PUT /preferences` - Update user preferences
- `GET /stats` - Get user statistics
- `DELETE /history` - Clear watch history

### Payment (`/api/payment`)
- `POST /create-order` - Create Razorpay order
- `POST /verify` - Verify payment
- `GET /wallet/balance` - Get wallet balance
- `POST /wallet/add` - Add money to wallet
- `GET /wallet/transactions` - Get transaction history
- `GET /wallet/stats` - Get wallet statistics
- `POST /webhook` - Razorpay webhook

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/streamprime

# JWT
JWT_SECRET=your-secret-key

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# OTP Services
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# Server
PORT=3000
NODE_ENV=development
```

## Project Structure

```
Backend/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── videoController.js
│   ├── paymentController.js
│   ├── userController.js
│   └── walletController.js
├── models/              # MongoDB schemas
│   ├── user.js
│   ├── video.js
│   ├── transaction.js
│   └── Wallet.js
├── routes/              # API routes
│   ├── auth.js
│   ├── videos.js
│   ├── users.js
│   └── payment.js
├── middleware/          # Custom middleware
│   ├── auth.js          # JWT verification
│   ├── admin.js         # Admin check
│   └── upload.js        # File upload config
├── utils/               # Utility functions
│   ├── razorpay.js
│   └── sendOTP.js
├── app.js               # Main server file
├── package.json
└── .env.example
```

## Key Workflows

### Video Purchase Flow
1. User calls `/api/videos/:id/watch`
2. System checks wallet balance
3. If insufficient: return error with balance
4. If sufficient: deduct amount from wallet
5. Create transaction record
6. Add to watch history
7. Return video URL with 48-hour expiry

### Wallet Recharge Flow
1. User calls `/api/payment/create-order` with amount
2. Razorpay order created
3. Client redirects to Razorpay checkout
4. After payment, client calls `/api/payment/verify`
5. Signature verified
6. Wallet balance updated

### Watch History & Recommendations
1. Videos added to history when watched
2. Recommendations based on previously watched videos
3. Trending videos sorted by view count
4. Search using MongoDB regex

## Error Handling

All endpoints return consistent error format:
```json
{
  "error": "Error message",
  "details": "Additional information (if available)"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (no/invalid token)
- `402` - Payment required (insufficient balance)
- `403` - Forbidden (admin required)
- `404` - Not found
- `500` - Server error

## Security Features

- ✅ JWT token validation on protected routes
- ✅ Admin middleware for sensitive operations
- ✅ Input validation on all endpoints
- ✅ Razorpay signature verification
- ✅ OTP expiry (10 minutes)
- ✅ Multer file upload validation
- ✅ CORS enabled for frontend

## Testing

### Test OTP Login (Development)
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Response includes OTP (in development only)
# Then verify:
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "1234"}'
```

### Test Video Listing
```bash
curl http://localhost:3000/api/videos
curl http://localhost:3000/api/videos?page=1&limit=10&category=action
curl http://localhost:3000/api/videos/search/action?limit=10
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Hide OTP in response (automatic in production)
- [ ] Set up MongoDB Atlas (cloud)
- [ ] Configure Razorpay webhooks
- [ ] Setup SMS gateway properly
- [ ] Use environment variables (never hardcode)
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure error monitoring (Sentry/DataDog)

### Deploy to Heroku
```bash
# Create Procfile
echo "web: node app.js" > Procfile

# Deploy
heroku create your-app-name
heroku config:set MONGODB_URI="..."
heroku config:set JWT_SECRET="..."
git push heroku main
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check firewall settings
- Verify credentials in `.env`

### OTP Not Sending
- Check SMS gateway credentials in `.env`
- Ensure phone number is in E.164 format (+countrycode-number)
- Check API quotas

### Payment Verification Fails
- Ensure RAZORPAY_KEY_SECRET is correct
- Check webhook signature is being sent
- Verify Razorpay environment (test vs live)

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push: `git push origin feature/your-feature`
4. Create Pull Request

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
