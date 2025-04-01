const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');


const paymentController = require('../controllers/paymentController');

// Routes for payment
// Stripe payment route
router.post('/stripe', asyncHandler(paymentController.handleStripePayment));

// Razorpay payment route
router.post('/razorpay', asyncHandler(paymentController.handleRazorpayPayment));

module.exports = router;