const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address."],
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
    maxlength: 15,
    match: [/^\d{10,15}$/, "Please enter a valid phone number."],
  },
  image: {
    type: String,
    default: null, // Stores the path of the profile photo (nullable)
    trim: true,
    match: [
      /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/,
      "Invalid image URL.",
    ],
  },
  // image: {
  //   type: Buffer,
  //   contentType: String // Store image MIME type (optional)
  // },
  verfied: {
    type: Number,
    enum: [0, 1], // 0 for not verfied, 1 for verfied
    default: 1,
  },
  role: {
    type: Number,
    enum: [0, 1], // Only allows 0 (customer) or 1 (admin)
    default: 0, // Default role is 0 (customer)
  },

  status: {
    type: String,
    enum: ["active", "inactive", "suspended", "blocked", "banned"],
    default: "active",
    trim: true,
    lowercase: true,
    maxlength: 10,
  },

  dateOfBirth: {
    type: Date,
    required: false,
    default: null,
    validate: {
      validator: function (value) {
        if (!value) return true;

        const dob = new Date(value);
        const today = new Date();

        // Check 1: Date must not be in the future
        if (dob > today) return false;

        // Check 2: Must be at least 16 years old
        const minAllowedDOB = new Date(
          today.getFullYear() - 16,
          today.getMonth(),
          today.getDate()
        );

        return dob <= minAllowedDOB;
      },
      message:
        "Date of birth must not be in the future and user must be at least 16 years old.",
    },
  },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: null,
    required: false,
    lowercase: true,
    trim: true,
  },

  currentAddress: {
    type: String,
    required: false,
    trim: true,
    maxlength: 255,
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update 'updatedAt' before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-update 'updatedAt' on findOneAndUpdate
userSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
