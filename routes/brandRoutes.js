const express = require('express');
const router = express.Router();

const brandController = require('../controllers/brandController'); // Import controller methods

// Routes for brand
// Public routes
router.post('/', brandController.createBrand);

// Protected routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);
router.put('/:id', brandController.updateBrand);
router.delete('/:id', brandController.deleteBrand);

module.exports = router;
