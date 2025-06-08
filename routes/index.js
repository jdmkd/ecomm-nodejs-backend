const express = require("express");
const router = express.Router();

// Import route modules
// default route or api endpoint for Health check
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API working successfully",
    data: null,
  });
});
router.use("/cloudinary", require("./cloudinaryRoutes"));
router.use("/brands", require("./brandRoutes"));
router.use("/categories", require("./categoryRoutes"));
router.use("/subCategories", require("./subCategoryRoutes"));
router.use("/variantTypes", require("./variantTypeRoutes"));
router.use("/variants", require("./variantRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/couponCodes", require("./couponCodeRoutes"));
router.use("/posters", require("./posterRoutes"));
router.use("/orders", require("./orderRoutes"));
router.use("/payment", require("./paymentRoutes"));
router.use("/notification", require("./notificationRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/admin", require("./adminRoutes"));

module.exports = router;
