const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const SmtpOtp = require('../model/smtpSetupModel');

const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../helpers/responseUtil');
const { generateAndStoreOtp } = require('../helpers/otpUtil');
const { sendMail } = require('../config/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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

        // Generate 4-digit OTP (purpose = 0 for registration) and purpose = 1 for Forgot Password
        const otp = await generateAndStoreOtp(email, 0);
        
        // Email content
        const mailOptions = {
            to: email,
            subject: 'Welcome to EcommApp – Verify Your Email',
            html: `
                <div style="max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
                    <h2 style="color: #333;">Hi ${name},</h2>
                    <p style="font-size: 16px; color: #555;">
                        Thank you for signing up with <strong>EcommApp</strong>! To get started, please verify your email address.
                    </p>
                    <p style="font-size: 16px; color: #555;">
                        Use the OTP below to complete your registration:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; padding: 12px 24px; font-size: 28px; font-weight: bold; color: #ffffff; background-color: #28a745; border-radius: 6px;">
                        ${otp}
                        </div>
                    </div>

                    <p style="font-size: 14px; color: #888;">
                        This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
                    </p>
                    <p style="font-size: 14px; color: #888;">
                        If you didn’t create this account, please ignore this email or contact our support.
                    </p>

                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />

                    <p style="font-size: 14px; color: #999;">
                        Need help? Contact us at <a href="mailto:support@ecommapp.com" style="color: #007bff;">support@ecommapp.com</a>
                    </p>

                    <p style="font-size: 14px; color: #999;">
                        Cheers,<br/>
                        <strong>EcommApp Team</strong>
                    </p>
                </div>
            `
        };
        
        // Attempt to send OTP email
        try {
            await sendMail(mailOptions);
            console.log("OTP email sent successfully.");
        } catch (err) {
            console.error("Failed to send OTP email:", err);

            // Rollback Registration process: Delete user and OTP if email fails
            await User.deleteOne({ email });
            await SmtpOtp.deleteOne({ email, purpose: 0 });

            return sendError(res, "Failed to send verification email. Registration canceled. Please try again.");
        }
        
        // Return success message to the client
        const newUser = await User.findOne({ email }).select('-password -__v');
        return sendSuccess(res, "User registered successfully. Check your email to varify you account.", newUser, 201);
    
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
  
    const user = await User.findOne({ email }).select('-password -__v');
    return sendSuccess(res, "Email verified successfully. You can now log in.", user);
});

// Resend OTP for email verification
const resendEmailVerificationOtp = asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      const purpose = 0; // 0 for email verification and 1 for forgot password
  
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
  
      const mailOptions = {
        to: email,
        subject: "Resend: Verify Your Email - OTP Code",
        html: `
          <div style="max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
            <h2 style="color: #333;">Hello ${user.name || "User"},</h2>
            <p style="font-size: 16px; color: #555;">
              We received a request to verify your email address for your EcommApp account.
            </p>
            <p style="font-size: 16px; color: #555;">
              Please use the following One-Time Password (OTP) to complete your verification:
            </p>
      
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; padding: 12px 24px; font-size: 28px; font-weight: bold; color: #ffffff; background-color: #007bff; border-radius: 6px;">
                ${otp}
              </div>
            </div>
      
            <p style="font-size: 14px; color: #888;">
              This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.
            </p>
            <p style="font-size: 14px; color: #888;">
              If you did not request this verification, please ignore this email or contact our support team.
            </p>
      
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
      
            <p style="font-size: 14px; color: #999;">
              Need help? Contact us at <a href="mailto:support@ecommapp.com" style="color: #007bff;">support@ecommapp.com</a>
            </p>
      
            <p style="font-size: 14px; color: #999;">
              Best regards,<br/>
              <strong>EcommApp Team</strong>
            </p>
          </div>
        `
      };      
  
      await sendMail(mailOptions);
      return sendSuccess(res, "A new OTP has been sent to your email for account verification. Please check your inbox.");
  
    } catch (error) {
      console.error("Error resending email verification OTP:", error);
      return sendError(res, "There was an issue resending the OTP for your account verification. Please try again later.");
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
        const user = await User.findOne({ email: email.toLowerCase() });

        // Check if the user exists
        if (!user) {
            return sendError(res, "No account found with this email address.", 401);
        }
          
        // Check if user is verified
        if (user.verfied == 0) {
            return sendError(res, "Your account is not verified. Please check your email for the OTP.", 403);
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return sendError(res, "Invalid email or password.", 401);
        
        if (user.status === "banned" || user.status === "blocked") {
          return sendError(res, "Your account is restricted.", 403);
        }
        
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
        
        // Validate and update fields
        if (name && typeof name === 'string' && name.trim()) {
            updateData.name = name.trim();
        }

        if (phone && typeof phone === 'string' && /^\d{10}$/.test(phone.trim())) {
            updateData.phone = phone.trim();
        }

        if (gender && ['male', 'female', 'other', 'none'].includes(gender.trim().toLowerCase())) {
            updateData.gender = gender.trim().toLowerCase();
        }
        
        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            console.log("dob ==> ",dob);
            if (!isNaN(dob.getTime()) && dob <= new Date()) {
                updateData.dateOfBirth = dob;
            } else {
                return sendError(res, "Invalid or future date of birth.", 400);
            }
        }
        
        if (currentAddress && typeof currentAddress === 'string' && currentAddress.trim()) {
            updateData.currentAddress = currentAddress.trim();
        }
        
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


// Send OTP for Password Reset (Forgot Password Flow)
const resetPasswordSendOtp = asyncHandler(async (req, res) => {
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
        const purpose = 1; // 1 for Forgot Password and 0 for registration
    
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
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f4f4f4; border-radius: 8px; border: 1px solid #ddd;">
                <h2 style="color: #2c3e50; font-size: 24px;">Hello ${user.name || "User"},</h2>
                <p style="font-size: 16px; color: #555;">You have requested to reset your password. Please use the OTP below to proceed with resetting your password:</p>
                <div style="font-size: 24px; font-weight: bold; color: #2c3e50; margin: 15px 0; text-align: center;">
                    ${otp}
                </div>
                <p style="font-size: 16px; color: #555;">This OTP is valid for <b>5 minutes</b>. If you did not request this, please ignore this email.</p>
                <br>
                <p style="font-size: 16px; color: #555;">If you need further assistance, feel free to contact our support team.</p>
                <br>
                <p style="font-size: 16px; color: #555;">Regards,<br><b>EcommApp Team</b></p>
                <footer style="font-size: 14px; color: #999; text-align: center;">
                    <p>This email was sent to you because you requested a password reset. If you did not request this, please disregard this email.</p>
                </footer>
            </div>
        `;

        const mailOptions = {
            to: email,
            subject: mailSubject,
            html: mailHTML
        };

        // Send OTP
        await sendMail(mailOptions);
        console.log("OTP sent to your email for password reset. Please check your inbox.");

        return sendSuccess(res, "OTP sent to your email for password reset. Please check your inbox.");
    } catch (error) {
        console.error("Error in resetPasswordSendOtp:", error);
        return sendError(res, "There was an issue sending the OTP for your password reset. Please try again later.");
    }
});


// Varify Otp for password reset
const resetPasswordVerifyOtp = asyncHandler(async (req, res) => {
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
const changePasswordUsingOldPassword = asyncHandler(async (req, res) => {
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
    getUserById, 
    registerUser, 
    verifyEmailWithOtp,
    resendEmailVerificationOtp,
    loginUser, 
    updateUser, 
    deleteUser,
    changePasswordUsingOldPassword,
    resetPasswordSendOtp,
    resetPasswordVerifyOtp,
    resetPasswordWithOtp,
};