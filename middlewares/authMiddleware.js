const jwt = require('jsonwebtoken');
const { sendError } = require('../helpers/responseUtil');
const User = require('../model/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer token
        
        if (!token) {
            return sendError(res, 'Unauthorized access. No token provided.', 401);
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Fetch user details from DB (excluding sensitive fields)
        const user = await User.findById(decoded.id).select('-password -__v');
        
        if (!user) {
            return sendError(res, 'Unauthorized access. User not found.', 401);
        }

        req.user = user; // Attach user to request
        next(); // Proceed to next middleware or controller
    } catch (error) {
        return sendError(res, 'Invalid or expired token.', 401);
    }
};


const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized, no token" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token failed, not authorized" });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 1) {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Not authorized as an admin" });
    }
};

module.exports = { authMiddleware, protect, isAdmin };

