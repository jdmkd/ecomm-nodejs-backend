const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const uploadCloudinary = require('../middlewares/uploadMiddleware')
const notificationController = require('../controllers/notificationController');


// Routes for Send Notification
// uploadCloudinary.uploadCategory.single('imageUrl')
router.post('/send-notification', asyncHandler(notificationController.sendNotification));
router.get('/track-notification/:id', asyncHandler(notificationController.trackNotification));
router.get('/all-notification', asyncHandler(notificationController.getAllNotifications));
router.delete('/delete-notification/:id', asyncHandler(notificationController.deleteNotification));

module.exports = router;
