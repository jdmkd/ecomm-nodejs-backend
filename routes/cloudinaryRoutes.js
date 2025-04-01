const express = require("express");
const { uploadCategory, uploadProduct, uploadPosters } = require("../middlewares/uploadMiddleware");

const router = express.Router();

const cloudinaryfileUploadController = require("../controllers/cloudinaryfileUploadController"); // Import controller methods

const uploadCloudinary = require('../middlewares/uploadMiddleware')

// Routes for cloudinary fileUpload
router.post("/user_profiles", uploadCloudinary.uploadProfile.single('image'), cloudinaryfileUploadController.uploadUserProfile);
router.post("/category", uploadCloudinary.uploadCategory.single('image'), cloudinaryfileUploadController.uploadCategoryImage);
router.post("/product", uploadCloudinary.uploadProduct.single('image'), cloudinaryfileUploadController.uploadProductImage);
router.post("/poster", uploadCloudinary.uploadPosters.single('image'), cloudinaryfileUploadController.uploadPosterImage);

module.exports = router;
