const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all addresses for the authenticated user
router.get('/', addressController.getUserAddresses);

// Get default address for the authenticated user
router.get('/default', addressController.getDefaultAddress);

// Get address by ID
router.get('/:addressId', addressController.getAddressById);

// Add new address
router.post('/', addressController.addAddress);

// Update address
router.put('/:addressId', addressController.updateAddress);

// Delete address (soft delete)
router.delete('/:addressId', addressController.deleteAddress);

// Set address as default
router.patch('/:addressId/default', addressController.setDefaultAddress);

module.exports = router; 