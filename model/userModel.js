const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: null,
    maxlength: 15
  },
  image: {
    type: String,
    default: null,  // Stores the path of the profile photo (nullable)
    trim: true,
  },
  // image: {
  //   type: Buffer, 
  //   contentType: String // Store image MIME type (optional)
  // },
  verfied: {
    type: Number,
    enum: [0, 1],   // 0 for not verfied, 1 for verfied
    default: 1
  },
  role: {
    type: Number,
    enum: [0, 1],   // Only allows 0 (customer) or 1 (admin)
    default: 0,     // Default role is 0 (customer)
  },
  
  status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      maxlength: 10
    },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update 'updatedAt' before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;