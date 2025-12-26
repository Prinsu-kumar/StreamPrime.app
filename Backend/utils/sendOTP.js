// utils/sendOTP.js

const twilio = require('twilio');

// Initialize Twilio client (for SMS)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Alternative: Use Fast2SMS or other Indian SMS providers
const axios = require('axios');

// Generate OTP
const generateOTP = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Send OTP via Twilio (International)
const sendOTPViaTwilio = async (phone, otp) => {
  try {
    // Format phone number
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    const message = await twilioClient.messages.create({
      body: `Your StreamPrime verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    return {
      success: true,
      messageId: message.sid,
      provider: 'twilio'
    };
  } catch (error) {
    console.error('Twilio OTP error:', error);
    return {
      success: false,
      error: error.message,
      provider: 'twilio'
    };
  }
};

// Send OTP via Fast2SMS (India-specific)
const sendOTPViaFast2SMS = async (phone, otp) => {
  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
      route: 'otp',
      message: `Your StreamPrime OTP is ${otp}. Valid for 10 minutes.`,
      language: 'english',
      flash: 0,
      numbers: phone
    }, {
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: response.data.return,
      messageId: response.data.request_id,
      provider: 'fast2sms'
    };
  } catch (error) {
    console.error('Fast2SMS OTP error:', error);
    return {
      success: false,
      error: error.message,
      provider: 'fast2sms'
    };
  }
};

// Send OTP via MSG91 (Indian SMS gateway)
const sendOTPViaMSG91 = async (phone, otp) => {
  try {
    const templateId = process.env.MSG91_TEMPLATE_ID || 'your_template_id';
    
    const response = await axios.post('https://api.msg91.com/api/v5/flow/', {
      template_id: templateId,
      short_url: '0',
      recipients: [{
        mobiles: phone.replace('+91', ''),
        otp: otp
      }]
    }, {
      headers: {
        'authkey': process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: response.data.type === 'success',
      messageId: response.data.message_id,
      provider: 'msg91'
    };
  } catch (error) {
    console.error('MSG91 OTP error:', error);
    return {
      success: false,
      error: error.message,
      provider: 'msg91'
    };
  }
};

// Main OTP sending function
const sendOTP = async (phone, method = 'fast2sms') => {
  try {
    const otp = generateOTP();
    
    // Store OTP in database (you'll need to implement this)
    // await storeOTP(phone, otp);
    
    let result;
    
    switch (method.toLowerCase()) {
      case 'twilio':
        result = await sendOTPViaTwilio(phone, otp);
        break;
      case 'fast2sms':
        result = await sendOTPViaFast2SMS(phone, otp);
        break;
      case 'msg91':
        result = await sendOTPViaMSG91(phone, otp);
        break;
      default:
        // Default to console log for development
        console.log(`OTP for ${phone}: ${otp}`);
        return {
          success: true,
          otp: otp, // Only in development!
          message: 'OTP logged to console (development mode)',
          provider: 'console'
        };
    }
    
    // Return OTP in development, not in production
    if (process.env.NODE_ENV === 'development') {
      result.otp = otp; // Only for development/testing
    }
    
    return result;
  } catch (error) {
    console.error('Error in sendOTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify OTP
const verifyOTP = async (phone, userEnteredOTP) => {
  try {
    // Retrieve stored OTP from database
    // const storedOTP = await getStoredOTP(phone);
    
    // For now, simulate OTP verification
    // In real app, compare with database stored OTP
    
    // Mock verification - always return true for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    }
    
    // Production: Compare with stored OTP
    // if (storedOTP === userEnteredOTP) {
    //   return { success: true, message: 'OTP verified' };
    // } else {
    //   return { success: false, error: 'Invalid OTP' };
    // }
    
    return {
      success: true,
      message: 'OTP verification successful'
    };
    
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// OTP template for different purposes
const OTPTemplates = {
  LOGIN: (otp) => `Your StreamPrime login OTP is ${otp}. Valid for 10 minutes.`,
  SIGNUP: (otp) => `Welcome to StreamPrime! Your verification code is ${otp}.`,
  PAYMENT: (otp) => `Your payment OTP is ${otp}. Do not share with anyone.`,
  RESET_PASSWORD: (otp) => `Use OTP ${otp} to reset your StreamPrime password.`
};

// Utility to check OTP expiry
const isOTPExpired = (createdAt, expiryMinutes = 10) => {
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60 * 1000);
  return new Date() > expiryTime;
};

// Rate limiting for OTP requests
const rateLimitOTP = async (phone, maxAttempts = 3, timeWindowMinutes = 15) => {
  // Implement rate limiting logic here
  // Track requests per phone number in database or Redis
  
  return {
    allowed: true,
    attempts: 0,
    remaining: maxAttempts
  };
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  OTPTemplates,
  isOTPExpired,
  rateLimitOTP,
  sendOTPViaTwilio,
  sendOTPViaFast2SMS,
  sendOTPViaMSG91
};