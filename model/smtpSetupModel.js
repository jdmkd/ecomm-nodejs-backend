const mongoose = require('mongoose');

const SmtpOtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true,
        
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // expires: 300, // OTP expires after 5 minutes (300 seconds)
    },
});

const SmtpOtp = mongoose.model('SmtpOtp', SmtpOtpSchema);
module.exports = SmtpOtp;