const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

// Allowed file types
const allowedFormats = ["jpeg", "jpg", "png", 'gif'];



// Setup multer with Cloudinary storage
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'user_profiles',
      allowedFormats,
      public_id: (req, file) => `image_${Date.now()}`,
    },
});

const uploadProfile = multer({ 
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}); // No storage needed for text-only form-data


// Configure Cloudinary Storage for Categories
const categoryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "categories", // Cloudinary folder
    format: async (req, file) => file.mimetype.split("/")[1], // Extract format
    public_id: (req, file) => `category_${Date.now()}`,
  },
});
const uploadCategory = multer({ 
    storage: categoryStorage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Configure Cloudinary Storage for Products
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Cloudinary folder
    format: async (req, file) => file.mimetype.split("/")[1], 
    public_id: (req, file) => `product_${Date.now()}`,
  },
});
const uploadProduct = multer({ storage: productStorage });

// Configure Cloudinary Storage for Posters
const posterStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posters", // Cloudinary folder
    format: async (req, file) => file.mimetype.split("/")[1], 
    public_id: (req, file) => `poster_${Date.now()}`,
  },
});
const uploadPosters = multer({ 
    storage: posterStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB in bytes
    },
});

module.exports = {
  uploadCategory,
  uploadProduct,
  uploadPosters,
  uploadProfile,
};
