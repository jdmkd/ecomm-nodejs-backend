const express = require('express');
const router = express.Router();

const subCategoryController = require('../controllers/subCategoryController');

// Routes for sub-categories
router.get('/', subCategoryController.getAllSubCategories);
router.get('/:id', subCategoryController.getSubCategoryById);
router.post('/', subCategoryController.createSubCategory);
router.put('/:id', subCategoryController.updateSubCategory);
router.delete('/:id', subCategoryController.deleteSubCategory);

module.exports = router;