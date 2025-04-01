const express = require('express');
const router = express.Router();
const variantTypeController = require('../controllers/variantTypeController');

// Routes for Variant Type
router.get('/', variantTypeController.getAllVariantTypes);
router.get('/:id', variantTypeController.getVariantTypeById);
router.post('/', variantTypeController.createVariantType);
router.put('/:id', variantTypeController.updateVariantType);
router.delete('/:id', variantTypeController.deleteVariantType);

module.exports = router;