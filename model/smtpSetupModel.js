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
    purpose: {
        type: Number,
        enum: [0, 1],   // 0 for forget_password, 1 for register
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // expires: 300, // OTP expires after 5 minutes (300 seconds)
    },
});

// Enforce uniqueness for email + purpose
// SmtpOtpSchema.index({ email: 1, purpose: 1 }, { unique: true });

const SmtpOtp = mongoose.model('SmtpOtp', SmtpOtpSchema);
module.exports = SmtpOtp;