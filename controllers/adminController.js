const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFoundError,
} = require("../helpers/responseUtil");
const { sendMail } = require("../config/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

exports.loginAdminUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendValidationError(res, "Email and password are required.");
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // Check if the user exists
    if (!user) {
      return sendError(res, "Invalid email or password.", 401);
    }

    // Compare passwords immediately
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, "Invalid email or password.", 401);

    // Admin role check
    if (user.role !== 1) {
      // return sendError(res, "Invalid email or password.", 401);
      return sendError(res, "Access denied. Admins only.", 403);
    }

    if (["banned", "blocked"].includes(user.status)) {
      return sendError(res, "Your account is restricted.", 403);
    }

    // Check if user is verified
    if (user.verfied == 0) {
      return sendError(
        res,
        "Your account is not verified. Please check your email for the OTP.",
        403
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "15d" }
    );

    const userData = await User.findById(user._id).select("-password -__v");
    // Authentication successful
    return sendSuccess(res, "Admin Login successful.", {
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(
      res,
      "An error occurred while logging in. Please try again later.",
      500
    );
  }
};

// @desc Get all users
exports.getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json({ success: true, data: users });
};

// Get all users
// exports.getAllUsers = asyncHandler(async (req, res) => {
//   try {
//     const users = await User.find(); // Exclude sensitive fields;
//     return sendSuccess(res, "Users retrieved successfully.", users);
//   } catch (error) {
//     return sendError(res, error.message);
//   }
// });

// @desc Get single user by ID
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
};

// @desc Update user by ID
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).select("-password");
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
};

// @desc Delete user by ID
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User deleted successfully" });
};

// Get all user OTP
exports.getAllOtps = async (req, res) => {
  console.log("Get all user OTP");

  console.log(req.params.id);
  try {
    const otps = await SmtpOtp.find().sort({ createdAt: -1 }); // Sorted by newest first
    console.log("OTP", otps);
    return sendSuccess(res, "all data fetched successfully.", otps);
  } catch (error) {
    console.error("getAllOtps ==> ", error);
    return sendError(res, error.message);
  }
};
