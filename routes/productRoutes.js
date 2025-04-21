const express = require('express');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const uploadCloudinary = require('../middlewares/uploadMiddleware')
const productController = require('../controllers/productController');
const asyncMulter = require('../helpers/asyncMulterUtil');

const router = express.Router();

// Routes for product
router.get('/', asyncHandler(productController.getAllProducts));
router.get('/:id', asyncHandler(productController.getProductById));
router.post(
    '/',
    asyncMulter(uploadCloudinary.uploadProduct.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
        { name: 'image5', maxCount: 1 }
    ])),
    asyncHandler(productController.createProduct)
);
router.put('/:id', asyncHandler(productController.updateProduct));
router.delete('/:id', asyncHandler(productController.deleteProduct));

module.exports = router;
