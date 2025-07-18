
const Brand = require('../model/brandModel');
const Product = require('../model/productModel');

const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../helpers/responseUtil');

// Get all brands
const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find().populate('subcategoryId').sort({'subcategoryId': 1});
        res.json({ success: true, message: "Brands retrieved successfully.", data: brands });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data:null });
    }
};

// Get a brand by ID
const getBrandById = async (req, res) => {
    try {
        const brandID = req.params.id;
        const brand = await Brand.findById(brandID).populate('subcategoryId');
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found.", data:null });
        }
        res.json({ success: true, message: "Brand retrieved successfully.", data: brand });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data:null });
    }
};

// Create a new brand
const createBrand = async (req, res) => {
    const { name, subcategoryId } = req.body;
    if (!name || !subcategoryId) {
        return res.status(400).json({ success: false, message: "Name and subcategory ID are required.", data:null });
    }

    try {
        const brand = new Brand({ name, subcategoryId });
        const newBrand = await brand.save();
        res.json({ success: true, message: "Brand created successfully.", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data:null });
    }
};

// Update a brand
const updateBrand = async (req, res) => {
    const brandID = req.params.id;
    const { name, subcategoryId } = req.body;
    if (!name || !subcategoryId) {
        return res.status(400).json({ success: false, message: "Name and subcategory ID are required.", data:null });
    }

    try {
        const updatedBrand = await Brand.findByIdAndUpdate(brandID, { name, subcategoryId }, { new: true });
        if (!updatedBrand) {
            return res.status(404).json({ success: false, message: "Brand not found.", data:null });
        }
        res.json({ success: true, message: "Brand updated successfully.", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data:null });
    }
};

// Delete a brand
const deleteBrand = async (req, res) => {
    const brandID = req.params.id;
    try {
        // Check if any products reference this brand
        const products = await Product.find({ proBrandId: brandID });
        if (products.length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete brand. Products are referencing it.", data:null });
        }

        // If no products are referencing the brand, proceed with deletion
        const brand = await Brand.findByIdAndDelete(brandID);
        if (!brand) {
            return res.status(404).json({ success: false, message: "Brand not found.", data:null });
        }
        res.json({ success: true, message: "Brand deleted successfully.", data:null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, data:null });
    }
};


module.exports = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
