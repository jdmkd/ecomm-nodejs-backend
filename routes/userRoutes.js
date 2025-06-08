const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middlewares/authMiddleware");
const { uploadProfile } = require("../middlewares/uploadMiddleware");
const userController = require("../controllers/userController");

// Public Routes
router.post("/register", userController.registerUser);
router.post("/verify-otp", userController.verifyEmailWithOtp); // Verify email OTP (registration flow)
router.post(
  "/email/resend/verify-otp",
  userController.resendEmailVerificationOtp
); // Resend Email Verification OTP (after 5 minutes expiry)

router.post("/login", userController.loginUser);

router.post("/password/reset/send-otp", userController.resetPasswordSendOtp); // Send OTP to email for password reset
router.post(
  "/password/reset/verify-otp-only",
  userController.resetPasswordVerifyOtp
); // For password reset with email otp
router.post("/password/reset/verify-otp", userController.resetPasswordWithOtp); // For password reset with email otp

// ✅ Authenticated Routes
// Change password using old password (for only logged-in users).
router.put(
  "/password/change/:id",
  userController.changePasswordUsingOldPassword
);

router.get("/:id", authMiddleware, userController.getUserById);
router.put(
  "/update/:id",
  authMiddleware,
  uploadProfile.single("image"),
  userController.updateUser
); // Using uploadProfile for profile image
router.delete("/:id", authMiddleware, userController.deleteUser);

module.exports = router;
