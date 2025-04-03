const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const SmtpOtp = require('../model/smtpSetupModel');

const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../helpers/responseUtil');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';



// Configure Nodemailer (Gmail example)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // App Password (enable 2FA first)
    },
});



// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();   // Exclude sensitive fields;
        // .select('-password -__v')
        return sendSuccess(res, "Users retrieved successfully.", users);
    } catch (error) {
        return sendError(res, error.message);
    }
});

// Get a user by ID
const getUserById = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -__v');
        if (!user) {
            return sendNotFoundError(res, "User not found.");
        }
        return sendSuccess(res, "User retrieved successfully.", user);
    } catch (error) {
        return sendError(res, error.message);
    }
});

// Register user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;
    
    // Validate required fields
    if (!email || !name || !password) {
        return sendValidationError(res, "Name, email, and password are required.");
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendValidationError(res, "Please provide a valid email address.");
    }
    // Validate role (if provided)
    if (role !== undefined && ![0, 1].includes(Number(role))) {
        return sendValidationError(res, "Invalid role. Allowed values: 0 (customer) or 1 (admin). ");
    }

    try {
        // Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendValidationError(res, "Email already in use.");
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save user
        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role: role || 0, 
            verfied: 0
            // role: [0, 1].includes(Number(role)) ? role : 0, // Default to 0 if invalid
            // ...(image && image.trim() !== "" && { image }) // Add image only if valid/
        });
        await user.save();

        // Return response (excluding sensitive fields)
        const newUser = await User.findOne({ email }).select('-password -__v');
        return sendSuccess(res, "User registered successfully.", newUser, 201);
    } catch (error) {
        return sendError(res, error.message);
    }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return sendError(res, "No account found with this email address.", 401);
        }
        if (user.verfied == 0) {
            return sendError(res, "You are not verified User.", 401);
        }
        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return sendError(res, "Invalid email or password.", 401);
        
        // Generate JWT token
        const token = jwt.sign({ 
            id: user._id, email: user.email, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: '15d' }
        );

        // Authentication successful
        return sendSuccess(res, "Login successful.", { user: await User.findOne({ email }).select('-password -__v'), token });
    } catch (error) {
        return sendError(res, error.message);
    }
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { name, password, image } = req.body;
        // Check if user exists
        if (!user) {
            return sendError(res, "User not found.", 404);
        }

        // Prepare update object (only modify non-empty fields)
        const updateData = {};
        if (name?.trim()) updateData.name = name;
        if (password?.trim()) updateData.password = await bcrypt.hash(password, 10);
        if (req.file && req.file.path) {
            updateData.image = req.file.path;
        }
        // Apply updates and return updated user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, select: "-password -__v" }
        );
        return sendSuccess(res, "User updated successfully.", updatedUser, 200);
    } catch (error) {
        return sendError(res, error.message);
    }
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return sendNotFoundError(res, "User not found.");
        }
        return sendSuccess(res, "User deleted successfully.");
    } catch (error) {
        return sendError(res, error.message);
    }
});


// const logoutUser = asyncHandler(async, (req, res) => {
//     res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'Strict' });
//     return sendSuccess(res, "Logged out successfully.");
// });
// Get all user OTP
const getAllOtps = async (req, res) => {
    console.log("Get all user OTP");
    
    console.log(req.params.id);
    try {
        const otps = await SmtpOtp.find().sort({ createdAt: -1 }); // Sorted by newest first
        console.log('OTP', otps);
        return sendSuccess(res, "all data fetched successfully.",otps);
    } catch (error) {
        console.error("getAllOtps ==> ",error)
        return sendError(res, error.message);
    }
};



// forget password
const forgetPassword = asyncHandler(async (req, res) => {
    const { email, purpose = 1 } = req.body; // '0 = register' or '`1 = forgot-password'

    console.log(purpose);
    
    // Check if email exists (skip for registration, enforce for forgot-password)
    if (purpose === 1) {
      const user = await User.findOne({ email });
      if (!user) {
        return sendError(res, "Email not registered.", 404);
      }
    }
  
    // Generate 4-digit OTP
    const otp = otpGenerator.generate(4, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    console.log(otp);
    
    // Save/Update OTP in DB (with purpose tracking)
    await SmtpOtp.updateOne(
        { email },
        { 
            otp,
            purpose, // 'register' or 'forgot-password'
            createdAt: new Date() 
        },
        { upsert: true }
    );
    
    // Send OTP via email
    const subject = purpose === 0 
    ? 'Verify Your Email' 
    : 'Password Reset OTP';
    
    console.log(subject);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: `Your OTP is: ${otp}\n\nExpires in 5 minutes.`
    };
  
    
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.error("Email sending error:", error);
            return sendError(res, "Failed to send OTP.",500);
        }
        return sendSuccess(res, "OTP sent to email.", 200);
    });
});
// const forgetPassword = asyncHandler(async (req, res) => {
//     const { email } = req.body;
  
//     // Check if email exists
//     const user = await User.findOne({ email });
//     if (!user) {
//         return sendError(res, "Email not registered.", 404);
//     }

//     // Generate OTP
//     const otp = otpGenerator.generate(4, {
//         digits: true,          // Only digits (0-9)
//         lowerCaseAlphabets: false,      // No uppercase letters
//         upperCaseAlphabets: false,      // No uppercase letters
//         specialChars: false,   // No special characters
//     });
      
//     let updateOtp = await SmtpOtp.updateOne(
//         { userId: user._id }, 
//         { otp, email, createdAt: new Date() }, 
//         { upsert: true }  // 🔥 Creates new if not found
//     );

//     // Send SmtpOtp via email
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: 'Password Reset OTP',
//         text: `Your OTP for password reset is: ${otp}\n\nThis OTP expires in 5 minutes.`,
//     };
  
//     transporter.sendMail(mailOptions, (error) => {
//         if (error) {
//             console.error("Email sending error:", error);
//             return sendError(res, "Failed to send OTP.",500);
//         }
//         return sendSuccess(res, "OTP sent to email.", 200);
//     });
// });


// Verify OTP and allow password reset
// const verifyOtp = asyncHandler(async (req, res) => {
//     const { email, otp, newPassword } = req.body;
  
//     // Check if OTP is valid
//     const otpRecord = await SmtpOtp.findOne({ email, otp });
//     if (!otpRecord) {
//         return sendError(res, "Invalid OTP or expired.", 400);
//     }

//     // Hash new password
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
    
//     // Update user password
//     const user = await User.findOne({ email });
//     if (!user) {
//         return sendError(res, "User not found.", 404);
//     }
//     user.password = hashedPassword; // Ensure password is hashed in pre-save hook
//     await user.save();
  
//     // Delete OTP after successful password reset
//     await SmtpOtp.deleteMany({ email });
  
//     return sendSuccess(res, "Password updated successfully.", 200);
// });
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, newPassword, purpose = 1 } = req.body; // 1 forget password and 0 - register

    // 1. Find OTP record (with purpose check)
    const otpRecord = await SmtpOtp.findOne({ 
      email, 
      otp,
      purpose // Important: Verify the OTP was sent for this purpose
    });
  console.log(otpRecord);
  
    if (!otpRecord) {
      return sendError(res, "Invalid OTP or expired.", 400);
    }
  
    // 2. Check OTP expiry (5 minutes)
    const isExpired = (new Date() - otpRecord.createdAt) > 300000; // 5 mins in ms
    if (isExpired) {
      await SmtpOtp.deleteOne({ email, purpose });
      return sendError(res, "OTP expired.", 400);
    }
  
    // 3. Handle based on purpose
    if (purpose === 0) {
      // REGISTRATION FLOW: Mark user as verified
      await User.updateOne(
        { email },
        { $set: { verfied : 1 } }
      );
    } else if (purpose === 1) {
      // PASSWORD RESET FLOW: Update password if provided
      if (!newPassword) {
        return sendError(res, "New password is required.", 400);
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
    }
  
    // 4. Cleanup (delete OTP regardless of purpose)
    await SmtpOtp.deleteOne({ email, purpose });
  
    return sendSuccess(res, 
      purpose === 0 
        ? "Email verified successfully." 
        : "Password updated successfully."
    );
});




module.exports = { 
    getAllUsers, 
    getUserById, 
    registerUser, 
    loginUser, 
    updateUser, 
    deleteUser,
    getAllOtps,
    forgetPassword,
    verifyOtp
};
