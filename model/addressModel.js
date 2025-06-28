const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // For better query performance
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'billing', 'shipping', 'other'],
    default: 'home',
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Contact Information
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10,15}$/, "Please enter a valid phone number."]
  },
  // Address Details
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  apartment: {
    type: String,
    trim: true,
    maxlength: 50,
    default: null
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'India'
  },
  // Additional Information
  landmark: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
addressSchema.index({ userID: 1, isActive: 1 });
addressSchema.index({ userID: 1, isDefault: 1 });
addressSchema.index({ userID: 1, addressType: 1 });

// Pre-save middleware to ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    // Remove default flag from other addresses of the same user
    await this.constructor.updateMany(
      { userID: this.userID, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Pre-update middleware for findOneAndUpdate operations
addressSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.isDefault) {
    const address = await this.model.findOne(this.getQuery());
    if (address) {
      await this.model.updateMany(
        { userID: address.userID, _id: { $ne: address._id } },
        { isDefault: false }
      );
    }
  }
  next();
});

// Static method to get default address for a user
addressSchema.statics.getDefaultAddress = function(userID) {
  return this.findOne({ userID, isDefault: true, isActive: true });
};

// Static method to get all active addresses for a user
addressSchema.statics.getUserAddresses = function(userID) {
  return this.find({ userID, isActive: true }).sort({ isDefault: -1, createdAt: -1 });
};

// Instance method to set as default
addressSchema.methods.setAsDefault = async function() {
  await this.constructor.updateMany(
    { userID: this.userID },
    { isDefault: false }
  );
  this.isDefault = true;
  return this.save();
};

const Address = mongoose.model('Address', addressSchema);

module.exports = Address; 