const Category = require('../model/categoryModel');
const SubCategory = require('../model/subCategoryModel');
const Product = require('../model/productModel');
const multer = require('multer');
const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../helpers/responseUtil');


// Get all categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        return sendSuccess(res, "Categories retrieved successfully.", categories);
    } catch (error) {
        return sendError(res, error.message);
    }
};

// Get a category by ID
const getCategoryById = async (req, res) => {
    try {
        const categoryID = req.params.id;
        const category = await Category.findById(categoryID);
        if (!category) {
            return sendNotFoundError(res, "Category not found.");
        }
        return sendSuccess(res, "Category retrieved successfully.", category);
    } catch (error) {
        return sendError(res, error.message);
    }
};


// Create a new category with image upload
const createCategory = 
    // uploadCloudinary.uploadCategory.single('image'), // cloudinary multer for 'image' field
    async (req, res) => {
      try {
        const { name } = req.body;
  
        // Validate input
        if (!name || name.trim() === '') {
          return sendValidationError(res, 'Category name is required.');
        }
  
        // Check if file uploaded and get Cloudinary URL
        let imageUrl = null;
        if (req.file && req.file.path) {
          imageUrl = req.file.path; // Cloudinary gives the secure URL in `.path`
        }
  
        // Create and save new category
        const newCategory = new Category({
          name,
          image: imageUrl,
        });
  
        await newCategory.save();
        return sendSuccess(res, 'Category created successfully.', newCategory, 201);
      } catch (err) {
        // Proper multer error handling
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            err.message = 'File size is too large. Maximum allowed is 5MB.';
          }
          console.error('Multer error:', err);
          return sendError(res, err.message);
        } else {
          // Any other error (Cloudinary, DB, etc.)
          console.error('Category creation error:', err);
          return sendError(res, err.message);
        }
      }
};


// Update a category
const updateCategory = 
    // uploadCloudinary.uploadCategory.single('image'), // Use Cloudinary middleware
    async (req, res) => {
      try {
        const categoryID = req.params.id;
  
        // Handle Multer/Cloudinary upload errors
        if (req.fileValidationError) {
          return sendError(res, req.fileValidationError);
        }
  
        const { name } = req.body;
  
        // Optional image update
        let imageUrl;
        if (req.file && req.file.path) {
          imageUrl = req.file.path; // Cloudinary secure URL
        }
  
        // Build update object
        const updateData = {};
        if (name && name.trim() !== '') updateData.name = name;
        if (imageUrl) updateData.image = imageUrl;
  
        if (Object.keys(updateData).length === 0) {
          return sendValidationError(res, 'No valid fields provided for update.');
        }
  
        const updatedCategory = await Category.findByIdAndUpdate(
          categoryID,
          { $set: updateData },
          { new: true, runValidators: true }
        );
  
        if (!updatedCategory) {
          return sendNotFoundError(res, 'Category not found.');
        }
  
        return sendSuccess(res, 'Category updated successfully.', updatedCategory, 200);
      } catch (err) {
        // Handle Multer errors specifically
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            err.message = 'File size is too large. Maximum allowed is 5MB.';
          }
          console.error('Multer error during category update:', err);
          return sendError(res, err.message);
        }
  
        console.error('Update category error:', err);
        return sendError(res, err.message);
      }
};


// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const categoryID = req.params.id;

        // Check if any subcategories reference this category
        const subcategories = await SubCategory.find({ categoryId: categoryID });
        if (subcategories.length > 0) {
            return sendValidationError(res, "Cannot delete category. Subcategories are referencing it.");
        }

        // Check if any products reference this category
        const products = await Product.find({ proCategoryId: categoryID });
        if (products.length > 0) {
            return sendValidationError(res, "Cannot delete category. Products are referencing it.");
        }

        // If no subcategories or products are referencing the category, proceed with deletion
        const category = await Category.findByIdAndDelete(categoryID);
        if (!category) {
            return sendNotFoundError(res, "Category not found.");
        }
        return sendSuccess(res, "Category deleted successfully.");
    } catch (error) {
        return sendError(res, error.message);
    }
};


module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};