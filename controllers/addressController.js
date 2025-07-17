const asyncHandler = require('express-async-handler');
const Address = require('../model/addressModel');
const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../helpers/responseUtil');

// Get all addresses for a user
const getUserAddresses = asyncHandler(async (req, res) => {
    try {
        // const userId = req.params.userId;
        
        const addresses = await Address.find();

        if (!addresses) {
            return sendNotFoundError(res, "No address found.");
        }
        return sendSuccess(res, "Addresses retrieved successfully.", addresses);
    } catch (error) {
        console.error("Get user addresses error:", error);
        return sendError(res, "Failed to retrieve addresses.", 500);
    }
});

// Get default address for a user
const getDefaultAddress = asyncHandler(async (req, res) => {
    try {
        const userId = req.params.userId;
        const defaultAddress = await Address.getDefaultAddress(userId);

        if (!defaultAddress) {
            return sendNotFoundError(res, "No default address found.");
        }
        
        return sendSuccess(res, "Default address retrieved successfully.", defaultAddress);
    } catch (error) {
        console.error("Get default address error:", error);
        return sendError(res, "Failed to retrieve default address.", 500);
    }
});

// Add new address
const addAddress = asyncHandler(async (req, res) => {
    try {
        const {
            userID,
            addressType,
            isDefault,
            fullName,
            phone,
            street,
            apartment,
            city,
            state,
            postalCode,
            country,
            landmark,
            instructions
        } = req.body;

        // Validation
        if (!fullName || !phone || !street || !city || !state || !postalCode) {
            return sendValidationError(res, "Full name, phone, street, city, state, and postal code are required.");
        }

        // Validate phone number
        if (!/^\d{10,15}$/.test(phone)) {
            return sendValidationError(res, "Please enter a valid phone number.");
        }

        // Create address
        const addressData = {
            userID,
            addressType: addressType || 'home',
            isDefault: isDefault || false,
            fullName,
            phone,
            street,
            apartment,
            city,
            state,
            postalCode,
            country: country || 'India',
            landmark,
            instructions
        };
        
        const newAddress = new Address(addressData);      
        await newAddress.save();

        return sendSuccess(res, "Address added successfully.", newAddress, 201);
    } catch (error) {
        console.error("Add address error:", error);
        return sendError(res, "Failed to add address.", 500);
    }
});

// Update address
const updateAddress = asyncHandler(async (req, res) => {
    try {
        const addressId = req.params.addressId;

        const {
            userID,
            addressType,
            isDefault,
            fullName,
            phone,
            street,
            apartment,
            city,
            state,
            postalCode,
            country,
            landmark,
            instructions
        } = req.body;

        // Check if address exists and belongs to user
        const existingAddress = await Address.findOne({ _id: addressId, userID });
        if (!existingAddress) {
            return sendNotFoundError(res, "Address not found.");
        }

        // Validation
        if (fullName && !fullName.trim()) {
            return sendValidationError(res, "Full name cannot be empty.");
        }

        if (phone && !/^\d{10,15}$/.test(phone)) {
            return sendValidationError(res, "Please enter a valid phone number.");
        }

        // Update address
        const updateData = {};
        if (addressType) updateData.addressType = addressType;
        if (isDefault !== undefined) updateData.isDefault = isDefault;
        if (fullName) updateData.fullName = fullName;
        if (phone) updateData.phone = phone;
        if (street) updateData.street = street;
        if (apartment !== undefined) updateData.apartment = apartment;
        if (city) updateData.city = city;
        if (state) updateData.state = state;
        if (postalCode) updateData.postalCode = postalCode;
        if (country) updateData.country = country;
        if (landmark !== undefined) updateData.landmark = landmark;
        if (instructions !== undefined) updateData.instructions = instructions;

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            updateData,
            { new: true, runValidators: true }
        );

        return sendSuccess(res, "Address updated successfully.", updatedAddress);
    } catch (error) {
        console.error("Update address error:", error);
        return sendError(res, "Failed to update address.", 500);
    }
});

// Delete address (soft delete)
const deleteAddress = asyncHandler(async (req, res) => {
    try {
        const addressId = req.params.addressId;
        // const userID = req.body.userID || '';

        // Check if address exists and belongs to user
        const existingAddress = await Address.findOne({ _id: addressId });
        if (!existingAddress) {
            return sendNotFoundError(res, "Address not found.");
        }

        // Soft delete by setting isActive to false
        await Address.findByIdAndUpdate(addressId, { isActive: false });

        return sendSuccess(res, "Address deleted successfully.");
    } catch (error) {
        console.error("Delete address error:", error);
        return sendError(res, "Failed to delete address.", 500);
    }
});

// Set address as default
const setDefaultAddress = asyncHandler(async (req, res) => {
    try {
        
        const addressId = req.params.addressId;
        const userID = req.body.userID;

        // Check if address exists and belongs to user
        const existingAddress = await Address.findOne({ _id: addressId, userID, isActive: true });
        if (!existingAddress) {
            return sendNotFoundError(res, "Address not found.");
        }

        // Set as default
        await existingAddress.setAsDefault();

        return sendSuccess(res, "Default address updated successfully.", existingAddress);
    } catch (error) {
        console.error("Set default address error:", error);
        return sendError(res, "Failed to set default address.", 500);
    }
});

// Get address by ID
const getAddressById = asyncHandler(async (req, res) => {
    try {
        const addressId = req.params.addressId;
        const userId = req.user.id;

        const address = await Address.findOne({ _id: addressId, userID: userId, isActive: true });
        
        if (!address) {
            return sendNotFoundError(res, "Address not found.");
        }

        return sendSuccess(res, "Address retrieved successfully.", address);
    } catch (error) {
        console.error("Get address by ID error:", error);
        return sendError(res, "Failed to retrieve address.", 500);
    }
});

const getAllAddressByUserID = asyncHandler(async (req, res) => {
    try {
        const userID = req.params.userId;
        
        const address = await Address.find({ userID: userID, isActive: true });
        
        if (!address) {
            return sendNotFoundError(res, "Address not found.");
        }

        return sendSuccess(res, "Address retrieved successfully.", address);
    } catch (error) {
        console.error("Get address by ID error:", error);
        return sendError(res, "Failed to retrieve address.", 500);
    }
});

module.exports = {
    getUserAddresses,
    getDefaultAddress,
    getAddressById,
    getAllAddressByUserID,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
}; 