const express = require("express");
const router = express.Router();

const { authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProfile } = require("../middlewares/uploadMiddleware");
const userController = require('../controllers/userController');

// Routes for user
// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.post('/forget-password', userController.forgetPassword);
router.post('/verify-otp', userController.verifyOtp);
router.get('/get/all/otps', userController.getAllOtps);

// Protected Routes (Requires Authentication)
router.get('/' , userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/update/:id', authMiddleware, uploadProfile.single("image"), userController.updateUser);  // Using uploadProfile for profile image
router.delete('/:id', authMiddleware, userController.deleteUser);



module.exports = router;


