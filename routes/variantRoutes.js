const express = require('express');
const router = express.Router();

const variantController = require('../controllers/variantController');

// Routes for variant
router.get('/', variantController.getAllVariants);
router.get('/:id', variantController.getVariantById);
router.post('/', variantController.createVariant);
router.put('/:id', variantController.updateVariant);
router.delete('/:id', variantController.deleteVariant);

module.exports = router;