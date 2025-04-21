const multer = require('multer');
const uploadCloudinary = require('../middlewares/uploadMiddleware')
const Product = require('../model/productModel');
const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../helpers/responseUtil');
const { validateNumberInput } = require('../helpers/validatorUtil');

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        .populate('proCategoryId', 'id name')
        .populate('proSubCategoryId', 'id name')
        .populate('proBrandId', 'id name')
        .populate('proVariantTypeId', 'id type')
        .populate('proVariantId', 'id name');
        res.json({ success: true, message: "Products retrieved successfully.", data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a product by ID
const getProductById = async (req, res) => {
    try {
        const productID = req.params.id;
        const product = await Product.findById(productID)
            .populate('proCategoryId', 'id name')
            .populate('proSubCategoryId', 'id name')
            .populate('proBrandId', 'id name')
            .populate('proVariantTypeId', 'id name')
            .populate('proVariantId', 'id name');
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.json({ success: true, message: "Product retrieved successfully.", data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



// Create a new product with multiple images
const createProduct = async (req, res) => {
    try {
        const {
          name,
          description,
          quantity,
          price,
          offerPrice,
          proCategoryId,
          proSubCategoryId,
          proBrandId,
          proVariantTypeId,
          proVariantId
        } = req.body;
  
        if (!name || !quantity || !price || !proCategoryId || !proSubCategoryId) {
            return sendValidationError(res, "Required fields are missing.");
        }
        
        // Validate Price
        const priceValidation = validateNumberInput(price, 1, 1000000);
        if (!priceValidation.isValid) {
            return res.status(400).json({ message: priceValidation.message });
        }

        // Validate offerPrice (if provided)
        let offerPriceValidation = null;
        if (offerPrice !== undefined) {
            offerPriceValidation = validateNumberInput(offerPrice, 0, priceValidation.value); // Offer price should not exceed the original price
            if (!offerPriceValidation.isValid) {
                return res.status(400).json({ message: offerPriceValidation.message });
            }
        }

        // Validate quantity
        const quantityValidation = validateNumberInput(quantity, 0, 100000); // Quantity limit
        if (!quantityValidation.isValid) {
            return res.status(400).json({ message: quantityValidation.message });
        }
  
        const imageUrls = [];
        const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
  
        // fields.forEach((field, index) => {
        //   if (req.files[field] && req.files[field].length > 0) {
        //     const file = req.files[field][0];
        //     imageUrls.push({
        //       image: index + 1,
        //       url: file.path // Cloudinary URL
        //     });
        //   }
        // });

        for (const field of fields) {
            if (req.files[field] && req.files[field].length > 0) {
                const file = req.files[field][0];
                const cloudinaryUrl = file?.path; // Cloudinary URL from the uploaded file
                imageUrls.push({
                    image: fields.indexOf(field) + 1, // Incrementing image index
                    url: cloudinaryUrl
                });
            }
        }
  
        const newProduct = new Product({
          name,
          description,
          quantity,
          price,
          offerPrice,
          proCategoryId,
          proSubCategoryId,
          proBrandId,
          proVariantTypeId,
          proVariantId,
          images: imageUrls
        });
  
        await newProduct.save();
        return sendSuccess(res, "Product created successfully.", newProduct, 201);
    } catch (error) {
        // Multer-specific error handler
        if (error instanceof multer.MulterError) {
          if (error.code === 'LIMIT_FILE_SIZE') {
            error.message = 'File size is too large. Maximum filesize is 5MB per image.';
          }
          console.error(`Multer error during product upload: ${error.message}`);
          return sendError(res, error.message);
        }
  
        console.error("Error creating product:", error);
        return sendError(res, error.message);
    }
};




// Update a product
const updateProduct = async (req, res) => {
    const productId = req.params.id;

    // Handle uploads for 5 image fields using Cloudinary
    await uploadCloudinary.uploadProduct.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
        { name: 'image3', maxCount: 1 },
        { name: 'image4', maxCount: 1 },
        { name: 'image5', maxCount: 1 }
    ])(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                err.message = 'File size is too large. Maximum filesize is 5MB per image.';
            }
            console.log(`Update product (multer): ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            console.log(`Update product (upload): ${err.message}`);
            return res.status(400).json({ success: false, message: err.message });
        }

        try {
            const {
                name, description, quantity,
                price, offerPrice,
                proCategoryId, proSubCategoryId,
                proBrandId, proVariantTypeId, proVariantId
            } = req.body;

            // Validate Price
            if (price !== undefined) {
                const priceValidation = validateNumberInput(price, 1, 1000000);
                if (!priceValidation.isValid) {
                    return res.status(400).json({ message: priceValidation.message });
                }
            }

            // Validate offerPrice (if provided)
            let offerPriceValidation = null;
            if (offerPrice !== undefined) {
                offerPriceValidation = validateNumberInput(offerPrice, 0, price); // Offer price should not exceed the original price
                if (!offerPriceValidation.isValid) {
                    return res.status(400).json({ message: offerPriceValidation.message });
                }
            }

            // Validate quantity
            if (quantity !== undefined) {
                const quantityValidation = validateNumberInput(quantity, 0, 100000);
                if (!quantityValidation.isValid) {
                    return res.status(400).json({ message: quantityValidation.message });
                }
            }
            
            const productToUpdate = await Product.findById(productId);
            if (!productToUpdate) {
                return res.status(404).json({ success: false, message: "Product not found." });
            }

            // Update textual fields if provided
            productToUpdate.name = name || productToUpdate.name;
            productToUpdate.description = description || productToUpdate.description;
            productToUpdate.price = price || productToUpdate.price;
            productToUpdate.offerPrice = offerPrice || productToUpdate.offerPrice;
            productToUpdate.quantity = quantity || productToUpdate.quantity;

            // if (price !== undefined) productToUpdate.price = price;
            // if (offerPrice !== undefined) productToUpdate.offerPrice = offerPrice;
            // if (quantity !== undefined) productToUpdate.quantity = quantity;

            // productToUpdate.price = price !== undefined ? parsedPrice : productToUpdate.price;
            // productToUpdate.offerPrice = offerPrice !== undefined ? parsedOfferPrice : productToUpdate.offerPrice;
            // productToUpdate.quantity = quantity !== undefined ? parsedQuantity : productToUpdate.quantity;
            productToUpdate.proCategoryId = proCategoryId || productToUpdate.proCategoryId;
            productToUpdate.proSubCategoryId = proSubCategoryId || productToUpdate.proSubCategoryId;
            productToUpdate.proBrandId = proBrandId || productToUpdate.proBrandId;
            productToUpdate.proVariantTypeId = proVariantTypeId || productToUpdate.proVariantTypeId;
            productToUpdate.proVariantId = proVariantId || productToUpdate.proVariantId;

            // Update image fields if present
            // const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];
            // fields.forEach(async (field, index) => {
            //     if (req.files[field] && req.files[field].length > 0) {
            //         const file = req.files[field][0];
            //         const cloudinaryUrl = file?.path; // Cloudinary gives us secure URL in `path`
            //         const imageIndex = index + 1;

            //         // Check if already exists
            //         const existingImage = await productToUpdate.images.find(img => img.image === imageIndex);
            //         if (existingImage) {
            //             existingImage.url = cloudinaryUrl;
            //         } else {
            //             await productToUpdate.images.push({ image: imageIndex, url: cloudinaryUrl });
            //         }
            //     }
            // });

            const fields = ['image1', 'image2', 'image3', 'image4', 'image5'];

            for (let index = 0; index < fields.length; index++) {
                const field = fields[index];

                if (req.files[field] && req.files[field].length > 0) {
                    const file = req.files[field][0];
                    const cloudinaryUrl = file?.path; // Cloudinary gives us secure URL in `path`
                    const imageIndex = index + 1;

                    // Check if the image already exists
                    const existingImage = await productToUpdate.images.find(img => img.image === imageIndex);
                    if (existingImage) {
                        existingImage.url = cloudinaryUrl;
                    } else {
                        // Push the new image to the images array
                        productToUpdate.images.push({ image: imageIndex, url: cloudinaryUrl });
                    }
                }
            }

            await productToUpdate.save();
            return res.json({ success: true, message: "Product updated successfully.",data: productToUpdate });

        } catch (error) {
            console.error("Error updating product:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    });
};

// Delete a product
const deleteProduct = async (req, res) => {
    const productID = req.params.id;
    try {
        const product = await Product.findByIdAndDelete(productID);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        res.json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};