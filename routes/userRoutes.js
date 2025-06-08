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

// TODO: This endpoint exposes sensitive OTP data and should be removed or secured in production.
// OTP verification should always be done by sending the user's email and the OTP to the backend.
// The backend should then validate and respond whether the OTP is valid or not — without exposing stored OTPs directly.
router.get("/get/all/otps", userController.getAllOtps);

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

// Protected Routes (Requires Authentication)
// TODO: In future, restrict this getAllUsers route to admin users only
router.get("/", userController.getAllUsers);
router.get("/:id", authMiddleware, userController.getUserById);
router.put(
  "/update/:id",
  authMiddleware,
  uploadProfile.single("image"),
  userController.updateUser
); // Using uploadProfile for profile image
router.delete("/:id", authMiddleware, userController.deleteUser);

module.exports = router;
