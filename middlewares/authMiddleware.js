const jwt = require("jsonwebtoken");
const { sendError } = require("../helpers/responseUtil");
const User = require("../model/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Common token verification logic
const verifyToken = async (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Unauthorized access. No token provided.");

  const decoded = jwt.verify(token, JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password -__v");

  if (!user) throw new Error("Unauthorized access. User not found.");

  return user;
};

// General auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    req.user = await verifyToken(req);
    next();
  } catch (err) {
    return sendError(res, err.message, 401);
  }
};

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 1) {
    return next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized as an admin" });
  }
};

module.exports = { authMiddleware, isAdmin };
