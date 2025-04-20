const mongoose = require('mongoose');

// Notification schema
const notificationSchema = new mongoose.Schema({
    notificationId: {
        type: String,
        required: [true, 'Notification ID is required'],
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create the Notification model
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
