const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require authentication


// Get all addresses for the authenticated user
router.get('/', addressController.getUserAddresses);

// Get default address for the authenticated user
router.get('/default', addressController.getDefaultAddress);

router.use(authMiddleware)
// Get address by ID
router.get('/getAddressById/:addressId', addressController.getAddressById);

// Get address by userID
router.get('/getAllAddressByUserID/:userId', addressController.getAllAddressByUserID);

// Add new address
router.post('/', addressController.addAddress);

// Update address
router.put('/:addressId', addressController.updateAddress);

// Delete address (soft delete)
router.delete('/:addressId', addressController.deleteAddress);

// Set address as default
router.put('/setDefaultAddress/:addressId', addressController.setDefaultAddress);


module.exports = router; 