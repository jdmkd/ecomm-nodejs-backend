const express = require('express');
const router = express.Router();
const uploadCloudinary = require('../middlewares/uploadMiddleware')
const categoryController = require('../controllers/categoryController'); // Import controller methods

// Routes for category
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', uploadCloudinary.uploadCategory.single('image'), categoryController.createCategory);
router.put('/:id', uploadCloudinary.uploadCategory.single('image'), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
