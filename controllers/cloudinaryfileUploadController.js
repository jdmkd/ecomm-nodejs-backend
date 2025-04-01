const { uploadProfile, uploadCategory, uploadProduct, uploadPosters } = require('../middlewares/uploadMiddleware');

// Helper function to handle file uploads
const uploadImage = (res) => async (req, res) => {
  console.log("req.file  ==> ",req.file);
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  res.json({ success: true, imageUrl: req.file.path });
};

// Upload for user profile image
const uploadUserProfile = uploadImage(uploadProfile.single("image"), "user_profiles");

// Upload for category image
const uploadCategoryImage = uploadImage(uploadCategory.single("image"), "category");

// Upload for product image
const uploadProductImage = uploadImage(uploadProduct.single("image"), "product");

// Upload for poster image
const uploadPosterImage = uploadImage(uploadPosters.single("image"), "poster");

module.exports = {
  uploadUserProfile,
  uploadCategoryImage,
  uploadProductImage,
  uploadPosterImage
};
