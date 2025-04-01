const SubCategory = require('../model/subCategoryModel');
const Brand = require('../model/brandModel');
const Product = require('../model/productModel');
const asyncHandler = require('express-async-handler');

// Get all sub-categories
const getAllSubCategories = asyncHandler(async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('categoryId').sort({'categoryId': 1});
        res.json({ success: true, message: "Sub-categories retrieved successfully.", data: subCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get a single sub-category by ID
const getSubCategoryById = asyncHandler(async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id).populate('categoryId');
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found." });
        }
        res.json({ success: true, message: "Sub-category retrieved successfully.", data: subCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create a new sub-category
const createSubCategory = asyncHandler(async (req, res) => {
    console.log("req.body ==> ",req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: "Request body is missing." });
    }
    
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
        return res.status(400).json({ success: false, message: "Name and category ID are required." });
    }

    try {
        const subCategory = new SubCategory({ name, categoryId });
        const newSubCategory = await subCategory.save();
        res.json({ success: true, message: "Sub-category created successfully.", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update a sub-category
const updateSubCategory = asyncHandler(async (req, res) => {
    const { name, categoryId } = req.body;
    console.log("req.body ==> ",req.body);
    if (!name || !categoryId) {
        return res.status(400).json({ success: false, message: "Name and category ID are required." });
    }

    try {
        const updatedSubCategory = await SubCategory.findByIdAndUpdate(req.params.id, { name, categoryId }, { new: true });
        if (!updatedSubCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found." });
        }
        res.json({ success: true, message: "Sub-category updated successfully.", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete a sub-category
const deleteSubCategory = asyncHandler(async (req, res) => {
    try {
        const subCategoryID = req.params.id;

        // Check if any brand is associated with the sub-category
        const brandCount = await Brand.countDocuments({ subcategoryId: subCategoryID });
        if (brandCount > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete sub-category. It is associated with one or more brands." });
        }

        // Check if any products reference this sub-category
        const productCount = await Product.countDocuments({ proSubCategoryId: subCategoryID });
        if (productCount > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete sub-category. Products are referencing it." });
        }

        // Delete sub-category if not referenced
        const subCategory = await SubCategory.findByIdAndDelete(subCategoryID);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: "Sub-category not found." });
        }

        res.json({ success: true, message: "Sub-category deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


module.exports = {
    getAllSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
};
