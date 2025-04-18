const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const SmtpOtp = require('../model/smtpSetupModel');

const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../helpers/responseUtil');
const { generateAndStoreOtp } = require('../helpers/otpUtil');
const { transporter } = require('../config/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();   // Exclude sensitive fields;
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
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendValidationError(res, "Please provide a valid email address.");
    }
    
    if (role !== undefined && ![0, 1].includes(Number(role))) {
        return sendValidationError(res, "Invalid role. ");
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
            verfied: 0,
        });
        
        await user.save();

        // Generate 4-digit OTP
        const otp = await generateAndStoreOtp(email, 0);
        
        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email',
            text: `Your OTP is: ${otp}\n\nExpires in 5 minutes.`
        };
        
          
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Email sending error:", error);
                // return sendError(res, "Failed to send OTP.",500);
            }
            console.log("OTP sent to email successfuly.");
            // return sendSuccess(res, "OTP sent to email.", 200);
        });

        const newUser = await User.findOne({ email }).select('-password -__v');
        return sendSuccess(res, "User registered successfully and check you email to varify you account.", newUser, 201);
    } catch (error) {
        return sendError(res, error.message);
    }
});

// Verify OTP for email verification (registration)
const verifyEmailWithOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      return sendValidationError(res, "Email and OTP are required.");
    }
  
    const purpose = 0; // Registration
    const otpRecord = await SmtpOtp.findOne({ email, otp, purpose });
  
    if (!otpRecord) {
      return sendError(res, "Invalid or expired OTP.", 400);
    }
  
    const isExpired = (new Date() - otpRecord.createdAt) > 300000; // 5 minutes
    if (isExpired) {
      await SmtpOtp.deleteOne({ email, purpose });
      return sendError(res, "OTP has expired.", 400);
    }
  
    await User.updateOne({ email }, { $set: { verfied: 1 } });
    await SmtpOtp.deleteOne({ email, purpose });
  
    return sendSuccess(res, "Email verified successfully.");
});

// Resend OTP for email verification
const resendEmailVerificationOtp = asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      const purpose = 0; // 0 = email verification
  
      if (!email) return sendValidationError(res, "Email is required.");
  
      const user = await User.findOne({ email });
      if (!user) return sendError(res, "No user found with this email.", 404);
  
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  
      // Upsert OTP (replace if already exists)
      await SmtpOtp.updateOne(
        { email, purpose },
        {
          $set: {
            userId: user._id,
            otp,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
  
      const mailSubject = "Resend: Verify Your Email - OTP Code";
      const mailHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h3>Hello ${user.name || "User"},</h3>
          <p>Your verification OTP is:</p>
          <div style="font-size: 24px; font-weight: bold; margin: 15px 0;">${otp}</div>
          <p>This OTP is valid for <b>5 minutes</b>.</p>
          <br>
          <p>Regards,<br>YourApp Team</p>
        </div>
      `;
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: mailSubject,
        html: mailHTML
      };
  
      await transporter.sendMail(mailOptions);
      return sendSuccess(res, "Verification OTP resent to your email.");
  
    } catch (error) {
      console.error("Error resending email verification OTP:", error);
      return sendError(res, "Could not resend OTP. Please try again.");
    }
}); 

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return sendValidationError(res, "Email and password are required.");
    }

    try {
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return sendError(res, "No account found with this email address.", 401);
        }

        if (user.status === 'banned' || user.status === 'blocked') {
            return sendError(res, "Your account is restricted.", 403);
        }
          
        // Check if user is verified
        if (user.verfied == 0) {
            return sendError(res, "Your account is not verified. Please check your email for the OTP.", 403);
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return sendError(res, "Invalid email or password.", 401);
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role 
            },
            JWT_SECRET, 
            { expiresIn: '15d' }
        );
        
        const userData = await User.findById(user._id).select('-password -__v');
        // Authentication successful
        return sendSuccess(res, "Login successful.", { user: userData, token });
    } catch (error) {
        console.error("Login error:", error);
        return sendError(res, "An error occurred while logging in. Please try again later.", 500);
    }
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, phone, gender, dateOfBirth, currentAddress, image } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return sendError(res, "User not found.", 404);
        }

        const updateData = {};
        
        if (typeof name === 'string' && name.trim()) {
            updateData.name = name.trim();
        }

        if (typeof phone === 'string' && phone.trim()) {
            updateData.phone = phone.trim();
        }

        if (phone && /^\d{10}$/.test(phone)) updateData.phone = phone;
        
        if (gender && ['male', 'female', 'other', 'none'].includes(gender.toLowerCase())) {
            updateData.gender = gender.toLowerCase();
        }
        
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            if (!isNaN(dob.getTime()) && dob <= new Date()) {
              updateData.dateOfBirth = dob;
            } else {
              return res.status(400).json({ message: "Invalid or future date of birth." });
            }
        }
        
        if (currentAddress) updateData.currentAddress = currentAddress;
        
        if (req.file && req.file.path) {
            updateData.image = req.file.path;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select("-password -__v");

        return sendSuccess(res, "User updated successfully.", updatedUser, 200);
    } catch (error) {
        console.error("Update user error:", error);
        return sendError(res, "Failed to update user. Please try again later.", 500);
    }
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return sendNotFoundError(res, "User not found.");
        }

        return sendSuccess(res, "User deleted successfully.", {
            id: deletedUser._id,
            name: deletedUser.name,
            email: deletedUser.email,
        });
    } catch (error) {
        console.error("Delete user error:", error);
        return sendError(res, "Failed to delete user. Please try again later.", 500);
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

// Send OTP for Password Reset (Forgot Password Flow)
const sendPasswordResetOtp = asyncHandler(async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return sendValidationError(res, "Email is required.");
        }
    
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, "No user found with this email.", 404);
        }
    
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
        const purpose = 1; // 1 = Forgot Password
    
        // Remove any existing OTP for this email and purpose
        // await SmtpOtp.deleteOne({ email, purpose });

        // Save or update OTP (upsert ensures only one record per email + purpose)
        await SmtpOtp.updateOne(
            { email, purpose },
            { 
                $set:{
                    userId: user._id, 
                    otp, 
                    createdAt: new Date() 
                },
            },
            { upsert: true }
        );

        // Send OTP via email
        const mailSubject = "Reset Your Password - OTP Verification Code";
        const mailHTML = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Hello ${user.name || "User"},</h2>
                <p>You have requested to reset your password. Please use the OTP below to proceed:</p>
                <div style="font-size: 24px; font-weight: bold; color: #2c3e50; margin: 15px 0;">
                    ${otp}
                </div>
                <p>This OTP is valid for <b>5 minutes</b>. If you did not request this, please ignore this email.</p>
                <br>
                <p>Regards,<br><b>EcommApp Team</b></p>
            </div>
        `;
        
        // Send OTP via email
        const mailOptions = {
            from: `"EcommApp" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: mailSubject,
            text: mailHTML
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email sending error:", error);
                // return sendError(res, "Failed to send OTP.",500);
            } else {
                console.log("Email sent:", info.messageId);
            }
            console.log("OTP sent to email successfuly.");
            // return sendSuccess(res, "OTP sent to email.", 200);
        });

        return sendSuccess(res, "OTP sent successfully to your registered email address.");
    } catch (error) {
        console.error("Error in sendPasswordResetOtp:", error);
        return sendError(res, "Something went wrong while sending OTP. Please try again.");
    }
});


// Varify Otp for password reset
const resetPasswordWithOtpOnly = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
  
    if (!email || !otp) {
      return sendValidationError(res, "Email and OTP are required.");
    }
  
    const purpose = 1; // Password reset
    const otpRecord = await SmtpOtp.findOne({ email, otp, purpose });
  
    if (!otpRecord) {
      return sendError(res, "Invalid or expired OTP.", 400);
    }
  
    const isExpired = (new Date() - otpRecord.createdAt) > 300000; // 5 minutes
    if (isExpired) {
      await SmtpOtp.deleteOne({ email, purpose });
      return sendError(res, "OTP has expired.", 400);
    }
  
    return sendSuccess(res, "Otp Varified successfully.");
});


// Reset password using OTP (for forgot password)
const resetPasswordWithOtp = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    if (!email || !otp || !newPassword) {
      return sendValidationError(res, "Email, OTP, and new password are required.");
    }
  
    const purpose = 1; // Password reset
    const otpRecord = await SmtpOtp.findOne({ email, otp, purpose });
  
    if (!otpRecord) {
      return sendError(res, "Invalid or expired OTP.", 400);
    }
  
    const isExpired = (new Date() - otpRecord.createdAt) > 300000; // 5 minutes
    if (isExpired) {
      await SmtpOtp.deleteOne({ email, purpose });
      return sendError(res, "OTP has expired.", 400);
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });
    await SmtpOtp.deleteOne({ email, purpose });
  
    return sendSuccess(res, "Password updated successfully.");
});

// Change password using old password (for logged-in users)
const changePasswordWithOldPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id; // assuming you extract user from JWT via middleware
    console.log("userId ==>", userId);
    console.log("oldPassword ==>", oldPassword);
    console.log("newPassword ==>", newPassword);

    if (!oldPassword || !newPassword) {
      return sendValidationError(res, "Old and new passwords are required.");
    }
  
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, "User not found.", 404);
    }
  
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return sendError(res, "Old password is incorrect.", 401);
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  
    return sendSuccess(res, "Password changed successfully.");
});
  

module.exports = { 
    getAllUsers, 
    getUserById, 
    registerUser, 
    verifyEmailWithOtp,
    resendEmailVerificationOtp,
    loginUser, 
    updateUser, 
    deleteUser,
    getAllOtps,
    sendPasswordResetOtp,
    resetPasswordWithOtpOnly,
    resetPasswordWithOtp,
    changePasswordWithOldPassword,
};