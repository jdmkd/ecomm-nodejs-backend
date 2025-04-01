const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const couponController = require('../controllers/couponController'); // Import controller functions


// Routes for coupon
router.get('/', asyncHandler(couponController.getAllCoupons));
router.get('/:id', asyncHandler(couponController.getCouponById));
router.post('/', asyncHandler(couponController.createCoupon));
router.put('/:id', asyncHandler(couponController.updateCoupon));
router.delete('/:id', asyncHandler(couponController.deleteCoupon));
router.post('/check-coupon', asyncHandler(couponController.checkCouponValidity));

module.exports = router;
