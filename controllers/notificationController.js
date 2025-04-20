const Notification = require('../model/notificationModel');
const OneSignal = require('onesignal-node');
const dotenv = require('dotenv');
dotenv.config();

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APP_ID, process.env.ONE_SIGNAL_REST_API_KEY);

// Send Notification to All Users
const sendNotification = async (req, res) => {
    const { title, description, imageUrl } = req.body;
    // Validation
    if (!title || !description) {
        return res.status(400).json({ success: false, message: "Title and description are required." });
    }
    console.log("process.env.ONE_SIGNAL_APP_ID ===>",process.env.ONE_SIGNAL_APP_ID);
    console.log("req.body  ==> ",req.body);

    const notificationBody = {
        app_id: process.env.ONE_SIGNAL_APP_ID,
        contents: {
            'en': description
        },
        headings: {
            'en': title
        },
        included_segments: ['All'],
        ...(imageUrl && { big_picture: imageUrl })
    };

    try {c
        const response = await client.createNotification(notificationBody);
        console.log("response.body ==> ",response.body);
        console.log("notification response ==> ",response);
        const notificationId = response.body.id;
        console.log('Notification sent to all users:', notificationId);

        const notification = new Notification({ notificationId, title, description, imageUrl, sentAt: new Date() });
        await notification.save();

        res.json({ success: true, message: 'Notification sent successfully', data: null });
    } catch (error) {
        console.error('Error sending notification:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: "Something went wrong while sending the notification."});
    }
};

// Track Notification Status by ID
const trackNotification = async (req, res) => {
    const  notificationId  = req.params.id;

    try {
        const response = await client.viewNotification(notificationId);
        const androidStats = response.body.platform_delivery_stats;
        const stats = response.body.platform_delivery_stats;

        const result = {
            // platform: 'Android',
            platform: 'Multi',
            android: stats.android || {},
            ios: stats.ios || {},
            web: stats.chrome_web || {},
            success_delivery: stats.android?.successful || 0,
            failed_delivery: stats.android?.failed || 0,
            errored_delivery: stats.android?.errored || 0,
            opened_notification: stats.android?.converted || 0
        };

        console.log('Notification delivery stats:', result);
        
        res.json({ success: true, message: 'Notification status fetched successfully.', data: result });
    } catch (error) {
        console.error('Error tracking notification:', error?.response?.data || error.message);
        res.status(500).json({ success: false, message: "Unable to track notification at this moment."});
    }
};


// Get All Notifications
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({}).sort({ _id: -1 });
        res.json({ success: true, message: "Notifications retrieved successfully.", data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ success: false, message: "Failed to fetch notifications." });
    }
};


// Delete Notification
const deleteNotification = async (req, res) => {
    const notificationID = req.params.id;

    try {
        const notification = await Notification.findByIdAndDelete(notificationID);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }
        res.json({ success: true, message: "Notification deleted successfully.", data:null });
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        res.status(500).json({ success: false, message: "Failed to delete notification." });
    }
};


module.exports = {
    sendNotification,
    trackNotification,
    getAllNotifications,
    deleteNotification
};
