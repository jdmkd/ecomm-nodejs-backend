const express = require("express");
const router = express.Router();

// Import route modules
router.use("/cloudinary", require("./cloudinaryRoutes"));
router.use("/brands", require("./brandRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/subCategories", require("./subCategoryRoutes"));
router.use("/variantTypes", require("./variantTypeRoutes"));
router.use("/variants", require("./variantRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/couponCodes", require("./couponCodeRoutes"));
router.use("/posters", require("./posterRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/payment", require("./paymentRoutes"));
router.use("/notification", require("./notificationRoutes"));

module.exports = router;
